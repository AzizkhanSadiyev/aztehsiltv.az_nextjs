"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Edit, Search, X } from "lucide-react";
import {
  PageHeader,
  CreateButton,
  RefreshButton,
} from "@/components/admin/ui/PageHeader";
import { VideosEmptyState, SearchEmptyState } from "@/components/admin/ui/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface VideoItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  categoryId: string | null;
  coverUrl?: string | null;
  sourceUrl?: string | null;
  status: "published" | "draft";
  views: number;
  isManshet: boolean;
  isSidebar: boolean;
  isTopVideo: boolean;
  publishedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  categoryIds?: string[] | null;
}

interface CategoryOption {
  id: string;
  name: string;
}

function StatusBadge({ status }: { status: string }) {
  return (
    <Badge
      variant={status === "published" ? "default" : "secondary"}
      className={cn(
        status === "published" && "bg-green-500/10 text-green-600 border-green-200",
        status === "draft" && "bg-yellow-500/10 text-yellow-600 border-yellow-200",
      )}
    >
      {status}
    </Badge>
  );
}

function FlagBadges({
  isManshet,
  isSidebar,
  isTopVideo,
}: Pick<VideoItem, "isManshet" | "isSidebar" | "isTopVideo">) {
  const flags: string[] = [];
  if (isManshet) flags.push("Manshet");
  if (isSidebar) flags.push("Sidebar");
  if (isTopVideo) flags.push("Top");

  if (!flags.length) {
    return <span className="text-sm text-muted-foreground">-</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {flags.map((flag) => (
        <Badge key={flag} variant="outline" className="text-xs">
          {flag}
        </Badge>
      ))}
    </div>
  );
}

const getSourceMeta = (sourceUrl?: string | null) => {
  if (!sourceUrl) {
    return { label: "No source", variant: "secondary" as const };
  }
  if (/youtu\.be|youtube\.com/i.test(sourceUrl)) {
    return { label: "YouTube", variant: "outline" as const };
  }
  if (sourceUrl.startsWith("/uploads/")) {
    return { label: "Upload", variant: "secondary" as const };
  }
  return { label: "External", variant: "outline" as const };
};

