"use client";

import { useCallback, useEffect, useMemo, useState, FormEvent } from "react";
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
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { locales } from "@/i18n/config";
import type { Translation } from "@/types/translation.types";

interface LanguageOption {
  id: string;
  code: string;
  name: string;
  nativeName?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

interface TranslationFormData {
  key: string;
  values: Record<string, string>;
  description: string;
}

const ensureLocalized = (value: Record<string, string> | undefined, codes: string[]) =>
  codes.reduce<Record<string, string>>((acc, code) => {
    acc[code] = value?.[code] ?? "";
    return acc;
  }, {});

export default function TranslationEditPage() {
  const router = useRouter();
  const params = useParams();
  const { success, error } = useToast();

  const isNew = params.id === "new";
  const translationId = isNew ? null : (params.id as string);

  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [formData, setFormData] = useState<TranslationFormData>({
    key: "",
    values: {},
    description: "",
  });
  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  const fetchTranslation = useCallback(async () => {
    if (!translationId) return;
    setIsLoading(true);
    try {
      const response = await fetch(`/api/translations/${translationId}`);
      const data = await response.json();
      if (data.success && data.data) {
        const translation = data.data as Translation;
        setFormData({
          key: translation.key || "",
          values: ensureLocalized(translation.values, languageCodes),
          description: translation.description || "",
        });
      } else {
        error("Failed to load translation", data.error);
        router.push("/admin/translations");
      }
    } catch (err) {
      console.error("Failed to load translation", err);
      error("Failed to load translation", "Please try again later");
      router.push("/admin/translations");
    } finally {
      setIsLoading(false);
    }
  }, [translationId, error, router, languageCodes]);

  useEffect(() => {
    fetchLanguages();
  }, [fetchLanguages]);

  useEffect(() => {
    if (!isNew) {
      fetchTranslation();
    } else {
      setFormData((prev) => ({
        ...prev,
        values: ensureLocalized(prev.values, languageCodes),
      }));
    }
  }, [isNew, fetchTranslation, languageCodes]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      values: ensureLocalized(prev.values, languageCodes),
    }));
  }, [languageCodes]);

  const handleValueChange = (code: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      values: { ...prev.values, [code]: value },
    }));
  };

  const validate = (): boolean => {
    const nextErrors: Record<string, string> = {};
    const trimmedKey = formData.key.trim();

    if (!trimmedKey) {
      nextErrors.key = "Key is required";
    } else if (!/^[A-Za-z0-9_.-]+$/.test(trimmedKey)) {
      nextErrors.key =
        "Key can only include letters, numbers, '.', '_' or '-'";
    }

    const hasValue = Object.values(formData.values).some(
      (value) => value.trim().length > 0,
    );
    if (!hasValue) {
      nextErrors.values = "Enter at least one translation value";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    try {
      const url = isNew
        ? "/api/translations"
        : `/api/translations/${translationId}`;
      const method = isNew ? "POST" : "PUT";
      const values = Object.fromEntries(
        Object.entries(formData.values).map(([code, value]) => [
          code,
          value.trim(),
        ]),
      );
      const payload = {
        key: formData.key.trim().toLowerCase(),
        values,
        description: formData.description.trim() || null,
        ...(isNew ? {} : { id: translationId }),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (data.success) {
        success(
          isNew ? "Translation created" : "Translation updated",
          `"${payload.key}" saved`,
        );
        router.push("/admin/translations");
      } else {
        if (data.error?.code === "KEY_TAKEN") {
          setErrors((prev) => ({
            ...prev,
            key: data.error.message,
          }));
        }
        error("Failed to save translation", data.error?.message || data.error);
      }
    } catch (err) {
      console.error("Failed to save translation", err);
      error("Failed to save translation", "Please try again later");
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
        title={isNew ? "New Translation" : "Edit Translation"}
        description={
          isNew
            ? "Create a new translation key"
            : `Editing: ${formData.key || "Translation"}`
        }
        backHref="/admin/translations"
        backLabel="Back to Translations"
      />

      <FormLayout onSubmit={handleSubmit} className="max-w-4xl">
        <FormSection title="Translation Key">
          <FormField
            label="Key"
            htmlFor="key"
            required
            error={errors.key}
            hint="Use dot notation, e.g. home.about.title"
          >
            <Input
              id="key"
              value={formData.key}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, key: e.target.value }))
              }
              placeholder="home.about.title"
              error={!!errors.key}
            />
          </FormField>

          <FormField
            label="Description"
            htmlFor="description"
            hint="Optional context for translators"
          >
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Shown on homepage about section"
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Translations"
          description="Enter localized text for each language."
        >
          {errors.values && (
            <p className="text-sm text-destructive mb-2">{errors.values}</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {languageCodes.map((code) => (
              <FormField
                key={`translation-${code}`}
                label={`Value (${code.toUpperCase()})`}
              >
                <Textarea
                  rows={2}
                  value={formData.values?.[code] ?? ""}
                  onChange={(e) => handleValueChange(code, e.target.value)}
                  placeholder="Translation"
                />
              </FormField>
            ))}
          </div>
        </FormSection>

        <FormActions
          onCancel={() => router.push("/admin/translations")}
          submitLabel={isNew ? "Create Translation" : "Save Changes"}
          isSubmitting={isSaving}
        />
      </FormLayout>
    </div>
  );
}
