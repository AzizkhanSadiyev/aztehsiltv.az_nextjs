"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import {
  FormLayout,
  FormGrid,
  FormMain,
  FormSidebar,
  FormSection,
  FormField,
  FormActions,
  Input,
  Switch,
} from "@/components/admin/ui/FormLayout";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X, Search, Folder } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { defaultLocale, locales } from "@/i18n/config";
import { cn } from "@/lib/utils";
import { slugify } from "@/lib/slugify";

interface VideoFormData {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  categoryIds: string[];
  status: "draft" | "published";
  type: "video" | "list";
  duration: string;
  views: number;
  coverUrl: string;
  sourceUrl: string;
  tags: string;
  isManshet: boolean;
  isSidebar: boolean;
  isTopVideo: boolean;
  publishedAt: string;
}

interface CategoryOption {
  id: string;
  name: string;
  slug?: string;
}

interface LanguageOption {
  id: string;
  code: string;
  name: string;
  nativeName?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

type LiveSourceType = "youtube" | "upload" | "liveStream";

const toLocalDateTimeInput = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const fromLocalDateTimeInput = (value: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString();
};

const normalizeTagValue = (value: string) =>
  value.replace(/^#+/, "").trim();

const splitTags = (value: string) =>
  value
    .split(",")
    .map((tag) => normalizeTagValue(tag))
    .filter((tag) => tag.length > 0);

const uniqueTags = (tags: string[]) => {
  const seen = new Set<string>();
  const result: string[] = [];
  tags.forEach((tag) => {
    const key = tag.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    result.push(tag);
  });
  return result;
};

const tagsToString = (tags: string[]) => tags.join(", ");

const formatDuration = (totalSeconds: number) => {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return "";
  const total = Math.round(totalSeconds);
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  if (hours > 0) {
    return [
      String(hours).padStart(2, "0"),
      String(minutes).padStart(2, "0"),
      String(seconds).padStart(2, "0"),
    ].join(":");
  }
  return [String(minutes).padStart(2, "0"), String(seconds).padStart(2, "0")].join(
    ":",
  );
};

const getDurationFromFile = (file: File) =>
  new Promise<number>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.preload = "metadata";
    video.onloadedmetadata = () => {
      const duration = video.duration;
      URL.revokeObjectURL(url);
      resolve(duration);
    };
    video.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to read video duration"));
    };
    video.src = url;
  });

