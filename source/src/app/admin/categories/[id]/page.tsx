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
    Textarea,
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

interface CategoryFormData {
    name: string;
    slug: string;
    description: string;
    parentId: string;
    languageCode: string;
    positions: number[];
    order: number;
}

interface Category {
    id: string;
    name: string;
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
}

export default function CategoryEditPage() {
    const router = useRouter();
    const params = useParams();
    const { success, error } = useToast();

    const isNew = params.id === "new";
    const categoryId = isNew ? null : (params.id as string);

    const [formData, setFormData] = useState<CategoryFormData>({
        name: "",
        slug: "",
        description: "",
        parentId: "",
        languageCode: "en",
        positions: [1, 2],
        order: 0,
    });

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [categories, setCategories] = useState<Category[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [autoSlug, setAutoSlug] = useState(true);

    const fetchCategory = useCallback(async () => {
        if (!categoryId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/categories/${categoryId}`);
            const data = await response.json();

            if (data.success && data.data) {
                const category = data.data;
                setFormData({
                    name: category.name || "",
                    slug: category.slug || "",
                    description: category.description || "",
                    parentId: category.parentId || "",
                    languageCode: category.languageCode || "en",
                    positions:
                        category.positions && category.positions.length
                            ? category.positions
                            : [1, 2],
                    order:
                        typeof category.order === "number" ? category.order : 0,
                });
                setAutoSlug(false);
            } else {
                error("Failed to load category", data.error);
                router.push("/admin/categories");
            }
        } catch (err) {
            console.error("Failed to load category", err);
            error("Failed to load category", "Please try again later");
            router.push("/admin/categories");
        } finally {
            setIsLoading(false);
        }
    }, [categoryId, error, router]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch("/api/categories");
            const data = await response.json();

            if (data.success) {
                // Filter out current category to prevent self-reference
                const filtered = (data.data || []).filter(
                    (c: Category) => c.id !== categoryId,
                );
                setCategories(filtered);
            }
        } catch (err) {
            console.error("Failed to load categories", err);
            // Silently fail
        }
    }, [categoryId]);

    useEffect(() => {
        fetchCategories();
        if (!isNew) {
            fetchCategory();
        }
    }, [isNew, fetchCategory, fetchCategories]);

    useEffect(() => {
        if (autoSlug && formData.name) {
            setFormData((prev) => ({
                ...prev,
                slug: generateSlug(prev.name),
            }));
        }
    }, [formData.name, autoSlug]);

    const handleChange = (
        field: keyof CategoryFormData,
        value: string | number,
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }

        if (field === "slug") {
            setAutoSlug(false);
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = "Name is required";
        }

        if (!formData.slug.trim()) {
            newErrors.slug = "Slug is required";
        } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
            newErrors.slug =
                "Slug can only contain lowercase letters, numbers, and hyphens";
        }

        if (!formData.positions.length) {
            newErrors.positions = "Select at least one menu position";
        }

        if (formData.order < 0) {
            newErrors.order = "Order cannot be negative";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const setPosition = (pos: number, enabled: boolean) => {
        setFormData((prev) => {
            const has = prev.positions.includes(pos);
            const nextPositions = enabled
                ? has
                    ? prev.positions
                    : [...prev.positions, pos]
                : prev.positions.filter((p) => p !== pos);
            return { ...prev, positions: nextPositions };
        });

        if (errors.positions) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next.positions;
                return next;
            });
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        setIsSaving(true);
        try {
            const url = isNew
                ? "/api/categories"
                : `/api/categories/${categoryId}`;
            const method = isNew ? "POST" : "PUT";

            const payload = {
                ...formData,
                positions: Array.from(new Set(formData.positions)).sort(),
                order: Number(formData.order) || 0,
                parentId: formData.parentId || null,
            };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (data.success) {
                success(
                    isNew ? "Category created" : "Category updated",
                    `"${formData.name}" has been ${isNew ? "created" : "updated"}`,
                );
                router.push("/admin/categories");
            } else {
                error("Failed to save category", data.error);
            }
        } catch (err) {
            console.error("Failed to save category", err);
            error("Failed to save category", "Please try again later");
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
                <Skeleton className="h-96 w-full max-w-2xl rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={isNew ? "New Category" : "Edit Category"}
                description={
                    isNew
                        ? "Create a new category"
                        : `Editing: ${formData.name}`
                }
                backHref="/admin/categories"
                backLabel="Back to Categories"
            />

            <FormLayout onSubmit={handleSubmit} className="max-w-2xl">
                <FormSection title="Category Details">
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
                            placeholder="Enter category name"
                            error={!!errors.name}
                            style={{ marginTop: "8px" }}
                        />
                    </FormField>

                    <FormField
                        label="Slug"
                        htmlFor="slug"
                        required
                        error={errors.slug}
                        hint="URL-friendly version of the name"
                    >
                        <Input
                            id="slug"
                            value={formData.slug}
                            onChange={(e) =>
                                handleChange("slug", e.target.value)
                            }
                            placeholder="category-slug"
                            error={!!errors.slug}
                            style={{ marginTop: "8px" }}
                        />
                    </FormField>

                    <FormField
                        label="Description"
                        htmlFor="description"
                        hint="Optional description for the category"
                    >
                        <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) =>
                                handleChange("description", e.target.value)
                            }
                            placeholder="Enter category description..."
                            rows={3}
                            style={{ marginTop: "8px" }}
                        />
                    </FormField>

                    <FormField
                        label="Order"
                        htmlFor="order"
                        hint="Lower numbers show first"
                        error={errors.order}
                    >
                        <Input
                            id="order"
                            type="number"
                            min={0}
                            value={formData.order}
                            onChange={(e) =>
                                handleChange("order", Number(e.target.value))
                            }
                            style={{ marginTop: "8px" }}
                        />
                    </FormField>

                    <FormField
                        label="Menu Position"
                        hint="Header (pos 1), Footer (pos 2). Turn both on to show in both menus."
                        error={errors.positions}
                    >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
                            <div
                                className="flex items-center gap-3"
                                style={{ marginTop: "8px" }}
                            >
                                <Switch
                                    checked={formData.positions.includes(1)}
                                    onCheckedChange={(checked) =>
                                        setPosition(1, checked)
                                    }
                                />
                                <span className="text-sm text-foreground text-black">
                                    Header (1)
                                </span>
                            </div>
                            <div
                                className="flex items-center gap-3"
                                style={{ marginTop: "8px" }}
                            >
                                <Switch
                                    checked={formData.positions.includes(2)}
                                    onCheckedChange={(checked) =>
                                        setPosition(2, checked)
                                    }
                                />
                                <span className="text-sm text-foreground text-black">
                                    Footer (2)
                                </span>
                            </div>
                        </div>
                    </FormField>

                    <FormField
                        label="Parent Category"
                        htmlFor="parent"
                        hint="Optional parent for nested categories"
                    >
                        <Select
                            value={formData.parentId}
                            onValueChange={(value) =>
                                handleChange(
                                    "parentId",
                                    value === "none" ? "" : value,
                                )
                            }
                        >
                            <SelectTrigger style={{ marginTop: "8px" }}>
                                <SelectValue placeholder="Select parent category" />
                            </SelectTrigger>
                            <SelectContent className="text-black">
                                <SelectItem value="none">No Parent</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField label="Language" htmlFor="language">
                        <Select
                            value={formData.languageCode}
                            onValueChange={(value) =>
                                handleChange("languageCode", value)
                            }
                        >
                            <SelectTrigger style={{ marginTop: "8px" }}>
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent className="text-black">
                                <SelectItem value="az">Azərbaycan</SelectItem>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="ru">Русский</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                </FormSection>

                <FormActions
                    onCancel={() => router.push("/admin/categories")}
                    submitLabel={isNew ? "Create Category" : "Save Changes"}
                    isSubmitting={isSaving}
                />
            </FormLayout>
        </div>
    );
}
