"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Edit, FolderTree, Search, Download, X } from "lucide-react";
import {
    PageHeader,
    CreateButton,
    RefreshButton,
} from "@/components/admin/ui/PageHeader";
import {
    CategoriesEmptyState,
    SearchEmptyState,
} from "@/components/admin/ui/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";

interface Category {
    id: string;
    name: string;
    slug: string;
    description: string;
    parentId: string | null;
    parent?: { name: string };
    languageCode: string;
    order: number;
    positions: number[];
    videoCount?: number;
    createdAt: string;
    updatedAt: string;
}

type CategoryRow = Category & {
    depth?: number;
    parentName?: string;
    hasChildren?: boolean;
    childCount?: number;
};

export default function CategoriesPage() {
    const router = useRouter();
    const { success, error } = useToast();

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [categoryToDelete, setCategoryToDelete] =
        useState<CategoryRow | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCategories = useCallback(
        async (showRefreshIndicator = false) => {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            try {
                const response = await fetch("/api/categories", {
                    cache: "no-store",
                });
                const data = await response.json();

                if (data.success) {
                    setCategories(data.data || []);
                } else {
                    error("Failed to load categories", data.error);
                }
            } catch (err) {
                console.error("Failed to load categories", err);
                error("Failed to load categories", "Please try again later");
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [error],
    );

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleDelete = async () => {
        if (!categoryToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(
                `/api/categories/${categoryToDelete.id}`,
                {
                    method: "DELETE",
                },
            );
            let data: any = null;
            try {
                data = await response.json();
            } catch {
                data = null;
            }

            if (response.ok && data?.success) {
                success(
                    "Category deleted",
                    `"${categoryToDelete.name}" has been deleted`,
                );
                setCategories((prev) =>
                    prev.filter((c) => c.id !== categoryToDelete.id),
                );
                await fetchCategories(true);
            } else {
                if (!response.ok && !data) {
                    error(
                        "Failed to delete category",
                        response.statusText || "Please try again later",
                    );
                    return;
                }
                const message =
                    typeof data?.error === "string"
                        ? data.error
                        : data?.error?.message || "Please try again later";
                error("Failed to delete category", message);
            }
        } catch (err) {
            console.error("Failed to delete category", err);
            error("Failed to delete category", "Please try again later");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setCategoryToDelete(null);
        }
    };

    const orderedCategories = useMemo(() => {
        if (!categories.length) return [];

        const byId = new Map(categories.map((cat) => [cat.id, cat]));
        const childrenMap = new Map<string, Category[]>();
        const roots: Category[] = [];

        categories.forEach((cat) => {
            if (cat.parentId && byId.has(cat.parentId)) {
                const list = childrenMap.get(cat.parentId) ?? [];
                list.push(cat);
                childrenMap.set(cat.parentId, list);
            } else {
                roots.push(cat);
            }
        });

        const sortByOrder = (a: Category, b: Category) => {
            const orderDiff = (a.order ?? 0) - (b.order ?? 0);
            if (orderDiff !== 0) return orderDiff;
            return a.name.localeCompare(b.name);
        };

        roots.sort(sortByOrder);
        childrenMap.forEach((list) => list.sort(sortByOrder));

        const ordered: CategoryRow[] = [];
        roots.forEach((parent) => {
            const children = childrenMap.get(parent.id) || [];
            ordered.push({
                ...parent,
                depth: 0,
                hasChildren: children.length > 0,
                childCount: children.length,
            });
            children.forEach((child) => {
                const hasChildren = Boolean(childrenMap.get(child.id)?.length);
                ordered.push({
                    ...child,
                    depth: 1,
                    parentName: parent.name,
                    hasChildren,
                    childCount: childrenMap.get(child.id)?.length || 0,
                });
            });
        });

        return ordered;
    }, [categories]);

    const filteredCategories = orderedCategories.filter(
        (category) =>
            searchQuery === "" ||
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.slug.toLowerCase().includes(searchQuery.toLowerCase()),
    );

    const openDeleteDialog = (category: CategoryRow) => {
        setCategoryToDelete(category);
        setDeleteDialogOpen(true);
    };

    const columns: ColumnDef<CategoryRow>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const category = row.original;
                const isChild = Boolean(category.parentId);
                return (
                    <div
                        className={cn(
                            "admin-category-name",
                            isChild && "is-child",
                        )}
                    >
                        {isChild && (
                            <span
                                className="admin-category-branch"
                                aria-hidden="true"
                            />
                        )}
                        <FolderTree
                            className={cn(
                                "admin-category-icon",
                                isChild && "is-child",
                            )}
                        />
                        <div>
                            <p
                                className={cn(
                                    "admin-category-title",
                                    isChild && "is-child",
                                )}
                            >
                                {category.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                /{category.slug}
                            </p>
                            {isChild && category.parentName && (
                                <span className="admin-category-parent">
                                    Main: {category.parentName}
                                </span>
                            )}
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "parent",
            header: "Parent",
            cell: ({ row }) => {
                const category = row.original;
                return (
                    category.parent?.name || (
                        <span className="text-muted-foreground">-</span>
                    )
                );
            },
        },
        {
            accessorKey: "videoCount",
            header: "Videos",
            cell: ({ row }) => (
                <Badge variant="secondary">
                    {row.getValue<number>("videoCount") || 0}
                </Badge>
            ),
        },
        {
            accessorKey: "languageCode",
            header: "Language",
            cell: ({ row }) => (
                <Badge variant="outline" className="uppercase">
                    {row.getValue("languageCode")}
                </Badge>
            ),
        },
        {
            accessorKey: "order",
            header: "Order",
            cell: ({ row }) => (
                <Badge variant="secondary">{row.getValue("order")}</Badge>
            ),
        },
        {
            accessorKey: "positions",
            header: "Positions",
            cell: ({ row }) => {
                const positions = row.original.positions || [];
                if (!positions.length) {
                    return <span className="text-muted-foreground">-</span>;
                }
                const labels = [];
                if (positions.includes(1)) labels.push("Header");
                if (positions.includes(2)) labels.push("Footer");
                return (
                    <div className="flex gap-1">
                        {labels.map((label) => (
                            <Badge key={label} variant="secondary">
                                {label}
                            </Badge>
                        ))}
                    </div>
                );
            },
        },
        {
            accessorKey: "updatedAt",
            header: "Updated",
            cell: ({ row }) => {
                const date = new Date(row.getValue("updatedAt"));
                return (
                    <span className="text-sm text-muted-foreground">
                        {date.toLocaleDateString()}
                    </span>
                );
            },
        },
        {
            id: "actions",
            header: () => <div className="text-right pr-2">Actions</div>,
            cell: ({ row }) => (
                <div className="admin-row-actions">
                    <Button
                        variant="outline"
                        size="sm"
                        className="admin-row-action"
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/admin/categories/${row.original.id}`);
                        }}
                    >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="admin-row-action admin-row-action--danger"
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            openDeleteDialog(row.original);
                        }}
                    >
                        Delete
                    </Button>
                </div>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <Skeleton className="h-8 w-32 mb-2" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-36" />
                </div>
                <div className="bg-card rounded-lg border p-4">
                    <Skeleton className="h-10 w-64 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
                            <Skeleton key={i} className="h-14 w-full" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Categories"
                description="Organize your content with categories"
            >
                <RefreshButton
                    onClick={() => fetchCategories(true)}
                    isLoading={isRefreshing}
                />
                <CreateButton
                    href="/admin/categories/new"
                    label="New Category"
                />
            </PageHeader>

            <DataTable
                columns={columns}
                data={filteredCategories}
                toolbar={
                    <div className="admin-toolbar">
                        <div className="admin-toolbar-search flex">
                            <Search className="admin-toolbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search categories"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="admin-confirm-dialog__close"
                                    style={{ top: "4px", right: "4px" }}
                                    onClick={() => setSearchQuery("")}
                                >
                                    <span className="sr-only">
                                        Clear search
                                    </span>
                                    <X className="h-4 w-4" />
                                </Button>
                            )}
                        </div>

                        {/* <div className="admin-toolbar-actions">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1 px-3"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div> */}
                    </div>
                }
                emptyState={
                    categories.length === 0 ? (
                        <CategoriesEmptyState
                            onCreateNew={() =>
                                router.push("/admin/categories/new")
                            }
                        />
                    ) : filteredCategories.length === 0 ? (
                        <SearchEmptyState query={searchQuery} />
                    ) : undefined
                }
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                itemName="Category"
                description={
                    categoryToDelete?.childCount
                        ? `Bu kateqoriya silindikdə ${categoryToDelete.childCount} sub-kateqoriya top-level olacaq. Bu əməliyyat geri qaytarılmır.`
                        : "Bu əməliyyat geri qaytarılmır. Kateqoriya daimi silinəcək."
                }
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
