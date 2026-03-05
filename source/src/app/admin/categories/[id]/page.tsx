"use client";

import {
    useState,
    useEffect,
    useCallback,
    FormEvent,
    useMemo,
    ChangeEvent,
    useRef,
} from "react";
import Link from "next/link";
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
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { locales, defaultLocale } from "@/i18n/config";
import type { Language } from "@/types/language.types";
import { DeleteConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { slugify } from "@/lib/slugify";

type LocalizedValues = Record<string, string>;

interface CategoryFormData {
    name: LocalizedValues;
    slug: string;
    description: LocalizedValues | null;
    icon: string | null;
    cover: string | null;
    parentId: string;
    positions: number[];
    order: number;
}

interface CategoryOption {
    id: string;
    name: string;
}

interface CategoryResponse {
    id: string;
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    positions: number[];
    order: number;
    icon?: string | null;
    coverUrl?: string | null;
    languageCode?: string;
    translations?: {
        name: LocalizedValues;
        description: LocalizedValues;
    };
}

const fallbackLocaleLabels: Record<string, string> = {
    az: "Azərbaycan",
    en: "English",
    ru: "Русский",
    tr: "Türkçe",
};

const generateSlug = slugify;

export default function CategoryEditPage() {
    const router = useRouter();
    const params = useParams();
    const { success, error } = useToast();

    const isNew = params.id === "new";
    const categoryId = isNew ? null : (params.id as string);

    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLanguagesLoading, setIsLanguagesLoading] = useState(true);

    const baseLocales = useMemo(
        () => (locales.length ? [...locales] : [defaultLocale]),
        [],
    );
    const fallbackLocale = baseLocales[0] || defaultLocale;

    const [availableLocales, setAvailableLocales] = useState<string[]>(
        baseLocales,
    );
    const [activeLocale, setActiveLocale] = useState<string>(fallbackLocale);
    const languageLocales = useMemo(() => {
        if (languages.length) {
            return Array.from(
                new Set(languages.map((lang) => lang.code.toLowerCase())),
            );
        }
        return baseLocales.length ? baseLocales : [defaultLocale];
    }, [languages, baseLocales, defaultLocale]);

    const languageLabelMap = useMemo(() => {
        const map: Record<string, string> = {};
        for (const language of languages) {
            const key = language.code.toLowerCase();
            map[key] =
                language.nativeName ||
                language.name ||
                key.toUpperCase();
        }
        return map;
    }, [languages]);

    const formatLocaleLabel = useCallback(
        (code: string) => {
            const normalized = code.toLowerCase();
            return (
                languageLabelMap[normalized] ||
                fallbackLocaleLabels[normalized] ||
                normalized.toUpperCase()
            );
        },
        [languageLabelMap],
    );

    const [formData, setFormData] = useState<CategoryFormData>({
        name: {},
        slug: "",
        description: null,
        icon: null,
        cover: null,
        parentId: "",
        positions: [1, 2],
        order: 0,
    });

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isIconUploading, setIsIconUploading] = useState(false);
    const [isCoverUploading, setIsCoverUploading] = useState(false);
    const [categories, setCategories] = useState<CategoryOption[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [autoSlug, setAutoSlug] = useState(true);
    const [slugLocale, setSlugLocale] = useState<string | null>(null);
    const iconInputRef = useRef<HTMLInputElement | null>(null);
    const coverInputRef = useRef<HTMLInputElement | null>(null);

    const fetchLanguages = useCallback(async () => {
        setIsLanguagesLoading(true);
        try {
            const response = await fetch("/api/languages?active=1");
            const data = await response.json();

            if (data.success) {
                setLanguages(data.data || []);
            } else {
                error("Failed to load languages", data.error);
            }
        } catch (err) {
            console.error("Failed to load languages", err);
            error("Failed to load languages", "Please try again later");
        } finally {
            setIsLanguagesLoading(false);
        }
    }, [error]);

    const fetchCategory = useCallback(async () => {
        if (!categoryId) return;

        setIsLoading(true);
        try {
            const response = await fetch(
                `/api/categories/${categoryId}?mode=edit`,
            );
            const data = await response.json();

            if (data.success && data.data) {
                const category = data.data as CategoryResponse;
                const translations =
                    category.translations ??
                    ({
                        name: category.name
                            ? { [fallbackLocale]: category.name }
                            : {},
                        description: category.description
                            ? { [fallbackLocale]: category.description }
                            : {},
                    } as CategoryResponse["translations"]);

                const nameMap = translations?.name ?? {};
                const descMap = translations?.description ?? {};
                const initialLocale = category.languageCode
                    ? category.languageCode.toLowerCase()
                    : fallbackLocale;

                setActiveLocale(initialLocale);
                setFormData({
                    name: nameMap,
                    slug: category.slug || "",
                    description: Object.keys(descMap).length ? descMap : null,
                    icon: category.icon ?? null,
                    cover: category.coverUrl ?? null,
                    parentId: category.parentId || "",
                    positions:
                        category.positions && category.positions.length
                            ? category.positions
                            : [1, 2],
                    order:
                        typeof category.order === "number" ? category.order : 0,
                });
                setAutoSlug(false);
                setSlugLocale(null);
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
    }, [
        categoryId,
        error,
        router,
        fallbackLocale,
    ]);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await fetch("/api/categories");
            const data = await response.json();

            if (data.success) {
                // Filter out current category to prevent self-reference
                const filtered = (data.data || []).filter(
                    (c: CategoryOption) => c.id !== categoryId,
                );
                setCategories(filtered);
            }
        } catch (err) {
            console.error("Failed to load categories", err);
            // Silently fail
        }
    }, [categoryId]);

    useEffect(() => {
        fetchLanguages();
    }, [fetchLanguages]);

    useEffect(() => {
        fetchCategories();
        if (!isNew) {
            fetchCategory();
        }
    }, [isNew, fetchCategory, fetchCategories]);

    useEffect(() => {
        if (!languageLocales.length) return;
        setAvailableLocales(languageLocales);
        setActiveLocale((prev) =>
            languageLocales.includes(prev)
                ? prev
                : languageLocales[0] || fallbackLocale,
        );
    }, [languageLocales, fallbackLocale]);

    useEffect(() => {
        if (!autoSlug) return;
        const targetLocale = slugLocale ?? activeLocale;
        if (activeLocale !== targetLocale) return;
        const nextName = formData.name[targetLocale]?.trim();
        if (!nextName) return;

        setFormData((prev) => ({
            ...prev,
            slug: generateSlug(nextName),
        }));
        if (!slugLocale) {
            setSlugLocale(targetLocale);
        }
    }, [formData.name, activeLocale, autoSlug, slugLocale]);

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

    const handleLocalizedChange = (
        field: "name" | "description",
        value: string,
    ) => {
        setFormData((prev) => {
            const next = { ...prev };
            const currentMap =
                field === "name"
                    ? { ...prev.name }
                    : { ...(prev.description ?? {}) };
            const trimmed = value.trim();
            if (trimmed.length === 0) {
                delete currentMap[activeLocale];
            } else {
                currentMap[activeLocale] = value;
            }

            if (field === "name") {
                next.name = currentMap;
            } else {
                next.description = Object.keys(currentMap).length
                    ? currentMap
                    : null;
            }
            return next;
        });

        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const resolveUploadSlug = () => {
        const trimmed = formData.slug.trim();
        if (trimmed) return trimmed;
        const fallback =
            formData.name[activeLocale]?.trim() ||
            Object.values(formData.name).find((value) => value.trim().length) ||
            "category";
        return generateSlug(fallback) || "category";
    };

    const uploadCategoryAsset = async (file: File, field: string) => {
        const payload = new FormData();
        payload.append("file", file);
        payload.append("entity", "categories");
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

    const handleIconUpload = async (
        event: ChangeEvent<HTMLInputElement>,
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            error("Invalid file", "Please upload an image file");
            event.target.value = "";
            return;
        }

        setIsIconUploading(true);
        try {
            const url = await uploadCategoryAsset(file, "icon");
            setFormData((prev) => ({
                ...prev,
                icon: url,
            }));
            success("Icon uploaded", "Category icon updated");
        } catch (err) {
            console.error("Icon upload failed", err);
            error("Upload failed", "Please try again later");
        } finally {
            setIsIconUploading(false);
            event.target.value = "";
        }
    };

    const handleCoverUpload = async (
        event: ChangeEvent<HTMLInputElement>,
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
            const url = await uploadCategoryAsset(file, "cover");
            setFormData((prev) => ({
                ...prev,
                cover: url,
            }));
            success("Cover uploaded", "Category cover updated");
        } catch (err) {
            console.error("Cover upload failed", err);
            error("Upload failed", "Please try again later");
        } finally {
            setIsCoverUploading(false);
            event.target.value = "";
        }
    };

    const handleIconRemove = () => {
        setFormData((prev) => ({
            ...prev,
            icon: null,
        }));
    };

    const handleCoverRemove = () => {
        setFormData((prev) => ({
            ...prev,
            cover: null,
        }));
    };

    const triggerIconPicker = () => {
        iconInputRef.current?.click();
    };

    const triggerCoverPicker = () => {
        coverInputRef.current?.click();
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        const hasName = Object.values(formData.name).some((value) =>
            value.trim().length > 0,
        );
        if (!hasName) {
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
                name: formData.name,
                slug: formData.slug.trim(),
                description: formData.description,
                icon: formData.icon,
                coverUrl: formData.cover,
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
                    "Category has been saved successfully",
                );
                router.push("/admin/categories");
            } else {
                if (data.error?.code === "SLUG_TAKEN") {
                    setErrors((prev) => ({
                        ...prev,
                        slug: data.error.message,
                    }));
                }
                error(
                    "Failed to save category",
                    data.error?.message || data.error,
                );
            }
        } catch (err) {
            console.error("Failed to save category", err);
            error("Failed to save category", "Please try again later");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!categoryId) return;
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/categories/${categoryId}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (data.success) {
                success("Category deleted", "Category has been removed.");
                router.push("/admin/categories");
            } else {
                const message =
                    typeof data.error === "string"
                        ? data.error
                        : data.error?.message || "Please try again later";
                error("Failed to delete category", message);
            }
        } catch (err) {
            console.error("Failed to delete category", err);
            error("Failed to delete category", "Please try again later");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
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

    const activeName = formData.name[activeLocale] || "";
    const activeDescription = formData.description?.[activeLocale] || "";

    return (
        <div className="space-y-8">
            <PageHeader
                title={isNew ? "New Category" : "Edit Category"}
                description={
                    isNew
                        ? "Create a new category"
                        : `Editing: ${activeName || formData.slug || "Category"}`
                }
                backHref="/admin/categories"
                backLabel="Back to Categories"
            />

            <FormLayout onSubmit={handleSubmit} className="max-w-4xl">
                <FormSection
                    title="Translations"
                    description="Add translations for each language. Switching language shows its own fields."
                >
                    <Tabs
                        value={activeLocale}
                        onValueChange={(value) => setActiveLocale(value)}
                        className="admin-tabs"
                    >
                        <div className="admin-tabs-header">
                            <div className="admin-tabs-meta">
                                <div className="admin-tabs-label">Language</div>
                                <TabsList className="admin-tabs-list">
                                    {availableLocales.map((locale) => (
                                        <TabsTrigger
                                            key={locale}
                                            value={locale}
                                            className="admin-tabs-trigger"
                                            disabled={isLanguagesLoading}
                                        >
                                            {formatLocaleLabel(locale)}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>
                            <Link
                                href="/admin/languages"
                                className="admin-tabs-link"
                            >
                                Manage languages
                            </Link>
                        </div>

                        <div className="admin-tabs-body">
                            <FormField
                                label="Name"
                                htmlFor="name"
                                required
                                error={errors.name}
                            >
                                <Input
                                    id="name"
                                    value={activeName}
                                    onChange={(e) =>
                                        handleLocalizedChange("name", e.target.value)
                                    }
                                    placeholder="Services"
                                    error={!!errors.name}
                                />
                            </FormField>

                            <FormField
                                label="Description"
                                htmlFor="description"
                                hint="Optional description for the category"
                            >
                                <Textarea
                                    id="description"
                                    value={activeDescription}
                                    onChange={(e) =>
                                        handleLocalizedChange("description", e.target.value)
                                    }
                                    placeholder="Services"
                                    rows={4}
                                />
                            </FormField>
                        </div>
                    </Tabs>
                </FormSection>

                <FormSection title="Category Details">
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
                            onChange={(e) => handleChange("slug", e.target.value)}
                            placeholder="services"
                            error={!!errors.slug}
                        />
                    </FormField>

                    <FormField
                        label="Icon"
                        hint="Upload a category icon (PNG, JPG, SVG)"
                    >
                        <div className="admin-icon-field">
                            <div className="admin-icon-preview">
                                {formData.icon ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={formData.icon}
                                        alt="Category icon"
                                    />
                                ) : (
                                    <span className="admin-icon-placeholder">
                                        No icon
                                    </span>
                                )}
                            </div>
                            <div className="admin-icon-actions">
                                <input
                                    ref={iconInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleIconUpload}
                                    className="hidden"
                                    disabled={isIconUploading}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={triggerIconPicker}
                                    disabled={isIconUploading}
                                >
                                    {isIconUploading
                                        ? "Uploading..."
                                        : formData.icon
                                            ? "Change Icon"
                                            : "Upload Icon"}
                                </Button>
                                {formData.icon && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="admin-icon-remove"
                                        onClick={handleIconRemove}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>
                    </FormField>

                    <FormField
                        label="Cover"
                        hint="Upload a category cover image (PNG, JPG, WEBP)"
                    >
                        <div className="admin-icon-field admin-cover-field">
                            <div className="admin-icon-preview admin-cover-preview">
                                {formData.cover ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        src={formData.cover}
                                        alt="Category cover"
                                    />
                                ) : (
                                    <span className="admin-icon-placeholder">
                                        No cover
                                    </span>
                                )}
                            </div>
                            <div className="admin-icon-actions">
                                <input
                                    ref={coverInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleCoverUpload}
                                    className="hidden"
                                    disabled={isCoverUploading}
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={triggerCoverPicker}
                                    disabled={isCoverUploading}
                                >
                                    {isCoverUploading
                                        ? "Uploading..."
                                        : formData.cover
                                            ? "Change Cover"
                                            : "Upload Cover"}
                                </Button>
                                {formData.cover && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="admin-icon-remove"
                                        onClick={handleCoverRemove}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>
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
                           
                        />
                    </FormField>

                    <FormField
                        label="Menu Position"
                        hint="Header (pos 1), Footer (pos 2). Turn both on to show in both menus."
                        error={errors.positions}
                    >
                        <div className="admin-toggle-group">
                            <div className="admin-toggle-option">
                                <Switch
                                    checked={formData.positions.includes(1)}
                                    onCheckedChange={(checked) =>
                                        setPosition(1, checked)
                                    }
                                />
                                <span className="admin-toggle-label">
                                    Header (1)
                                </span>
                            </div>
                            <div className="admin-toggle-option">
                                <Switch
                                    checked={formData.positions.includes(2)}
                                    onCheckedChange={(checked) =>
                                        setPosition(2, checked)
                                    }
                                />
                                <span className="admin-toggle-label">
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
                            <SelectTrigger>
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
                </FormSection>

                <div className="admin-form-actions">
                    {!isNew && (
                        <Button
                            type="button"
                            variant="outline"
                            className="admin-action-cancel"
                            onClick={() => setDeleteDialogOpen(true)}
                            disabled={isDeleting}
                        >
                            Delete
                        </Button>
                    )}
                    <FormActions
                        onCancel={() => router.push("/admin/categories")}
                        submitLabel={isNew ? "Create Category" : "Save Changes"}
                        isSubmitting={isSaving}
                    />
                </div>
            </FormLayout>

            {!isNew && (
                <DeleteConfirmDialog
                    open={deleteDialogOpen}
                    onOpenChange={setDeleteDialogOpen}
                    itemName="Category"
                    description="Bu əməliyyat geri qaytarılmır. Kateqoriya silinəcək və varsa sub‑kateqoriyalar top‑level olacaq."
                    onConfirm={handleDelete}
                    isLoading={isDeleting}
                />
            )}
        </div>
    );
}

