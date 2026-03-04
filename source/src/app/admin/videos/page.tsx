"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Globe,
  GlobeLock,
  Search,
  Download,
  X,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  status: "published" | "draft";
  views: number;
  isManshet: boolean;
  isShort: boolean;
  isSidebar: boolean;
  isTopVideo: boolean;
  createdAt: string;
  updatedAt: string;
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
  isShort,
  isSidebar,
  isTopVideo,
}: Pick<VideoItem, "isManshet" | "isShort" | "isSidebar" | "isTopVideo">) {
  const flags: string[] = [];
  if (isManshet) flags.push("Manshet");
  if (isShort) flags.push("Short");
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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<VideoItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleTogglePublish = async (video: VideoItem) => {
    const newStatus = video.status === "published" ? "draft" : "published";
    try {
      const response = await fetch(`/api/videos/${video.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();

      if (data.success) {
        success(
          newStatus === "published" ? "Video published" : "Video unpublished",
          `"${video.title}" is now ${newStatus}`,
        );
        setVideos((prev) =>
          prev.map((v) =>
            v.id === video.id ? { ...v, status: newStatus } : v,
          ),
        );
      } else {
        error("Failed to update video", data.error);
      }
    } catch (err) {
      error("Failed to update video", "Please try again later");
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
    const matchesCategory =
      categoryFilter === "all" || video.categoryId === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const columns: ColumnDef<VideoItem>[] = [
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
        const name = row.original.categoryId
          ? categoryMap.get(row.original.categoryId)
          : null;
        return (
          <span className="text-sm text-muted-foreground">
            {name || "Uncategorized"}
          </span>
        );
      },
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
    },
    {
      id: "flags",
      header: "Flags",
      cell: ({ row }) => (
        <FlagBadges
          isManshet={row.original.isManshet}
          isShort={row.original.isShort}
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
      cell: ({ row }) => {
        const video = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push(`/admin/videos/${video.id}`)}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleTogglePublish(video)}>
                {video.status === "published" ? (
                  <>
                    <GlobeLock className="mr-2 h-4 w-4" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Globe className="mr-2 h-4 w-4" />
                    Publish
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => {
                  setVideoToDelete(video);
                  setDeleteDialogOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
