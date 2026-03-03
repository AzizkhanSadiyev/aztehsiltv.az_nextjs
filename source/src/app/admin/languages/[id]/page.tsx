"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import {
    FormLayout,
    FormSection,
    FormField,
    FormActions,
    Input,
    Switch,
} from "@/components/admin/ui/FormLayout";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";

interface LanguageFormData {
    code: string;
    name: string;
    nativeName: string;
    isActive: boolean;
    sortOrder: number;
}

export default function LanguageEditPage() {
    const router = useRouter();
    const params = useParams();
    const { success, error } = useToast();

    const isNew = params.id === "new";
    const languageId = isNew ? null : (params.id as string);

    const [formData, setFormData] = useState<LanguageFormData>({
        code: "",
        name: "",
        nativeName: "",
        isActive: true,
        sortOrder: 0,
    });

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const fetchLanguage = useCallback(async () => {
        if (!languageId) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/languages/${languageId}`);
            const data = await response.json();

            if (data.success && data.data) {
                const language = data.data;
                setFormData({
                    code: language.code
                        ? String(language.code).toLowerCase()
                        : "",
                    name: language.name || "",
                    nativeName: language.nativeName || "",
                    isActive: Boolean(language.isActive),
                    sortOrder:
                        typeof language.sortOrder === "number"
                            ? language.sortOrder
                            : 0,
                });
            } else {
                error("Failed to load language", data.error);
                router.push("/admin/languages");
            }
        } catch (err) {
            console.error("Failed to load language", err);
            error("Failed to load language", "Please try again later");
            router.push("/admin/languages");
        } finally {
            setIsLoading(false);
        }
    }, [languageId, error, router]);

    useEffect(() => {
        if (!isNew) {
            fetchLanguage();
        }
    }, [isNew, fetchLanguage]);

    const handleChange = (
        field: keyof LanguageFormData,
        value: string | number | boolean,
    ) => {
        const nextValue =
            field === "code" && typeof value === "string"
                ? value.toLowerCase()
                : value;
        setFormData((prev) => ({ ...prev, [field]: nextValue }));

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

        if (!formData.code.trim()) {
            nextErrors.code = "Code is required";
        } else if (!/^[a-z0-9_-]+$/.test(formData.code.trim())) {
            nextErrors.code =
                "Code can only include letters, numbers, '-' or '_'";
        }

        if (!formData.name.trim()) {
            nextErrors.name = "Name is required";
        }

        if (formData.sortOrder < 0) {
            nextErrors.sortOrder = "Order cannot be negative";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!validate()) return;

        setIsSaving(true);
        try {
            const url = isNew ? "/api/languages" : `/api/languages/${languageId}`;
            const method = isNew ? "POST" : "PUT";
            const payload = {
                code: formData.code.trim().toLowerCase(),
                name: formData.name.trim(),
                nativeName: formData.nativeName.trim() || null,
                isActive: formData.isActive,
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
                    isNew ? "Language created" : "Language updated",
                    `"${payload.name}" has been saved`,
                );
                router.push("/admin/languages");
            } else {
                if (data.error?.code === "CODE_TAKEN") {
                    setErrors((prev) => ({
                        ...prev,
                        code: data.error.message,
                    }));
                }
                error(
                    "Failed to save language",
                    data.error?.message || data.error,
                );
            }
        } catch (err) {
            console.error("Failed to save language", err);
            error("Failed to save language", "Please try again later");
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
                title={isNew ? "New Language" : "Edit Language"}
                description={
                    isNew
                        ? "Create a new language"
                        : `Editing: ${formData.name || "Language"}`
                }
                backHref="/admin/languages"
                backLabel="Back to Languages"
            />

            <FormLayout onSubmit={handleSubmit} className="max-w-3xl">
                <FormSection
                    title="Language Details"
                    description="Languages control the available translation tabs."
                >
                    <FormField
                        label="Code"
                        htmlFor="code"
                        required
                        error={errors.code}
                        hint="Lowercase code, e.g. az, en, ru, tr"
                    >
                        <Input
                            id="code"
                            value={formData.code}
                            onChange={(e) =>
                                handleChange("code", e.target.value)
                            }
                            placeholder="az"
                            error={!!errors.code}
                           
                        />
                    </FormField>

                    <FormField
                        label="Name"
                        htmlFor="name"
                        required
                        error={errors.name}
                    >
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            placeholder="Azerbaijani"
                            error={!!errors.name}
                           
                        />
                    </FormField>

                    <FormField
                        label="Native Name"
                        htmlFor="nativeName"
                        hint="Optional label shown in the language tabs"
                    >
                        <Input
                            id="nativeName"
                            value={formData.nativeName}
                            onChange={(e) =>
                                handleChange("nativeName", e.target.value)
                            }
                            placeholder="Azerbaijani (native)"
                           
                        />
                    </FormField>
                </FormSection>

                <FormSection title="Settings">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <FormField label="Active">
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) =>
                                        handleChange("isActive", checked)
                                    }
                                />
                                <span className="text-sm text-foreground text-black">
                                    {formData.isActive ? "Active" : "Inactive"}
                                </span>
                            </div>
                        </FormField>

                        <FormField
                            label="Order"
                            htmlFor="sortOrder"
                            error={errors.sortOrder}
                            hint="Lower numbers show first"
                        >
                            <Input
                                id="sortOrder"
                                type="number"
                                min={0}
                                value={formData.sortOrder}
                                onChange={(e) =>
                                    handleChange(
                                        "sortOrder",
                                        Number(e.target.value),
                                    )
                                }
                               
                            />
                        </FormField>
                    </div>
                </FormSection>

                <FormActions
                    onCancel={() => router.push("/admin/languages")}
                    submitLabel={isNew ? "Create Language" : "Save Changes"}
                    isSubmitting={isSaving}
                />
            </FormLayout>
        </div>
    );
}
