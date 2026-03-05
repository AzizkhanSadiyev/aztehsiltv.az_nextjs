"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import {
  PageHeader,
  CreateButton,
  RefreshButton,
} from "@/components/admin/ui/PageHeader";
import {
  SearchEmptyState,
  TranslationsEmptyState,
} from "@/components/admin/ui/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, Languages, Search, X } from "lucide-react";
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

export default function TranslationsPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [translations, setTranslations] = useState<Translation[]>([]);
  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [translationToDelete, setTranslationToDelete] =
    useState<Translation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const languageCodes = useMemo(
    () =>
      languages.length
        ? languages.map((lang) => lang.code)
        : [...locales],
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

  const fetchTranslations = useCallback(
    async (showRefreshIndicator = false) => {
      showRefreshIndicator ? setIsRefreshing(true) : setIsLoading(true);
      try {
        const response = await fetch("/api/translations");
        const data = await response.json();
        if (data.success) {
          setTranslations(data.data || []);
        } else {
          error("Failed to load translations", data.error);
        }
      } catch (err) {
        console.error("Failed to load translations", err);
        error("Failed to load translations", "Please try again later");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [error],
  );

  useEffect(() => {
    fetchLanguages();
    fetchTranslations();
  }, [fetchLanguages, fetchTranslations]);

  const filteredTranslations = translations.filter((item) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (item.key.toLowerCase().includes(query)) return true;
    return Object.values(item.values || {}).some((value) =>
      value.toLowerCase().includes(query),
    );
  });

  const columns = useMemo<ColumnDef<Translation>[]>(() => {
    const valueColumns = languageCodes.map<ColumnDef<Translation>>((code) => ({
      id: code,
      header: code.toUpperCase(),
      accessorFn: (row) => row.values?.[code] || "",
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">
          {String(getValue() || "").slice(0, 80)}
        </span>
      ),
    }));

    return [
      {
        accessorKey: "key",
        header: "Key",
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{row.original.key}</span>
          </div>
        ),
      },
      ...valueColumns,
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
                router.push(`/admin/translations/${row.original.id}`)
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
                setTranslationToDelete(row.original);
                setDeleteDialogOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
        ),
      },
    ];
  }, [languageCodes, router]);

  const handleDelete = async () => {
    if (!translationToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/translations/${translationToDelete.id}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (data.success) {
        success("Translation deleted", `"${translationToDelete.key}" removed`);
        setTranslations((prev) =>
          prev.filter((item) => item.id !== translationToDelete.id),
        );
      } else {
        error("Failed to delete translation", data.error);
      }
    } catch (err) {
      console.error("Failed to delete translation", err);
      error("Failed to delete translation", "Please try again later");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setTranslationToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-40 mb-2" />
            <Skeleton className="h-4 w-56" />
          </div>
          <Skeleton className="h-10 w-40" />
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
        title="Translations"
        description="Manage phrase translations used across the site"
      >
        <RefreshButton
          onClick={() => fetchTranslations(true)}
          isLoading={isRefreshing}
        />
        <CreateButton href="/admin/translations/new" label="New Translation" />
      </PageHeader>

      <DataTable
        columns={columns}
        data={filteredTranslations}
        toolbar={
          <div className="admin-toolbar">
            <div className="admin-toolbar-search">
              <Search className="admin-toolbar-search-icon" />
              <input
                type="text"
                placeholder="Search translations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search translations"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  <span className="sr-only">Clear search</span>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        }
        emptyState={
          translations.length === 0 ? (
            <TranslationsEmptyState
              onCreateNew={() => router.push("/admin/translations/new")}
            />
          ) : filteredTranslations.length === 0 ? (
            <SearchEmptyState query={searchQuery} />
          ) : undefined
        }
        minTableWidth={900}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName="Translation"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
