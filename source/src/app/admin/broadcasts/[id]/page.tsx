"use client";

import { useState, useEffect, useCallback, FormEvent, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import {
  FormLayout,
  FormSection,
  FormField,
  FormActions,
  Input,
  Textarea,
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
import { slugify } from "@/lib/slugify";

interface BroadcastFormData {
  title: string;
  slug: string;
  description: string;
  imageUrl: string;
  status: "draft" | "published";
  sortOrder: number;
}

export default function BroadcastEditPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();

  const isNew = params.id === "new";
  const broadcastId = isNew ? null : (params.id as string);

  const [formData, setFormData] = useState<BroadcastFormData>({
    title: "",
    slug: "",
    description: "",
    imageUrl: "",
    status: "draft",
    sortOrder: 0,
  });

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoSlug, setAutoSlug] = useState(true);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchBroadcast = useCallback(async () => {
    if (!broadcastId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/broadcasts/${broadcastId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const broadcast = data.data;
        setFormData({
          title: broadcast.title || "",
          slug: broadcast.slug || "",
          description: broadcast.description || "",
          imageUrl: broadcast.imageUrl || "",
          status: broadcast.status || "draft",
          sortOrder:
            typeof broadcast.sortOrder === "number" ? broadcast.sortOrder : 0,
        });
        setAutoSlug(false);
      } else {
        error("Failed to load broadcast", data.error);
        router.push("/admin/broadcasts");
      }
    } catch (err) {
      error("Failed to load broadcast", "Please try again later");
      router.push("/admin/broadcasts");
    } finally {
      setIsLoading(false);
    }
  }, [broadcastId, error, router]);

  useEffect(() => {
    if (!isNew) {
      fetchBroadcast();
    }
  }, [isNew, fetchBroadcast]);

  useEffect(() => {
    if (autoSlug && formData.title) {
      setFormData((prev) => ({
        ...prev,
        slug: slugify(prev.title),
      }));
    }
  }, [formData.title, autoSlug]);

  const handleChange = (
    field: keyof BroadcastFormData,
    value: string | number,
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

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.title.trim()) nextErrors.title = "Title is required";
    if (!formData.slug.trim()) {
      nextErrors.slug = "Slug is required";
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      nextErrors.slug =
        "Slug can only contain lowercase letters, numbers, and hyphens";
    }
    if (!formData.imageUrl.trim()) nextErrors.imageUrl = "Image URL is required";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append("file", file);
      formDataUpload.append("uploadedBy", "admin");
      const res = await fetch("/api/media", {
        method: "POST",
        body: formDataUpload,
      });
      const data = await res.json();
      if (data.success && data.data?.url) {
        setFormData((prev) => ({ ...prev, imageUrl: data.data.url }));
        success("Image uploaded", "Image URL set from upload");
      } else {
        error("Upload failed", data.error || "Please try again");
      }
    } catch (err) {
      error("Upload failed", "Please try again");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const url = isNew ? "/api/broadcasts" : `/api/broadcasts/${broadcastId}`;
      const method = isNew ? "POST" : "PUT";
      const payload = {
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        description: formData.description.trim() || null,
        imageUrl: formData.imageUrl.trim(),
        status: formData.status,
        sortOrder: Number(formData.sortOrder) || 0,
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        success(
          isNew ? "Broadcast created" : "Broadcast updated",
          `"${formData.title}" has been ${isNew ? "created" : "updated"}`,
        );
        router.push("/admin/broadcasts");
      } else {
        error("Failed to save broadcast", data.error);
      }
    } catch (err) {
      error("Failed to save broadcast", "Please try again later");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
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
        title={isNew ? "New Broadcast" : "Edit Broadcast"}
        description={
          isNew
            ? "Create a new broadcast"
            : `Editing: ${formData.title || "Broadcast"}`
        }
        backHref="/admin/broadcasts"
        backLabel="Back to Broadcasts"
      />

      <FormLayout onSubmit={handleSubmit} className="max-w-4xl">
        <FormSection title="Basics">
          <FormField label="Title" htmlFor="title" required error={errors.title}>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Show title"
              error={!!errors.title}
             
            />
          </FormField>

          <FormField label="Slug" htmlFor="slug" required error={errors.slug}>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => handleChange("slug", e.target.value)}
              placeholder="show-slug"
              error={!!errors.slug}
             
            />
          </FormField>

          <FormField label="Description" htmlFor="description">
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Short description..."
              rows={4}
             
            />
          </FormField>
        </FormSection>

        <FormSection title="Image">
          {formData.imageUrl ? (
            <div className="relative">
              <img
                src={formData.imageUrl}
                alt="Broadcast"
                className="w-full h-40 object-cover rounded-lg"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 h-8 w-8"
                onClick={() => handleChange("imageUrl", "")}
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
              <Button type="button" variant="outline" size="sm" onClick={handleUploadClick}>
                Select Image
              </Button>
            </div>
          )}

          <div className="mt-3 space-y-2">
            <FormField label="Image URL" htmlFor="imageUrl" required error={errors.imageUrl}>
              <Input
                id="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleChange("imageUrl", e.target.value)}
                placeholder="https://..."
                error={!!errors.imageUrl}
              />
            </FormField>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <button
                type="button"
                onClick={handleUploadClick}
                className="inline-flex items-center rounded-md border border-input px-3 py-2 text-sm text-black font-medium text-foreground hover:bg-muted disabled:opacity-100"
                disabled={isUploading}
              >
                {isUploading ? "Uploading..." : "Upload image"}
              </button>
              {isUploading && (
                <span className="text-xs text-muted-foreground">
                  Uploading...
                </span>
              )}
            </div>
          </div>
        </FormSection>

        <FormSection title="Status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Status" htmlFor="status">
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleChange("status", value as BroadcastFormData["status"])
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

            <FormField label="Order" htmlFor="sortOrder" hint="Lower numbers show first">
              <Input
                id="sortOrder"
                type="number"
                value={formData.sortOrder}
                onChange={(e) =>
                  handleChange("sortOrder", Number(e.target.value))
                }
                min={0}
              />
            </FormField>
          </div>
        </FormSection>

        <FormActions
          onCancel={() => router.push("/admin/broadcasts")}
          submitLabel={isNew ? "Create Broadcast" : "Save Changes"}
          isSubmitting={isSaving}
        />
      </FormLayout>
    </div>
  );
}
