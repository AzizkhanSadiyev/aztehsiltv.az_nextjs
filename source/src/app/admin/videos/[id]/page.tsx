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
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, X } from "lucide-react";
import { RichTextEditor } from "@/components/admin/RichTextEditor";

interface VideoFormData {
  title: string;
  slug: string;
  description: string;
  categoryId: string;
  status: "draft" | "published";
  type: "video" | "list";
  duration: string;
  views: number;
  coverUrl: string;
  sourceUrl: string;
  isManshet: boolean;
  isShort: boolean;
  isSidebar: boolean;
  isTopVideo: boolean;
  publishedAt: string;
}

interface CategoryOption {
  id: string;
  name: string;
}

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

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

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
    status: "draft",
    type: "video",
    duration: "",
    views: 0,
    coverUrl: "",
    sourceUrl: "",
    isManshet: false,
    isShort: false,
    isSidebar: false,
    isTopVideo: false,
    publishedAt: "",
  });

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(true);
  const [isCoverUploading, setIsCoverUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const videoInputRef = useRef<HTMLInputElement | null>(null);

  const fetchVideo = useCallback(async () => {
    if (!videoId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/videos/${videoId}`);
      const data = await response.json();

      if (data.success && data.data) {
        const video = data.data;
        setFormData({
          title: video.title || "",
          slug: video.slug || "",
          description: video.description || "",
          categoryId: video.categoryId || "",
          status: video.status || "draft",
          type: video.type || "video",
          duration: video.duration || "",
          views: typeof video.views === "number" ? video.views : 0,
          coverUrl: video.coverUrl || "",
          sourceUrl: video.sourceUrl || "",
          isManshet: Boolean(video.isManshet),
          isShort: Boolean(video.isShort),
          isSidebar: Boolean(video.isSidebar),
          isTopVideo: Boolean(video.isTopVideo),
          publishedAt: video.publishedAt ? toLocalDateTimeInput(video.publishedAt) : "",
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

  useEffect(() => {
    fetchCategories();
    if (!isNew) {
      fetchVideo();
    }
  }, [isNew, fetchVideo, fetchCategories]);

  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(prev.title) }));
    }
  }, [formData.title, autoSlug]);

  const handleChange = (
    field: keyof VideoFormData,
    value: string | number | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }

    if (field === "slug") {
      setAutoSlug(false);
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
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resolveUploadSlug = () => {
    const trimmed = formData.slug.trim();
    if (trimmed) return trimmed;
    const fallback = formData.title.trim() || "video";
    return generateSlug(fallback) || "video";
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
      const url = await uploadVideoAsset(file, "video");
      setFormData((prev) => ({ ...prev, sourceUrl: url }));
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

    setIsSaving(true);
    try {
      const url = isNew ? "/api/videos" : `/api/videos/${videoId}`;
      const method = isNew ? "POST" : "PUT";
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        categoryId: formData.categoryId || null,
        status: formData.status,
        type: formData.type,
        duration: formData.duration || null,
        views: Number(formData.views) || 0,
        coverUrl: formData.coverUrl || null,
        sourceUrl: formData.sourceUrl.trim() || null,
        isManshet: formData.isManshet,
        isShort: formData.isShort,
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
                label="Title"
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

              <FormField label="Description" htmlFor="description">
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

                <FormField label="Duration" htmlFor="duration">
                  <Input
                    id="duration"
                    type="time"
                    value={formData.duration}
                    onChange={(e) => handleChange("duration", e.target.value)}
                    placeholder="00:45"
                  />
                </FormField>

                <FormField label="Views" htmlFor="views">
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
              </div>
            </FormSection>
          </FormMain>

          <FormSidebar>
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

              <FormField label="Category" htmlFor="category">
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) =>
                    handleChange("categoryId", value === "none" ? "" : value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="text-black">
                    <SelectItem value="none">No Category</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </FormSection>

            <FormSection
              title="Source"
              description="Paste a YouTube link or upload a video file"  className="margin_bottom_18" 
            >
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
            </FormSection>

            <FormSection title="Cover Image"  className="margin_bottom_18">
              {formData.coverUrl ? (
                <div className="relative">
                  <img
                    src={formData.coverUrl}
                    alt="Cover"
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => handleChange("coverUrl", "")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <ImageIcon className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    No image selected
                  </p>
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
                    className="inline-flex items-center rounded-md border border-input px-3 py-2 text-sm text-black font-medium text-foreground hover:bg-muted disabled:opacity-100"
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
                    <p className="font-medium">Short</p>
                    <p className="text-sm text-muted-foreground">
                      Show in shorts section
                    </p>
                  </div>
                  <Switch
                    checked={formData.isShort}
                    onCheckedChange={(checked) =>
                      handleChange("isShort", checked)
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
