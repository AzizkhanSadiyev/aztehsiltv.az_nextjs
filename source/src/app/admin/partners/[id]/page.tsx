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

interface PartnerFormData {
  name: string;
  logo: string;
  websiteUrl: string;
  status: "draft" | "published";
  sortOrder: number;
}

export default function PartnerEditPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();

  const isNew = params.id === "new";
  const partnerId = isNew ? null : (params.id as string);

  const [formData, setFormData] = useState<PartnerFormData>({
    name: "",
    logo: "",
    websiteUrl: "",
    status: "draft",
    sortOrder: 0,
  });

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchPartner = useCallback(async () => {
    if (!partnerId) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/partners/${partnerId}`);
      const data = await res.json();
      if (data.success && data.data) {
        const partner = data.data;
        setFormData({
          name: partner.name || "",
          logo: partner.logo || "",
          websiteUrl: partner.websiteUrl || "",
          status: partner.status || "draft",
          sortOrder:
            typeof partner.sortOrder === "number" ? partner.sortOrder : 0,
        });
      } else {
        error("Failed to load partner", data.error);
        router.push("/admin/partners");
      }
    } catch (err) {
      error("Failed to load partner", "Please try again later");
      router.push("/admin/partners");
    } finally {
      setIsLoading(false);
    }
  }, [partnerId, error, router]);

  useEffect(() => {
    if (!isNew) {
      fetchPartner();
    }
  }, [isNew, fetchPartner]);

  const handleChange = (field: keyof PartnerFormData, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};

    if (!formData.name.trim()) nextErrors.name = "Name is required";
    if (!formData.logo.trim()) nextErrors.logo = "Logo URL is required";

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
        setFormData((prev) => ({ ...prev, logo: data.data.url }));
        success("Logo uploaded", "Logo URL set from upload");
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
      const trimmedWebsite = formData.websiteUrl.trim();
      const normalizedWebsite =
        trimmedWebsite && !/^https?:\/\//i.test(trimmedWebsite)
          ? `https://${trimmedWebsite}`
          : trimmedWebsite || null;
      const url = isNew ? "/api/partners" : `/api/partners/${partnerId}`;
      const method = isNew ? "POST" : "PUT";
      const payload = {
        name: formData.name,
        logo: formData.logo,
        websiteUrl: normalizedWebsite,
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
          isNew ? "Partner created" : "Partner updated",
          `"${formData.name}" has been ${isNew ? "created" : "updated"}`,
        );
        router.push("/admin/partners");
      } else {
        error("Failed to save partner", data.error);
      }
    } catch (err) {
      error("Failed to save partner", "Please try again later");
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
        title={isNew ? "New Partner" : "Edit Partner"}
        description={
          isNew ? "Create a new partner" : `Editing: ${formData.name || "Partner"}`
        }
        backHref="/admin/partners"
        backLabel="Back to Partners"
      />

      <FormLayout onSubmit={handleSubmit} className="max-w-4xl">
        <FormSection title="Basics">
          <FormField label="Name" htmlFor="name" required error={errors.name}>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Mastercard"
              error={!!errors.name}
             
            />
          </FormField>

          <FormField label="Website URL" htmlFor="websiteUrl">
            <Input
              id="websiteUrl"
              value={formData.websiteUrl}
              onChange={(e) => handleChange("websiteUrl", e.target.value)}
              placeholder="https://partner.com"
             
            />
          </FormField>
        </FormSection>

        <FormSection title="Logo">
          <FormField
            label="Logo URL"
            htmlFor="logo"
            required
            error={errors.logo}
            hint="Full URL or /assets/... path"
          >
            <div className="space-y-2">
              <Input
                id="logo"
                value={formData.logo}
                onChange={(e) => handleChange("logo", e.target.value)}
                placeholder="/assets/images/partner_1.png"
                error={!!errors.logo}
              />
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
                  {isUploading ? "Uploading..." : "Upload logo"}
                </button>
                {isUploading && (
                  <span className="text-xs text-muted-foreground">
                    Uploading...
                  </span>
                )}
              </div>
            </div>
          </FormField>
        </FormSection>

        <FormSection title="Status">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Status" htmlFor="status">
              <Select
                value={formData.status}
                onValueChange={(value) =>
                  handleChange("status", value as PartnerFormData["status"])
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
          onCancel={() => router.push("/admin/partners")}
          submitLabel={isNew ? "Create Partner" : "Save Changes"}
          isSubmitting={isSaving}
        />
      </FormLayout>
    </div>
  );
}
