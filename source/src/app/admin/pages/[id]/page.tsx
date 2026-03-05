"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  FormEvent,
  Dispatch,
  SetStateAction,
} from "react";
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
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { locales } from "@/i18n/config";
import { slugify } from "@/lib/slugify";
import type { Page } from "@/types/page.types";

interface LanguageOption {
  id: string;
  code: string;
  name: string;
  nativeName?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

interface PageFormData {
  title: string;
  slug: string;
  description: string;
  status: "draft" | "published";
}

export default function PageEditPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();

  const isNew = params.id === "new";
  const pageId = isNew ? null : (params.id as string);

  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [activeLanguage, setActiveLanguage] = useState<string>("az");
  const hasUserSelectedLanguage = useRef(false);
  const [localizedTitle, setLocalizedTitle] = useState<Record<string, string>>({});
  const [localizedDescription, setLocalizedDescription] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<PageFormData>({
    title: "",
    slug: "",
    description: "",
    status: "draft",
  });
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(true);
  const slugSourceLanguage = useRef<string | null>(null);

  const languageCodes = useMemo(
    () =>
      languages.length ? languages.map((lang) => lang.code) : [...locales],
    [languages],
  );

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
        return;
      }
    } catch {
      // ignore
    }
    setLanguages(
      locales.map((code, index) => ({
        id: code,
        code,
        name: code.toUpperCase(),
        sortOrder: index,
        isActive: true,
      })),
    );
  }, []);

  const fetchPage = useCallback(async () => {
    if (!pageId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/pages/${pageId}`);
      const data = await response.json();
      if (data.success && data.data) {
        const page = data.data as Page;
        const titleMap = page.title || {};
        const descriptionMap = page.description || {};
        setLocalizedTitle(titleMap);
        setLocalizedDescription(descriptionMap);
        setFormData({
          title: titleMap?.[activeLanguage] || "",
          slug: page.slug || "",
          description: descriptionMap?.[activeLanguage] || "",
          status: page.status || "draft",
        });
        setAutoSlug(false);
      } else {
        error("Failed to load page", data.error);
        router.push("/admin/pages");
      }
    } catch (err) {
      console.error("Failed to load page", err);
      error("Failed to load page", "Please try again later");
      router.push("/admin/pages");
    } finally {
      setIsLoading(false);
    }
  }, [pageId, activeLanguage, error, router]);

  useEffect(() => {
    fetchLanguages();
    if (!isNew) {
      fetchPage();
    }
  }, [isNew, fetchLanguages, fetchPage]);

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
    setFormData((prev) => ({
      ...prev,
      title: localizedTitle[activeLanguage] ?? "",
      description: localizedDescription[activeLanguage] ?? "",
    }));
  }, [activeLanguage]);

  const updateLocalizedField = (
    setter: Dispatch<SetStateAction<Record<string, string>>>,
    value: string,
  ) => {
    setter((prev) => {
      const next = { ...prev };
      if (value.trim()) {
        next[activeLanguage] = value;
      } else {
        delete next[activeLanguage];
      }
      return next;
    });
  };

  const handleChange = (field: keyof PageFormData, value: string) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value } as PageFormData;
      if (field === "title" && autoSlug) {
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
    if (field === "title") {
      updateLocalizedField(setLocalizedTitle, value);
    }
    if (field === "description") {
      updateLocalizedField(setLocalizedDescription, value);
    }
  };

  const handleLanguageChange = (code: string) => {
    if (code === activeLanguage) return;
    hasUserSelectedLanguage.current = true;
    updateLocalizedField(setLocalizedTitle, formData.title);
    updateLocalizedField(setLocalizedDescription, formData.description);
    setActiveLanguage(code);
  };

  const validate = () => {
    const nextErrors: Record<string, string> = {};
    if (!formData.slug.trim()) {
      nextErrors.slug = "Slug is required";
    }
    const titleValues = Object.values(localizedTitle || {});
    const hasTitle = titleValues.some((value) => value.trim().length > 0);
    if (!hasTitle && !formData.title.trim()) {
      nextErrors.title = "Enter at least one title";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const cleanLocalized = (value: Record<string, string>) =>
    Object.fromEntries(
      Object.entries(value || {}).filter(
        ([, entry]) => entry.trim().length > 0,
      ),
    );

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const titlePayload = cleanLocalized({
        ...localizedTitle,
        [activeLanguage]: formData.title,
      });
      const descriptionPayload = cleanLocalized({
        ...localizedDescription,
        [activeLanguage]: formData.description,
      });
      const payload: {
        id?: string;
        slug: string;
        title: Record<string, string>;
        description?: Record<string, string>;
        status: PageFormData["status"];
      } = {
        slug: formData.slug.trim(),
        title: titlePayload,
        status: formData.status,
        ...(pageId ? { id: pageId } : {}),
      };
      if (Object.keys(descriptionPayload).length > 0) {
        payload.description = descriptionPayload;
      }
      const url = pageId ? `/api/pages/${pageId}` : "/api/pages";
      const method = pageId ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.success) {
        success(
          pageId ? "Page updated" : "Page created",
          `"${payload.slug}" saved`,
        );
        router.push("/admin/pages");
      } else {
        error("Failed to save page", data.error?.message || data.error);
      }
    } catch (err) {
      console.error("Failed to save page", err);
      error("Failed to save page", "Please try again later");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-40" />
        </div>
        <div className="bg-card rounded-lg border p-4 space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={isNew ? "New Page" : "Edit Page"}
        description={
          isNew
            ? "Create a static page for the website"
            : `Editing: ${formData.slug || "Page"}`
        }
        backHref="/admin/pages"
        backLabel="Back to Pages"
      />

      <FormLayout onSubmit={handleSubmit} className="max-w-5xl">
        <FormGrid>
          <FormMain>
            <FormSection title="Page Content">
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
                  placeholder="Page title"
                  error={!!errors.title}
                />
              </FormField>

              <FormField
                label="Slug"
                htmlFor="slug"
                required
                error={errors.slug}
                hint="URL-friendly identifier (e.g. about-us)"
              >
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => handleChange("slug", e.target.value)}
                  placeholder="about-us"
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
                  placeholder="Write the page content..."
                />
              </FormField>
            </FormSection>
          </FormMain>

          <FormSidebar>

            <FormSection title="Language"  className="margin_bottom_18">
              <div className="margin_bottom_18 admin-language-section">
                <div className="grid grid-cols-2 gap-3 admin-language-grid">
                  {languageCodes.map((code) => {
                    const lang = languages.find((item) => item.code === code);
                    const isActive = code === activeLanguage;
                    return (
                      <button
                        type="button"
                        key={code}
                        className={`admin-language-chip ${
                          isActive ? "is-active" : ""
                        }`}
                        onClick={() => handleLanguageChange(code)}
                      >
                        <span className="admin-language-chip__code">
                          {code.toUpperCase()}
                        </span>
                        <span className="admin-language-chip__label">
                          {lang?.name || code.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </FormSection>

            <FormSection title="Publishing">
              <FormField label="Status" htmlFor="status">
                <Select
                  value={formData.status}
                  onValueChange={(value) =>
                    setFormData((prev) => ({
                      ...prev,
                      status: value as PageFormData["status"],
                    }))
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
            </FormSection>
          </FormSidebar>
        </FormGrid>

        <FormActions
          onCancel={() => router.push("/admin/pages")}
          submitLabel={isNew ? "Create Page" : "Save Changes"}
          isSubmitting={isSaving}
        />
      </FormLayout>
    </div>
  );
}
