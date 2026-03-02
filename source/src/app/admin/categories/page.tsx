"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { 
  Edit, 
  FolderTree,
  Search,
  Download,
  X
} from "lucide-react";
import { 
  PageHeader, 
  CreateButton, 
  RefreshButton
} from "@/components/admin/ui/PageHeader";
import { 
  CategoriesEmptyState, 
  SearchEmptyState 
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

export default function CategoriesPage() {
  const router = useRouter();
  const { success, error } = useToast();
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const response = await fetch("/api/categories");
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
  }, [error]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/categories/${categoryToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        success("Category deleted", `"${categoryToDelete.name}" has been deleted`);
        setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id));
      } else {
        error("Failed to delete category", data.error);
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

  const filteredCategories = categories.filter((category) =>
    searchQuery === "" ||
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns: ColumnDef<Category>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const category = row.original;
        return (
          <div className="flex items-center gap-2">
            <FolderTree className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="font-medium">{category.name}</p>
              <p className="text-xs text-muted-foreground">/{category.slug}</p>
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
        return category.parent?.name || <span className="text-muted-foreground">-</span>;
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
        <Badge variant="secondary">
          {row.getValue("order")}
        </Badge>
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
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 gap-1 text-xs"
            onClick={() => router.push(`/admin/categories/${row.original.id}`)}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 gap-1 text-xs text-destructive border-destructive/40 hover:text-destructive"
            onClick={() => {
              setCategoryToDelete(row.original);
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
        title="Categories"
        description="Organize your content with categories"
      >
        <RefreshButton onClick={() => fetchCategories(true)} isLoading={isRefreshing} />
        <CreateButton href="/admin/categories/new" label="New Category" />
      </PageHeader>

      <DataTable
        columns={columns}
        data={filteredCategories}
        toolbar={
          <div className="admin-toolbar">
            <div className="admin-toolbar-search">
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
                  className="absolute right-2 top-1/2 h-7 w-7 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setSearchQuery("")}
                >
                  <span className="sr-only">Clear search</span>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="admin-toolbar-actions">
              <Button variant="outline" size="sm" className="h-9 gap-1 px-3">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div>
          </div>
        }
        emptyState={
          categories.length === 0 ? (
            <CategoriesEmptyState onCreateNew={() => router.push("/admin/categories/new")} />
          ) : filteredCategories.length === 0 ? (
            <SearchEmptyState query={searchQuery} />
          ) : undefined
        }
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName="Category"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />

    </div>
  );
}
