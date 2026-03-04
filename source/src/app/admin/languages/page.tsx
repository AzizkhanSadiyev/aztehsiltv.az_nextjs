"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DataTable } from "@/components/admin/DataTable";
import {
    PageHeader,
    CreateButton,
    RefreshButton,
} from "@/components/admin/ui/PageHeader";
import {
    LanguagesEmptyState,
    SearchEmptyState,
} from "@/components/admin/ui/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Languages, Search, Download, X } from "lucide-react";
import type { Language } from "@/types/language.types";

export default function LanguagesPage() {
    const router = useRouter();
    const { success, error } = useToast();

    const [languages, setLanguages] = useState<Language[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [languageToDelete, setLanguageToDelete] = useState<Language | null>(
        null,
    );
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchLanguages = useCallback(
        async (showRefreshIndicator = false) => {
            showRefreshIndicator ? setIsRefreshing(true) : setIsLoading(true);
            try {
                const response = await fetch("/api/languages");
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
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [error],
    );

    useEffect(() => {
        fetchLanguages();
    }, [fetchLanguages]);

    const handleDelete = async () => {
        if (!languageToDelete) return;
        setIsDeleting(true);
        try {
            const response = await fetch(
                `/api/languages/${languageToDelete.id}`,
                { method: "DELETE" },
            );
            const data = await response.json();

            if (data.success) {
                success(
                    "Language deleted",
                    `"${languageToDelete.name}" has been deleted`,
                );
                setLanguages((prev) =>
                    prev.filter((item) => item.id !== languageToDelete.id),
                );
            } else {
                error("Failed to delete language", data.error);
            }
        } catch (err) {
            console.error("Failed to delete language", err);
            error("Failed to delete language", "Please try again later");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setLanguageToDelete(null);
        }
    };

    const filteredLanguages = languages.filter((language) => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            language.name.toLowerCase().includes(query) ||
            (language.nativeName || "").toLowerCase().includes(query) ||
            language.code.toLowerCase().includes(query)
        );
    });

    const columns: ColumnDef<Language>[] = [
        {
            accessorKey: "name",
            header: "Language",
            cell: ({ row }) => {
                const language = row.original;
                return (
                    <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-muted-foreground" />
                        <div>
                            <p className="font-medium">{language.name}</p>
                            <p className="text-xs text-muted-foreground">
                                {language.nativeName || language.code.toUpperCase()}
                            </p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "code",
            header: "Code",
            cell: ({ row }) => (
                <Badge variant="outline" className="uppercase">
                    {row.getValue("code")}
                </Badge>
            ),
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <Badge
                    variant="outline"
                    className={
                        row.getValue("isActive")
                            ? "bg-green-500/10 text-green-600"
                            : "bg-slate-200 text-slate-700"
                    }
                >
                    {row.getValue("isActive") ? "Active" : "Inactive"}
                </Badge>
            ),
        },
        {
            accessorKey: "sortOrder",
            header: "Order",
            cell: ({ row }) => (
                <Badge variant="secondary">{row.getValue("sortOrder")}</Badge>
            ),
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
                        onClick={() =>
                            router.push(`/admin/languages/${row.original.id}`)
                        }
                    >
                        <Edit className="h-3.5 w-3.5" />
                        Edit
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="admin-row-action admin-row-action--danger"
                        onClick={() => {
                            setLanguageToDelete(row.original);
                            setDeleteDialogOpen(true);
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
                title="Languages"
                description="Manage languages shown in translation tabs"
            >
                <RefreshButton
                    onClick={() => fetchLanguages(true)}
                    isLoading={isRefreshing}
                />
                <CreateButton href="/admin/languages/new" label="New Language" />
            </PageHeader>

            <DataTable
                columns={columns}
                data={filteredLanguages}
                toolbar={
                    <div className="admin-toolbar">
                        <div className="admin-toolbar-search">
                            <Search className="admin-toolbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search languages..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search languages"
                            />
                            {searchQuery && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
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
                                <span className="hidden sm:inline">
                                    Export
                                </span>
                            </Button>
                        </div> */}
                    </div>
                }
                emptyState={
                    languages.length === 0 ? (
                        <LanguagesEmptyState
                            onCreateNew={() =>
                                router.push("/admin/languages/new")
                            }
                        />
                    ) : filteredLanguages.length === 0 ? (
                        <SearchEmptyState query={searchQuery} />
                    ) : undefined
                }
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                itemName="Language"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
