"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
  SearchEmptyState,
} from "@/components/admin/ui/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Edit, FileText, Search, X } from "lucide-react";
import { defaultLocale } from "@/i18n/config";
import type { Page } from "@/types/page.types";

const resolveTitle = (page: Page) => {
  const title =
    page.title?.[defaultLocale] ||
    Object.values(page.title || {}).find((value) => value.trim().length > 0) ||
    "";
  return title || page.slug;
};

export default function PagesAdminPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [pages, setPages] = useState<Page[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<Page | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPages = useCallback(
    async (showRefreshIndicator = false) => {
      showRefreshIndicator ? setIsRefreshing(true) : setIsLoading(true);
      try {
        const response = await fetch("/api/pages");
        const data = await response.json();
        if (data.success) {
          setPages(data.data || []);
        } else {
          error("Failed to load pages", data.error);
        }
      } catch (err) {
        console.error("Failed to load pages", err);
        error("Failed to load pages", "Please try again later");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [error],
  );

  useEffect(() => {
    fetchPages();
  }, [fetchPages]);

  const filteredPages = pages.filter((page) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    if (page.slug.toLowerCase().includes(query)) return true;
    return resolveTitle(page).toLowerCase().includes(query);
  });

  const columns = useMemo<ColumnDef<Page>[]>(() => [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{resolveTitle(row.original)}</span>
        </div>
      ),
    },
    {
      accessorKey: "slug",
      header: "Slug",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">{row.original.slug}</span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === "published" ? "default" : "secondary"}>
          {row.original.status}
        </Badge>
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
            onClick={() => router.push(`/admin/pages/${row.original.id}`)}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="admin-row-action admin-row-action--danger"
            onClick={() => {
              setPageToDelete(row.original);
              setDeleteDialogOpen(true);
            }}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ], [router]);

  const handleDelete = async () => {
    if (!pageToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/pages/${pageToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        success("Page deleted", `"${pageToDelete.slug}" removed`);
        setPages((prev) => prev.filter((item) => item.id !== pageToDelete.id));
      } else {
        error("Failed to delete page", data.error);
      }
    } catch (err) {
      console.error("Failed to delete page", err);
      error("Failed to delete page", "Please try again later");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setPageToDelete(null);
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
        title="Pages"
        description="Manage static pages shown on the site"
      >
        <RefreshButton
          onClick={() => fetchPages(true)}
          isLoading={isRefreshing}
        />
        <CreateButton href="/admin/pages/new" label="New Page" />
      </PageHeader>

      <DataTable
        columns={columns}
        data={filteredPages}
        toolbar={
          <div className="admin-toolbar">
            <div className="admin-toolbar-search">
              <Search className="admin-toolbar-search-icon" />
              <input
                type="text"
                placeholder="Search pages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search pages"
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
          pages.length === 0 ? (
            <div className="admin-empty-state">
              <p className="text-sm text-muted-foreground">
                No pages yet. Create your first static page.
              </p>
              <Button onClick={() => router.push("/admin/pages/new")}>
                Create Page
              </Button>
            </div>
          ) : filteredPages.length === 0 ? (
            <SearchEmptyState query={searchQuery} />
          ) : undefined
        }
        minTableWidth={700}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName="Page"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
