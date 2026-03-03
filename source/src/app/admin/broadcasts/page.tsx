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
  BroadcastsEmptyState,
  SearchEmptyState,
} from "@/components/admin/ui/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Edit, Search, Download, X, Hash, Radio } from "lucide-react";

interface BroadcastItem {
  id: string;
  title: string;
  slug: string;
  imageUrl: string;
  status: "published" | "draft";
  sortOrder: number;
  updatedAt: string;
}

export default function BroadcastsPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [broadcasts, setBroadcasts] = useState<BroadcastItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [broadcastToDelete, setBroadcastToDelete] = useState<BroadcastItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBroadcasts = useCallback(
    async (showRefresh = false) => {
      showRefresh ? setIsRefreshing(true) : setIsLoading(true);
      try {
        const res = await fetch("/api/broadcasts");
        const data = await res.json();
        if (data.success) {
          setBroadcasts(data.data || []);
        } else {
          error("Failed to load broadcasts", data.error);
        }
      } catch (err) {
        error("Failed to load broadcasts", "Please try again");
      } finally {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    },
    [error],
  );

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  const handleDelete = async () => {
    if (!broadcastToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/broadcasts/${broadcastToDelete.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        success("Broadcast deleted", `"${broadcastToDelete.title}" deleted`);
        setBroadcasts((prev) =>
          prev.filter((item) => item.id !== broadcastToDelete.id),
        );
      } else {
        error("Failed to delete", data.error);
      }
    } catch (err) {
      error("Failed to delete", "Please try again");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setBroadcastToDelete(null);
    }
  };

  const filtered = broadcasts.filter((item) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.slug.toLowerCase().includes(q)
    );
  });

  const columns: ColumnDef<BroadcastItem>[] = [
    {
      accessorKey: "title",
      header: "Broadcast",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Radio className="h-4 w-4 text-muted-foreground" />
          <div>
            <p className="font-medium">{row.original.title}</p>
            <p className="text-xs text-muted-foreground">/{row.original.slug}</p>
          </div>
        </div>
      ),
    },
    {
      accessorKey: "sortOrder",
      header: "Order",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Hash className="h-4 w-4" />
          {row.getValue("sortOrder")}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className={cn(
            row.getValue("status") === "published"
              ? "bg-green-500/10 text-green-600"
              : "bg-yellow-500/10 text-yellow-600",
          )}
        >
          {row.getValue("status")}
        </Badge>
      ),
    },
    {
      accessorKey: "updatedAt",
      header: "Updated",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {new Date(row.getValue("updatedAt")).toLocaleDateString()}
        </span>
      ),
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
            onClick={() => router.push(`/admin/broadcasts/${row.original.id}`)}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="admin-row-action admin-row-action--danger"
            onClick={() => {
              setBroadcastToDelete(row.original);
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
        <div className="flex justify-between">
          <div>
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="bg-card rounded-lg border p-4">
          <Skeleton className="h-10 w-64 mb-4" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-14 w-full mb-3" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Broadcasts"
        description="Manage shows and playlists"
      >
        <RefreshButton
          onClick={() => fetchBroadcasts(true)}
          isLoading={isRefreshing}
        />
        <CreateButton href="/admin/broadcasts/new" label="New Broadcast" />
      </PageHeader>

      <DataTable
        columns={columns}
        data={filtered}
        toolbar={
          <div className="admin-toolbar">
            <div className="admin-toolbar-search">
              <Search className="admin-toolbar-search-icon" />
              <input
                type="text"
                placeholder="Search broadcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search broadcasts"
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
          broadcasts.length === 0 ? (
            <BroadcastsEmptyState
              onCreateNew={() => router.push("/admin/broadcasts/new")}
            />
          ) : filtered.length === 0 ? (
            <SearchEmptyState query={searchQuery} />
          ) : undefined
        }
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName="Broadcast"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