export default function VideosPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [flagFilter, setFlagFilter] = useState<string>("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchVideos = useCallback(async (showRefreshIndicator = false) => {
    showRefreshIndicator ? setIsRefreshing(true) : setIsLoading(true);
    try {
      const response = await fetch("/api/videos?limit=100");
      const data = await response.json();
      if (data.success) {
        setVideos(data.data || []);
      } else {
        error("Failed to load videos", data.error);
      }
    } catch (err) {
      error("Failed to load videos", "Please try again later");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [error]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch("/api/categories");
      const data = await response.json();
      if (data.success) {
        setCategories(data.data || []);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchVideos();
    fetchCategories();
  }, [fetchVideos, fetchCategories]);

  const handleDelete = async () => {
    if (!videoToDelete) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/videos/${videoToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();

      if (data.success) {
        success("Video deleted", `"${videoToDelete.title}" has been deleted`);
        setVideos((prev) => prev.filter((v) => v.id !== videoToDelete.id));
      } else {
        error("Failed to delete video", data.error);
      }
    } catch (err) {
      error("Failed to delete video", "Please try again later");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setVideoToDelete(null);
    }
  };

  const handleToggleStatus = async (video: VideoItem) => {
    const nextStatus = video.status === "published" ? "draft" : "published";
    const hasCategory =
      (video.categoryIds && video.categoryIds.length > 0) ||
      Boolean(video.categoryId);
    if (nextStatus === "published" && !hasCategory) {
      error(
        "Category required",
        "Select at least one category before publishing",
      );
      return;
    }
    const nextPublishedAt =
      nextStatus === "published" ? new Date().toISOString() : null;
    setStatusUpdatingId(video.id);
    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: nextStatus,
          publishedAt: nextPublishedAt,
        }),
      });
      const data = await response.json();
      if (data.success) {
        success(
          "Status updated",
          `"${video.title}" is now ${nextStatus}`,
        );
        setVideos((prev) =>
          prev.map((item) =>
            item.id === video.id ? { ...item, ...data.data } : item,
          ),
        );
      } else {
        error("Failed to update status", data.error);
      }
    } catch {
      error("Failed to update status", "Please try again later");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  const categoryMap = new Map(categories.map((cat) => [cat.id, cat.name]));
  const filteredVideos = videos.filter((video) => {
    const matchesSearch =
      searchQuery === "" ||
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.slug.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || video.status === statusFilter;
    const categoryIds =
      video.categoryIds ??
      (video.categoryId ? [video.categoryId] : []);
    const matchesCategory =
      categoryFilter === "all" ||
      categoryIds.includes(categoryFilter);
    const matchesFlag =
      flagFilter === "all" ||
      (flagFilter === "manshet" && video.isManshet) ||
      (flagFilter === "sidebar" && video.isSidebar) ||
      (flagFilter === "top" && video.isTopVideo);
    return matchesSearch && matchesStatus && matchesCategory && matchesFlag;
  });

  const columns: ColumnDef<VideoItem>[] = [
    {
      id: "cover",
      header: "Cover",
      cell: ({ row }) => {
        const coverUrl = row.original.coverUrl;
        return (
          <div className="admin-video-thumb">
            {coverUrl ? (
              <img src={coverUrl} alt="" loading="lazy" />
            ) : (
              <div className="admin-video-thumb__empty">No image</div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <div className="max-w-[280px]">
          <p className="font-medium truncate">{row.original.title}</p>
          <p className="text-xs text-muted-foreground truncate">
            /{row.original.slug}
          </p>
        </div>
      ),
    },
    {
      accessorKey: "categoryId",
      header: "Category",
      cell: ({ row }) => {
        const categoryIds =
          row.original.categoryIds ??
          (row.original.categoryId ? [row.original.categoryId] : []);
        const primaryId =
          row.original.categoryId ??
          categoryIds[0] ??
          null;
        const name = primaryId ? categoryMap.get(primaryId) : null;
        const extraCount = categoryIds.filter((id) => id !== primaryId).length;
        return (
          <span className="text-sm text-muted-foreground">
            {name || "Uncategorized"}
            {extraCount > 0 ? ` +${extraCount}` : ""}
          </span>
        );
      },
    },
    {
      id: "source",
      header: "Source",
      cell: ({ row }) => {
        const sourceUrl = row.original.sourceUrl;
        const meta = getSourceMeta(sourceUrl);
        return (
          <div className="flex items-center gap-2">
            <Badge variant={meta.variant}>{meta.label}</Badge>
            {sourceUrl ? (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 hover:underline"
              >
                Open
              </a>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const video = row.original;
        const isUpdating = statusUpdatingId === video.id;
        return (
          <button
            type="button"
            className="inline-flex items-center gap-2"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!isUpdating) {
                handleToggleStatus(video);
              }
            }}
            disabled={isUpdating}
            title="Click to toggle status"
          >
            <StatusBadge status={video.status} />
            {isUpdating ? (
              <span className="text-xs text-muted-foreground">...</span>
            ) : null}
          </button>
        );
      },
    },
    {
      id: "flags",
      header: "Flags",
      cell: ({ row }) => (
        <FlagBadges
          isManshet={row.original.isManshet}
          isSidebar={row.original.isSidebar}
          isTopVideo={row.original.isTopVideo}
        />
      ),
    },
    {
      accessorKey: "views",
      header: "Views",
      cell: ({ row }) => (
        <span className="text-sm text-muted-foreground">
          {row.getValue<number>("views")?.toLocaleString() || 0}
        </span>
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
      cell: ({ row }) => {
        const video = row.original;
        return (
          <div className="admin-row-actions">
            <Button
              variant="outline"
              size="sm"
              className="admin-row-action"
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(`/admin/videos/${video.id}`);
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
                setVideoToDelete(video);
                setDeleteDialogOpen(true);
              }}
            >
              Delete
            </Button>
          </div>
        );
      },
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
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="bg-card rounded-lg border p-4">
          <div className="flex gap-4 mb-4">
            <Skeleton className="h-10 flex-1 max-w-sm" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Videos"
        description="Manage videos and homepage placements"
      >
        <RefreshButton onClick={() => fetchVideos(true)} isLoading={isRefreshing} />
        <CreateButton href="/admin/videos/new" label="New Video" />
      </PageHeader>

      <DataTable
        columns={columns}
        data={filteredVideos}
        minTableWidth={900}
        toolbar={
          <div className="admin-toolbar">
            <div className="admin-toolbar-search">
              <Search className="admin-toolbar-search-icon" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search videos"
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

            <div className="admin-toolbar-filters">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="admin-select"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="admin-select"
                aria-label="Filter by category"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <select
                value={flagFilter}
                onChange={(e) => setFlagFilter(e.target.value)}
                className="admin-select"
                aria-label="Filter by flags"
              >
                <option value="all">All Flags</option>
                <option value="manshet">Manshet</option>
                <option value="sidebar">Sidebar</option>
                <option value="top">Top</option>
              </select>
            </div>

            {/* <div className="admin-toolbar-actions">
              <Button variant="outline" size="sm" className="h-9 gap-1 px-3">
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
            </div> */}
          </div>
        }
        emptyState={
          videos.length === 0 ? (
            <VideosEmptyState onCreateNew={() => router.push("/admin/videos/new")} />
          ) : filteredVideos.length === 0 ? (
            <SearchEmptyState query={searchQuery} />
          ) : undefined
        }
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName="Video"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
