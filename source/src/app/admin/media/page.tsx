"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  PageHeader, 
  RefreshButton,
  ContentCard 
} from "@/components/admin/ui/PageHeader";
import { 
  MediaEmptyState, 
  SearchEmptyState 
} from "@/components/admin/ui/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { pickLocalized } from "@/lib/localization";
import { defaultLocale } from "@/i18n/config";
import { 
  Upload, 
  Image as ImageIcon, 
  FileText, 
  Film, 
  Music,
  MoreVertical,
  Trash2,
  Download,
  Copy,
  Eye,
  Grid,
  List,
  Search
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MediaFile {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url: string;
  thumbnailUrl?: string;
  alt?: Record<string, string> | null;
  uploadedAt: string;
}

const PAGE_SIZE = 12;

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith("image/")) return ImageIcon;
  if (mimeType.startsWith("video/")) return Film;
  if (mimeType.startsWith("audio/")) return Music;
  return FileText;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileType(mimeType: string): string {
  if (mimeType.startsWith("image/")) return "Image";
  if (mimeType.startsWith("video/")) return "Video";
  if (mimeType.startsWith("audio/")) return "Audio";
  if (mimeType.includes("pdf")) return "PDF";
  return "File";
}

function getAltText(file: MediaFile) {
  const altText = pickLocalized(file.alt ?? null, defaultLocale, defaultLocale);
  return altText || file.filename;
}