export default function VideoEditPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();

  const isNew = params.id === "new";
  const videoId = isNew ? null : (params.id as string);

  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    slug: "",
    description: "",
    categoryId: "",
    categoryIds: [],
    status: "draft",
    type: "video",
    duration: "",
    views: 0,
    coverUrl: "",
    sourceUrl: "",
    tags: "",
    isManshet: false,
    isSidebar: true,
    isTopVideo: false,
    publishedAt: "",
  });

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<string>("az");
  const hasUserSelectedLanguage = useRef(false);
  const [localizedTitle, setLocalizedTitle] = useState<Record<string, string>>(
    {},
  );
  const [localizedDescription, setLocalizedDescription] = useState<
    Record<string, string>
  >({});
  const [localizedTags, setLocalizedTags] = useState<Record<string, string>>(
    {},
  );
  const [liveStreamUrl, setLiveStreamUrl] = useState("");
  const [liveSourceType, setLiveSourceType] =
    useState<LiveSourceType>("youtube");
  const [videoMetadata, setVideoMetadata] = useState<Record<string, any> | null>(
    null,
  );
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(true);
  const slugSourceLanguage = useRef<string | null>(null);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [categoryQuery, setCategoryQuery] = useState("");
  const [tagInput, setTagInput] = useState("");
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);
  const hasSetDefaultPublishedAt = useRef(false);
  const hasManualDuration = useRef(false);

  const fetchVideo = useCallback(async () => {
    if (!videoId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/videos/${videoId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const video = data.data;
        const loadedCategoryIds = Array.isArray(video.categoryIds)
          ? video.categoryIds
          : video.categoryId
            ? [video.categoryId]
            : [];
        const primaryCategoryId =
          video.categoryId && loadedCategoryIds.includes(video.categoryId)
            ? video.categoryId
            : loadedCategoryIds[0] || "";

        const titleMap =
          (video.i18n && video.i18n.title) ||
          (video.title ? { [defaultLocale]: video.title } : {});
        const descriptionMap =
          (video.i18n && video.i18n.description) ||
          (video.description ? { [defaultLocale]: video.description } : {});
        const tagsByLocale =
          (video.i18n && video.i18n.tagsByLocale) ||
          (video.metadata && video.metadata.tagsByLocale) ||
          {};
        const tagsLocaleStrings: Record<string, string> = {};
        if (tagsByLocale && typeof tagsByLocale === "object") {
          Object.entries(tagsByLocale).forEach(([code, value]) => {
            if (Array.isArray(value) && value.length) {
              tagsLocaleStrings[code] = tagsToString(value);
            }
          });
        }
        if (
          !Object.keys(tagsLocaleStrings).length &&
          Array.isArray(video.tags) &&
          video.tags.length
        ) {
          tagsLocaleStrings[defaultLocale] = tagsToString(video.tags);
        }

        setLocalizedTitle(titleMap || {});
        setLocalizedDescription(descriptionMap || {});
        setLocalizedTags(tagsLocaleStrings);
        setVideoMetadata(video.metadata || null);
        setLiveStreamUrl(video.metadata?.liveStreamUrl || "");
        setLiveSourceType(
          resolveInitialLiveSourceType(video.sourceUrl || "", video.metadata || null),
        );

        const resolvedTitle =
          titleMap?.[activeLanguage] ||
          Object.values(titleMap || {}).find(Boolean) ||
          video.title ||
          "";
        const resolvedDescription =
          descriptionMap?.[activeLanguage] ||
          Object.values(descriptionMap || {}).find(Boolean) ||
          video.description ||
          "";
        const resolvedTags =
          tagsLocaleStrings[activeLanguage] ||
          Object.values(tagsLocaleStrings).find(Boolean) ||
          (Array.isArray(video.tags) ? tagsToString(video.tags) : "");

        setFormData({
          title: resolvedTitle || "",
          slug: video.slug || "",
          description: resolvedDescription || "",
          categoryId: primaryCategoryId,
          categoryIds: loadedCategoryIds,
          status: video.status || "draft",
          type: video.type || "video",
          duration: video.duration || "",
          views: typeof video.views === "number" ? video.views : 0,
          coverUrl: video.coverUrl || "",
          sourceUrl: video.sourceUrl || "",
          tags: resolvedTags || "",
          isManshet: Boolean(video.isManshet),
          isSidebar: Boolean(video.isSidebar),
          isTopVideo: Boolean(video.isTopVideo),
          publishedAt: video.publishedAt
            ? toLocalDateTimeInput(video.publishedAt)
            : "",
        });
        setAutoSlug(false);
      } else {
        error("Failed to load video", data.error);
        router.push("/admin/videos");
      }
    } catch (err) {
      error("Failed to load video", "Please try again later");
      router.push("/admin/videos");
    } finally {
      setIsLoading(false);
    }
  }, [videoId, error, router]);

  const normalizeKey = (value: string) =>
    value
      .normalize("NFKD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ə/g, "e")
      .replace(/ı/g, "i")
      .replace(/ş/g, "s")
      .replace(/ğ/g, "g")
      .replace(/ç/g, "c")
      .replace(/ö/g, "o")
      .replace(/ü/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const isYouTubeUrl = (value: string) => {
    if (!value) return false;
    try {
      const url = new URL(value);
      const host = url.hostname.replace("www.", "");
      return (
        host === "youtube.com" ||
        host === "m.youtube.com" ||
        host === "youtu.be"
      );
    } catch {
      return false;
    }
  };

  const resolveInitialLiveSourceType = (
    sourceUrl: string,
    metadata: Record<string, any> | null,
  ): LiveSourceType => {
    const fromMeta = metadata?.liveSourceType;
    if (
      fromMeta === "youtube" ||
      fromMeta === "upload" ||
      fromMeta === "liveStream"
    ) {
      return fromMeta;
    }
    if (
      typeof metadata?.liveStreamUrl === "string" &&
      metadata.liveStreamUrl.trim()
    ) {
      return "liveStream";
    }
    if (isYouTubeUrl(sourceUrl)) return "youtube";
    if (sourceUrl && sourceUrl.trim()) return "upload";
    return "youtube";
  };

  const liveSlugCandidates = new Set([
    "canli",
    "canlı",
    "live",
    "live-video",
    "youtube-live",
    "youtube-live-video",
  ]);

  const isLiveCategory = (category: CategoryOption) => {
    const slugKey = normalizeKey(category.slug || "");
    if (slugKey && liveSlugCandidates.has(slugKey)) return true;
    return liveSlugCandidates.has(normalizeKey(category.name || ""));
  };

  const selectedCategoryIds = new Set(
    [...formData.categoryIds, formData.categoryId].filter(Boolean),
  );
  const isLiveSelected = categories.some(
    (category) => selectedCategoryIds.has(category.id) && isLiveCategory(category),
  );
  const isDurationLocked = isLiveSelected && liveSourceType !== "upload";

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch {
      // ignore
    }
  }, []);

  const fetchLanguages = useCallback(async () => {
    try {
      const response = await fetch("/api/languages?active=1");
      const data = await response.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const sorted = [...data.data].sort(
          (a: LanguageOption, b: LanguageOption) =>
            (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
        );
        setLanguages(sorted);
      } else {
        const fallback = locales.map((code, index) => ({
          id: code,
          code,
          name: code.toUpperCase(),
          sortOrder: index,
          isActive: true,
        }));
        setLanguages(fallback);
      }
    } catch {
      const fallback = locales.map((code, index) => ({
        id: code,
        code,
        name: code.toUpperCase(),
        sortOrder: index,
        isActive: true,
      }));
      setLanguages(fallback);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
    fetchLanguages();
    if (!isNew) {
      fetchVideo();
    }
  }, [isNew, fetchVideo, fetchCategories, fetchLanguages]);

  useEffect(() => {
    if (!isNew || hasSetDefaultPublishedAt.current) return;
    if (!formData.publishedAt) {
      setFormData((prev) => ({
        ...prev,
        publishedAt: toLocalDateTimeInput(new Date().toISOString()),
      }));
    }
    hasSetDefaultPublishedAt.current = true;
  }, [isNew, formData.publishedAt]);

  useEffect(() => {
    if (!languages.length) return;
    const hasActive = languages.some((lang) => lang.code === activeLanguage);
    if (!hasActive) {
      const fallback =
        languages.find((lang) => lang.code === "az")?.code ||
        languages[0].code;
      setActiveLanguage(fallback);
      return;
    }
    if (isNew && !hasUserSelectedLanguage.current) {
      const preferred =
        languages.find((lang) => lang.code === "az")?.code ||
        languages[0].code;
      if (activeLanguage !== preferred) {
        setActiveLanguage(preferred);
      }
    }
  }, [languages, activeLanguage, isNew]);

  useEffect(() => {
    if (!autoSlug) {
      slugSourceLanguage.current = null;
    }
  }, [autoSlug]);

  useEffect(() => {
    if (!isDurationLocked) return;
    if (!formData.duration) return;
    setFormData((prev) => ({ ...prev, duration: "" }));
    hasManualDuration.current = false;
  }, [isDurationLocked, formData.duration]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      title: localizedTitle[activeLanguage] ?? "",
      description: localizedDescription[activeLanguage] ?? "",
      tags: localizedTags[activeLanguage] ?? "",
    }));
    setTagInput("");
  }, [activeLanguage]);

  const handleChange = (
    field: keyof VideoFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value } as VideoFormData;
      if (field === "title" && typeof value === "string" && autoSlug) {
        const trimmed = value.trim();
        const shouldUpdateSlug =
          !slugSourceLanguage.current ||
          slugSourceLanguage.current === activeLanguage;
        if (trimmed && shouldUpdateSlug) {
          if (!slugSourceLanguage.current) {
            slugSourceLanguage.current = activeLanguage;
          }
          next.slug = slugify(trimmed);
        }
      }
      return next;
    });

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (field === "slug") {
      setAutoSlug(false);
      slugSourceLanguage.current = null;
    }
    if (field === "status" && value !== "published" && errors.categoryIds) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.categoryIds;
        return next;
      });
    }

    if (field === "title" && typeof value === "string") {
      setLocalizedTitle((prev) => {
        const next = { ...prev };
        if (value.trim()) {
          next[activeLanguage] = value;
        } else {
          delete next[activeLanguage];
        }
        return next;
      });
    }
    if (field === "description" && typeof value === "string") {
      setLocalizedDescription((prev) => {
        const next = { ...prev };
        if (value.trim()) {
          next[activeLanguage] = value;
        } else {
          delete next[activeLanguage];
        }
        return next;
      });
    }
    if (field === "tags" && typeof value === "string") {
      setLocalizedTags((prev) => {
        const next = { ...prev };
        if (value.trim()) {
          next[activeLanguage] = value;
        } else {
          delete next[activeLanguage];
        }
        return next;
      });
    }

    if (field === "duration") {
      hasManualDuration.current = true;
    }
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.title.trim()) nextErrors.title = "Title is required";
    if (!formData.slug.trim()) {
      nextErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      nextErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    const normalizedCategoryIds = Array.from(
      new Set(
        [...formData.categoryIds, formData.categoryId]
          .map((id) => id.trim())
          .filter((id) => id.length > 0),
      ),
    );
    if (formData.status === "published" && normalizedCategoryIds.length === 0) {
      nextErrors.categoryIds = "Select at least one category to publish";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resolveUploadSlug = () => {
    const trimmed = formData.slug.trim();
    if (trimmed) return trimmed;
    const fallback = formData.title.trim() || "video";
    return slugify(fallback) || "video";
  };

  const tagList = uniqueTags(splitTags(formData.tags));
  const clearCategoryError = () => {
    if (!errors.categoryIds) return;
    setErrors((prev) => {
      const next = { ...prev };
      delete next.categoryIds;
      return next;
    });
  };

  const handleLanguageChange = (code: string) => {
    if (code === activeLanguage) return;
    hasUserSelectedLanguage.current = true;
    setLocalizedTitle((prev) => ({ ...prev, [activeLanguage]: formData.title }));
    setLocalizedDescription((prev) => ({
      ...prev,
      [activeLanguage]: formData.description,
    }));
    setLocalizedTags((prev) => ({ ...prev, [activeLanguage]: formData.tags }));
    setActiveLanguage(code);
  };

  const addTagsFromInput = () => {
    const incoming = uniqueTags(splitTags(tagInput));
    if (!incoming.length) return;
    const current = uniqueTags(splitTags(formData.tags));
    const merged = uniqueTags([...current, ...incoming]);
    handleChange("tags", tagsToString(merged));
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    const next = uniqueTags(splitTags(formData.tags)).filter(
      (item) => item.toLowerCase() !== tag.toLowerCase(),
    );
    handleChange("tags", tagsToString(next));
  };

  const uploadVideoAsset = async (file: File, field: "cover" | "video") => {
    const payload = new FormData();
    payload.append("file", file);
    payload.append("entity", "videos");
    payload.append("entitySlug", resolveUploadSlug());
    payload.append("field", field);

    const response = await fetch("/api/uploads", {
      method: "POST",
      body: payload,
    });
    const data = await response.json();

    if (data.success && data.data?.url) {
      return data.data.url as string;
    }
    throw new Error(data.error?.message || data.error || "Upload failed");
  };

  const triggerCoverPicker = () => {
    coverInputRef.current?.click();
  };

  const triggerVideoPicker = () => {
    videoInputRef.current?.click();
  };

  const filteredCategoryOptions = categories.filter((cat) =>
    cat.name.toLowerCase().includes(categoryQuery.trim().toLowerCase()),
  );

  const handleCoverUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      error("Invalid file", "Please upload an image file");
      event.target.value = "";
      return;
    }

    setIsCoverUploading(true);
    try {
      const url = await uploadVideoAsset(file, "cover");
      setFormData((prev) => ({ ...prev, coverUrl: url }));
      success("Image uploaded", "Cover image updated");
    } catch (err) {
      error("Upload failed", "Please try again");
    } finally {
      setIsCoverUploading(false);
      event.target.value = "";
    }
  };

  const handleVideoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      error("Invalid file", "Please upload a video file");
      event.target.value = "";
      return;
    }

    setIsVideoUploading(true);
    try {
      let detectedDuration = "";
      try {
        const durationSeconds = await getDurationFromFile(file);
        detectedDuration = formatDuration(durationSeconds);
      } catch {
        detectedDuration = "";
      }
      const url = await uploadVideoAsset(file, "video");
      setFormData((prev) => {
        const next = { ...prev, sourceUrl: url };
        const shouldSetDuration =
          !isDurationLocked &&
          detectedDuration &&
          (!hasManualDuration.current || !prev.duration);
        if (shouldSetDuration) {
          next.duration = detectedDuration;
        }
        return next;
      });
      success("Video uploaded", "Video link updated");
    } catch (err) {
      error("Upload failed", "Please try again");
    } finally {
      setIsVideoUploading(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    const buildLocalizedMap = (
      base: Record<string, string>,
      value: string,
    ) => {
      const next = { ...base };
      if (value.trim()) {
        next[activeLanguage] = value.trim();
      } else {
        delete next[activeLanguage];
      }
      return next;
    };

    const titleMap = buildLocalizedMap(localizedTitle, formData.title);
    const descriptionMap = buildLocalizedMap(
      localizedDescription,
      formData.description,
    );
    const tagsMap = buildLocalizedMap(localizedTags, formData.tags);

    const normalizedCategoryIds = Array.from(
      new Set(
        [...formData.categoryIds, formData.categoryId]
          .map((id) => id.trim())
          .filter((id) => id.length > 0),
      ),
    );
    const primaryCategoryId =
      formData.categoryId && normalizedCategoryIds.includes(formData.categoryId)
        ? formData.categoryId
        : normalizedCategoryIds[0] || "";
    const tagsByLocale: Record<string, string[]> = {};
    Object.entries(tagsMap).forEach(([code, value]) => {
      const parsed = uniqueTags(splitTags(value));
      if (parsed.length) {
        tagsByLocale[code] = parsed;
      }
    });
    const fallbackTagLocale =
      tagsByLocale[defaultLocale] !== undefined
        ? defaultLocale
        : activeLanguage;
    const tags = tagsByLocale[fallbackTagLocale] ?? [];

    const mergedMetadata = { ...(videoMetadata ?? {}) } as Record<string, any>;
    const trimmedLiveStreamUrl = liveStreamUrl.trim();
    if (isLiveSelected) {
      mergedMetadata.liveSourceType = liveSourceType;
      if (liveSourceType === "liveStream" && trimmedLiveStreamUrl) {
        mergedMetadata.liveStreamUrl = trimmedLiveStreamUrl;
      } else if ("liveStreamUrl" in mergedMetadata) {
        delete mergedMetadata.liveStreamUrl;
      }
    } else {
      if ("liveStreamUrl" in mergedMetadata) {
        delete mergedMetadata.liveStreamUrl;
      }
      if ("liveSourceType" in mergedMetadata) {
        delete mergedMetadata.liveSourceType;
      }
    }
    if (Object.keys(tagsByLocale).length) {
      mergedMetadata.tagsByLocale = tagsByLocale;
    } else if ("tagsByLocale" in mergedMetadata) {
      delete mergedMetadata.tagsByLocale;
    }
    const metadataPayload =
      Object.keys(mergedMetadata).length > 0 ? mergedMetadata : null;

    setIsSaving(true);
    try {
      const url = isNew ? "/api/videos" : `/api/videos/${videoId}`;
      const method = isNew ? "POST" : "PUT";
      const payload = {
        title: titleMap,
        slug: formData.slug.trim(),
        description:
          Object.keys(descriptionMap).length > 0 ? descriptionMap : null,
        categoryId: primaryCategoryId || null,
        categoryIds: normalizedCategoryIds,
        status: formData.status,
        type: formData.type,
        duration: formData.duration || null,
        views: Number(formData.views) || 0,
        coverUrl: formData.coverUrl || null,
        sourceUrl: formData.sourceUrl.trim() || null,
        tags,
        metadata: metadataPayload,
        isManshet: formData.isManshet,
        isSidebar: formData.isSidebar,
        isTopVideo: formData.isTopVideo,
        publishedAt: fromLocalDateTimeInput(formData.publishedAt),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        success(
          isNew ? "Video created" : "Video updated",
          `"${formData.title}" has been ${isNew ? "created" : "updated"}`,
        );
        router.push("/admin/videos");
      } else {
        error("Failed to save video", data.error);
      }
    } catch (err) {
      error("Failed to save video", "Please try again later");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-4 w-20 mb-4" />
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-64 w-full rounded-lg" />
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
          <div className="space-y-6">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? "New Video" : "Edit Video"}
        description={
          isNew ? "Create a new video" : `Editing: ${formData.title}`
        }
        backHref="/admin/videos"
        backLabel="Back to Videos"
      />

      <FormLayout onSubmit={handleSubmit}> 
        <FormGrid>
          <FormMain>
            <FormSection title="Details"  className="margin_bottom_18">
              <FormField
                label={`Title (${activeLanguage.toUpperCase()})`}
                htmlFor="title"
                required
                error={errors.title}
              >
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  placeholder="Enter video title"
                  error={!!errors.title}
                />
              </FormField>

              <FormField
                label="Slug"
                htmlFor="slug"
                required
                error={errors.slug}
                hint="URL-friendly version of the title"
              >
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="video-slug"
                  error={!!errors.slug}
                />
              </FormField>

              <FormField
                label={`Description (${activeLanguage.toUpperCase()})`}
                htmlFor="description"
              >
                <RichTextEditor
                  value={formData.description}
                  onChange={(value) => handleChange("description", value)}
                  placeholder="Write a short description..."
                />
              </FormField>
            </FormSection>

              <FormSection title="Metadata">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField label="Type" htmlFor="type">
                  <Select
                    value={formData.type}
                    onValueChange={(value) =>
                      handleChange("type", value as VideoFormData["type"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent className="text-black">
                      <SelectItem value="video">Video</SelectItem>
                      <SelectItem value="list">List</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField
                  label="Duration"
                  htmlFor="duration"
                  hint={
                    isDurationLocked
                      ? "Live streams do not have a fixed duration."
                      : "Auto-filled after upload. You can edit if needed."
                  }
                >
                  <Input
                    id="duration"
                    type="text"
                    value={isDurationLocked ? "" : formData.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                    placeholder={isDurationLocked ? "Live" : "00:45"}
                    disabled={isDurationLocked}
                  />
                </FormField>

                <FormField
                  label="Views"
                  htmlFor="views"
                  hint="Views are counted automatically from the video page."
                >
                  <Input
                    id="views"
                    type="number"
                    min={0}
                    value={formData.views}
                    onChange={(e) => handleChange("views", Number(e.target.value))}
                  />
                </FormField>

                <FormField label="Published At" htmlFor="publishedAt">
                  <Input
                    id="publishedAt"
                    type="datetime-local"
                    value={formData.publishedAt}
                    onChange={(e) => handleChange("publishedAt", e.target.value)}
                  />
                </FormField>

                <FormField
                  label={`Tags (${activeLanguage.toUpperCase()})`}
                  htmlFor="tags"
                  hint="Press Enter to add tags or click Add"
                  className="col-span-full"
                >
                  <div className="admin-tags">
                    <div className="admin-tags__input-row">
                      <Input
                        id="tags"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === ",") {
                            e.preventDefault();
                            addTagsFromInput();
                          }
                        }}
                        placeholder="Add a tag..."
                        className="admin-tags__input"
                      />
                      <button
                        type="button"
                        className="admin-tags__add"
                        onClick={addTagsFromInput}
                      >
                        Add
                      </button>
                    </div>
                    <div className="admin-tags__list">
                      {tagList.length ? (
                        tagList.map((tag) => (
                          <span key={tag} className="admin-tags__chip">
                            {tag}
                            <button
                              type="button"
                              className="admin-tags__remove"
                              aria-label={`Remove ${tag}`}
                              onClick={() => removeTag(tag)}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        ))
                      ) : (
                        <span className="admin-tags__empty">
                          No tags added yet
                        </span>
                      )}
                    </div>
                  </div>
                </FormField>

              </div>
            </FormSection>
          </FormMain>

          <FormSidebar>
            <FormSection
              title="Xəbər dili"
              className="margin_bottom_18 admin-language-section"
            >
              <div className="grid grid-cols-2 gap-3 admin-language-grid">
                {languages.map((lang) => {
                  const label = (
                    lang.nativeName ||
                    lang.name ||
                    lang.code
                  ).toUpperCase();
                  const isActive = lang.code === activeLanguage;
                  return (
                    <button
                      key={lang.id || lang.code}
                      type="button"
                      className={cn(
                        "admin-language-chip",
                        isActive && "is-active",
                      )}
                      onClick={() => handleLanguageChange(lang.code)}
                    >
                      <span className="admin-language-chip__code">
                        {lang.code.toUpperCase()}
                      </span>
                      <span className="admin-language-chip__label">
                        {label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </FormSection>

            <FormSection title="Publishing" className="margin_bottom_18">
              <FormField label="Status" htmlFor="status">
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    handleChange("status", value as VideoFormData["status"])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent className="text-black">
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </FormField>

              <FormField
                label="Categories"
                htmlFor="categories"
                error={errors.categoryIds}
              >
                <div className="admin-multi-select">
                  <div className="admin-multi-select__header">
                    <div className="admin-multi-select__title">
                      <Folder className="h-4 w-4" />
                      Kateqoriyalar
                    </div>
                    <span className="admin-multi-select__count">
                      {formData.categoryIds.length} secildi
                    </span>
                  </div>

                  <div className="admin-multi-select__chips">
                    {formData.categoryIds.length ? (
                      formData.categoryIds.map((id) => {
                        const label =
                          categories.find((cat) => cat.id === id)?.name || id;
                        return (
                          <span key={id} className="admin-multi-select__chip">
                            {label}
                            <button
                              type="button"
                              className="admin-multi-select__chip-remove"
                              aria-label="Remove category"
                              onClick={() => {
                                setFormData((prev) => {
                                  const next = prev.categoryIds.filter(
                                    (cid) => cid !== id,
                                  );
                                  const nextPrimary =
                                    prev.categoryId &&
                                    next.includes(prev.categoryId)
                                      ? prev.categoryId
                                      : next[0] || "";
                                  return {
                                    ...prev,
                                    categoryIds: next,
                                    categoryId: nextPrimary,
                                  };
                                });
                                clearCategoryError();
                              }}
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </span>
                        );
                      })
                    ) : (
                      <span className="admin-multi-select__empty">
                        No categories selected
                      </span>
                    )}
                  </div>

                  <div className="admin-multi-select__search">
                    <div className="admin-multi-select__search-box">
                      <Search className="h-4 w-4" />
                      <input
                        type="text"
                        placeholder="Kateqoriya axtar..."
                        value={categoryQuery}
                        onChange={(e) => setCategoryQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="admin-multi-select__list">
                    {filteredCategoryOptions.length ? (
                      filteredCategoryOptions.map((cat) => {
                        const checked = formData.categoryIds.includes(cat.id);
                        return (
                          <label
                            key={cat.id}
                            className={`admin-multi-select__item${checked ? " is-checked" : ""}`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => {
                                setFormData((prev) => {
                                  const exists = prev.categoryIds.includes(cat.id);
                                  const next = exists
                                    ? prev.categoryIds.filter((id) => id !== cat.id)
                                    : [...prev.categoryIds, cat.id];
                                  const nextPrimary =
                                    prev.categoryId && next.includes(prev.categoryId)
                                      ? prev.categoryId
                                      : next[0] || "";
                                  return {
                                    ...prev,
                                    categoryIds: next,
                                    categoryId: nextPrimary,
                                  };
                                });
                                clearCategoryError();
                              }}
                            />
                            <span>{cat.name}</span>
                          </label>
                        );
                      })
                    ) : (
                      <div className="admin-multi-select__empty">
                        No categories found
                      </div>
                    )}
                  </div>

                  {formData.categoryIds.length > 0 && (
                    <button
                      type="button"
                      className="admin-multi-select__clear"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          categoryIds: [],
                          categoryId: "",
                        }))
                      }
                    >
                      Clear all
                    </button>
                  )}
                </div>
              </FormField>
            </FormSection>

            <FormSection
              title="Source"
              description={
                isLiveSelected
                  ? "Choose the live source type."
                  : "Paste a YouTube link or upload a video file"
              }
              className="margin_bottom_18"
            >
              {isLiveSelected ? (
                <Tabs
                  value={liveSourceType}
                  onValueChange={(value) =>
                    setLiveSourceType(value as LiveSourceType)
                  }
                >
                  <TabsList className="w-full justify-start gap-2">
                    <TabsTrigger value="youtube">YouTube Link</TabsTrigger>
                    <TabsTrigger value="upload">Video Upload</TabsTrigger>
                    <TabsTrigger value="liveStream">Live Stream URL</TabsTrigger>
                  </TabsList>

                  <TabsContent value="youtube">
                    <FormField label="YouTube Link" htmlFor="sourceUrlYoutube">
                      <Input
                        id="sourceUrlYoutube"
                        value={formData.sourceUrl}
                        onChange={(e) => handleChange("sourceUrl", e.target.value)}
                        placeholder="https://youtube.com/watch?v=..."
                      />
                    </FormField>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-3">
                        {formData.sourceUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleChange("sourceUrl", "")}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      {formData.sourceUrl && (
                        <a
                          href={formData.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Open current link
                        </a>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="upload">
                    <FormField label="Video File URL" htmlFor="sourceUrlUpload">
                      <Input
                        id="sourceUrlUpload"
                        value={formData.sourceUrl}
                        onChange={(e) => handleChange("sourceUrl", e.target.value)}
                        placeholder="https://.../video.mp4"
                      />
                    </FormField>
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <input
                          ref={videoInputRef}
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleVideoUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={triggerVideoPicker}
                          disabled={isVideoUploading}
                        >
                          {isVideoUploading ? "Uploading..." : "Upload video"}
                        </Button>
                        {formData.sourceUrl && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleChange("sourceUrl", "")}
                          >
                            Clear
                          </Button>
                        )}
                      </div>
                      {formData.sourceUrl && (
                        <a
                          href={formData.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Open current link
                        </a>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="liveStream">
                    <FormField
                      label="Live Stream URL (m3u8)"
                      htmlFor="liveStreamUrl"
                      hint="Best practice for live: use an HLS .m3u8 link."
                    >
                      <Input
                        id="liveStreamUrl"
                        value={liveStreamUrl}
                        onChange={(e) => setLiveStreamUrl(e.target.value)}
                        placeholder="https://example.com/live/stream.m3u8"
                      />
                    </FormField>
                    {liveStreamUrl && (
                      <a
                        href={liveStreamUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Open current link
                      </a>
                    )}
                  </TabsContent>
                </Tabs>
              ) : (
                <>
                  <FormField label="Video Link" htmlFor="sourceUrl">
                    <Input
                      id="sourceUrl"
                      value={formData.sourceUrl}
                      onChange={(e) => handleChange("sourceUrl", e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </FormField>

                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-3">
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={triggerVideoPicker}
                        disabled={isVideoUploading}
                      >
                        {isVideoUploading ? "Uploading..." : "Upload video"}
                      </Button>
                      {formData.sourceUrl && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleChange("sourceUrl", "")}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                    {formData.sourceUrl && (
                      <a
                        href={formData.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:underline"
                      >
                        Open current link
                      </a>
                    )}
                  </div>
                </>
              )}
            </FormSection>

            <FormSection title="Cover Image"  className="margin_bottom_18">
              {formData.coverUrl ? (
                <div className="admin-cover-card">
                  <img
                    src={formData.coverUrl}
                    alt="Cover"
                    className="admin-cover-card__image"
                  />
                  <button
                    type="button"
                    className="admin-cover-card__remove"
                    onClick={() => handleChange("coverUrl", "")}
                    aria-label="Remove cover image"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div className="admin-cover-empty">
                  <ImageIcon className="h-10 w-10" />
                  <div className="admin-cover-empty__text">
                    <p>No image selected</p>
                    <span>Upload a cover image for the video</span>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={triggerCoverPicker}
                    disabled={isCoverUploading}
                  >
                    Select Image
                  </Button>
                </div>
              )}
              <div className="mt-3 space-y-2">
                <Input
                  id="coverUrl"
                  value={formData.coverUrl}
                  onChange={(e) => handleChange("coverUrl", e.target.value)}
                  placeholder="https://..."
                />
                <div className="flex items-center gap-3">
                  <input
                    ref={coverInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleCoverUpload}
                  />
                  <button
                    type="button"
                    onClick={triggerCoverPicker}
                    className="inline-flex items-center rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground hover:bg-muted disabled:opacity-100"
                    disabled={isCoverUploading}
                  >
                    {isCoverUploading ? "Uploading..." : "Upload image"}
                  </button>
                  {isCoverUploading && (
                    <span className="text-xs text-muted-foreground">
                      Uploading...
                    </span>
                  )}
                </div>
              </div>
            </FormSection>

            <FormSection title="Flags">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Manshet</p>
                    <p className="text-sm text-muted-foreground">
                      Show in main slider
                    </p>
                  </div>
                  <Switch
                    checked={formData.isManshet}
                    onCheckedChange={(checked) =>
                      handleChange("isManshet", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Sidebar</p>
                    <p className="text-sm text-muted-foreground">
                      Show in sidebar list
                    </p>
                  </div>
                  <Switch
                    checked={formData.isSidebar}
                    onCheckedChange={(checked) =>
                      handleChange("isSidebar", checked)
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Top Video</p>
                    <p className="text-sm text-muted-foreground">
                      Show as featured top video
                    </p>
                  </div>
                  <Switch
                    checked={formData.isTopVideo}
                    onCheckedChange={(checked) =>
                      handleChange("isTopVideo", checked)
                    }
                  />
                </div>
              </div>
            </FormSection>
          </FormSidebar>
        </FormGrid>

        <FormActions
          onCancel={() => router.push("/admin/videos")}
          submitLabel={isNew ? "Create Video" : "Save Changes"}
          isSubmitting={isSaving}
        />
      </FormLayout>
    </div>
  );
}