export default function MediaPage() {
  const { success, error } = useToast();
  
  const [media, setMedia] = useState<MediaFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [debouncedSearch, setDebouncedSearch] = useState("");
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mediaToDelete, setMediaToDelete] = useState<MediaFile | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const handle = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setPage(1);
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const getErrorMessage = (value: any) => {
    if (!value) return "Unknown";
    if (typeof value === "string") return value;
    if (typeof value.message === "string" && value.message.trim()) return value.message;
    if (typeof value.code === "string" && value.code.trim()) return value.code;
    try {
      return JSON.stringify(value);
    } catch {
      return "Unknown";
    }
  };

  const fetchMedia = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    
    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", PAGE_SIZE.toString());
      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      const apiType =
        typeFilter === "audio" ? "other" : typeFilter;
      if (apiType !== "all") {
        params.set("type", apiType);
      }

      const response = await fetch(`/api/media?${params.toString()}`);
      const data = await response.json();
      
      if (data.success) {
        setMedia(data.data || []);
        const pagination = data.pagination || {};
        const nextTotal = pagination.total ?? data.total ?? data.data?.length ?? 0;
        const nextTotalPages = pagination.totalPages ?? Math.max(1, Math.ceil(nextTotal / PAGE_SIZE));
        setTotal(nextTotal);
        setTotalPages(nextTotalPages);
        setHasNext(Boolean(pagination.hasNext));
        setHasPrev(Boolean(pagination.hasPrev));
      } else {
        error("Failed to load media", getErrorMessage(data.error));
      }
    } catch (err) {
      error("Failed to load media", err instanceof Error ? err.message : "Please try again later");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [debouncedSearch, error, page, typeFilter]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  const handleDelete = async () => {
    if (!mediaToDelete) return;
    
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/media/${mediaToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      
      if (data.success) {
        success("File deleted", `"${mediaToDelete.filename}" has been deleted`);
        setMedia((prev) => prev.filter((m) => m.id !== mediaToDelete.id));
        setTotal((prev) => Math.max(0, prev - 1));
      } else {
        error("Failed to delete file", data.error);
      }
    } catch (err) {
      error("Failed to delete file", "Please try again later");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setMediaToDelete(null);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setIsUploading(true);
    const formData = new FormData();
    
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }
    
    try {
      const response = await fetch("/api/media", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      
      if (data.success) {
        success("Files uploaded", `${files.length} file(s) uploaded successfully`);
        setPage(1);
        fetchMedia(true);
      } else {
        error("Failed to upload files", getErrorMessage(data.error));
      }
    } catch (err) {
      error("Failed to upload files", err instanceof Error ? err.message : "Please try again later");
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    success("URL copied", "The file URL has been copied to clipboard");
  };

  const filteredMedia = media;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (page > 3) pages.push("...");
      const start = Math.max(2, page - 1);
      const end = Math.min(totalPages - 1, page + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (page < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

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
            <Skeleton className="h-10 w-24" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <Skeleton key={i} className="aspect-square rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Media Library"
        description="Manage your images, videos, and files"
      >
        <RefreshButton onClick={() => fetchMedia(true)} isLoading={isRefreshing} />
        <label>
          <input
            type="file"
            multiple
            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
            onChange={handleUpload}
            className="hidden"
            disabled={isUploading}
          />
          <Button asChild disabled={isUploading}>
            <span>
              <Upload className="mr-2 h-4 w-4" />
              {isUploading ? "Uploading..." : "Upload Files"}
            </span>
          </Button>
        </label>
      </PageHeader>

      <ContentCard>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="all">All Types</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="audio">Other</option>
              <option value="document">Documents</option>
            </select>
            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Media Grid/List */}
        {media.length === 0 ? (
          <MediaEmptyState />
        ) : filteredMedia.length === 0 ? (
          <SearchEmptyState query={searchQuery} />
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredMedia.map((file) => {
              const FileIcon = getFileIcon(file.mimeType);
              const isImage = file.mimeType.startsWith("image/");
              
              return (
                <div
                  key={file.id}
                  className="group relative aspect-square rounded-lg border bg-muted/30 overflow-hidden hover:border-primary/50 transition-colors"
                >
                  {isImage ? (
                    <img
                      src={file.thumbnailUrl || file.url}
                      alt={getAltText(file)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-4">
                      <FileIcon className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-xs text-muted-foreground text-center truncate w-full">
                        {file.filename}
                      </p>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(file.url, "_blank")}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopyUrl(file.url)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setMediaToDelete(file);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* File info */}
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80 to-transparent">
                    <p className="text-xs text-white truncate">{file.filename}</p>
                    <p className="text-xs text-white/70">{formatFileSize(file.size)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredMedia.map((file) => {
              const FileIcon = getFileIcon(file.mimeType);
              
              return (
                <div
                  key={file.id}
                  className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="h-12 w-12 rounded bg-muted flex items-center justify-center flex-shrink-0">
                    {file.mimeType.startsWith("image/") ? (
                      <img
                        src={file.thumbnailUrl || file.url}
                        alt={getAltText(file)}
                        className="h-full w-full object-cover rounded"
                      />
                    ) : (
                      <FileIcon className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{file.filename}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {getFileType(file.mimeType)}
                      </Badge>
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => window.open(file.url, "_blank")}>
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleCopyUrl(file.url)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy URL
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                            const a = document.createElement("a");
                            a.href = file.url;
                            a.download = file.filename || "download";
                            document.body.appendChild(a);
                            a.click();
                            a.remove();
                        }}
                        >
                        <Download className="mr-2 h-4 w-4" />
                        Download
                        </DropdownMenuItem>

                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => {
                          setMediaToDelete(file);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats */}
        {media.length > 0 && (
          <div className="mt-6 pt-4 border-t flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredMedia.length} of {total || media.length} files
            </span>
            <span>
              Total: {formatFileSize(media.reduce((sum, m) => sum + m.size, 0))}
            </span>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <div className="flex flex-wrap items-center gap-1">
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setPage(1)}
                disabled={!hasPrev && page === 1}
              >
                «
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={!hasPrev && page === 1}
              >
                ‹
              </Button>
              {getPageNumbers().map((item, idx) =>
                item === "..." ? (
                  <span key={`ellipsis-${idx}`} className="px-2 text-muted-foreground">
                    …
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={page === item ? "default" : "secondary"}
                    size="icon"
                    onClick={() => setPage(item as number)}
                  >
                    {item}
                  </Button>
                )
              )}
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={!hasNext && page === totalPages}
              >
                ›
              </Button>
              <Button
                variant="secondary"
                size="icon"
                onClick={() => setPage(totalPages)}
                disabled={!hasNext && page === totalPages}
              >
                »
              </Button>
            </div>
          </div>
        )}
      </ContentCard>

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        itemName="File"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
