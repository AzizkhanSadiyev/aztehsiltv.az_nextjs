"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/admin/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Edit, Search, Download, X } from "lucide-react";
import {
    PageHeader,
    CreateButton,
    RefreshButton,
} from "@/components/admin/ui/PageHeader";
import {
    UsersEmptyState,
    SearchEmptyState,
} from "@/components/admin/ui/EmptyState";
import { DeleteConfirmDialog } from "@/components/admin/ui/ConfirmDialog";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: "active" | "inactive" | "suspended";
    isActive?: boolean;
    avatar?: string;
    createdAt: string;
    lastLogin?: string;
}

function StatusBadge({ status }: { status: string }) {
    return (
        <Badge
            variant="outline"
            className={cn(
                status === "active" &&
                    "bg-green-500/10 text-green-600 border-green-200",
                status === "inactive" &&
                    "bg-gray-500/10 text-gray-600 border-gray-200",
                status === "suspended" &&
                    "bg-red-500/10 text-red-600 border-red-200",
            )}
        >
            {status}
        </Badge>
    );
}

function RoleBadge({ role }: { role: string }) {
    return (
        <Badge
            variant="secondary"
            className={cn(
                role === "admin" && "bg-purple-500/10 text-purple-600",
                role === "editor" && "bg-blue-500/10 text-blue-600",
                role === "author" && "bg-green-500/10 text-green-600",
            )}
        >
            {role}
        </Badge>
    );
}

export default function UsersPage() {
    const router = useRouter();
    const { success, error } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [roleFilter, setRoleFilter] = useState<string>("all");
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUsers = useCallback(
        async (showRefreshIndicator = false) => {
            if (showRefreshIndicator) {
                setIsRefreshing(true);
            } else {
                setIsLoading(true);
            }

            try {
                const response = await fetch("/api/users");
                const data = await response.json();

                if (data.success) {
                    const normalized = (data.data || []).map((user: any) => ({
                        ...user,
                        status: user.isActive === false ? "inactive" : "active",
                        lastLogin: user.lastLoginAt || user.lastLogin,
                    }));
                    setUsers(normalized);
                } else {
                    error("Failed to load users", data.error);
                }
            } catch (err) {
                error("Failed to load users", "Please try again later");
            } finally {
                setIsLoading(false);
                setIsRefreshing(false);
            }
        },
        [error],
    );

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleDelete = async () => {
        if (!userToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/users/${userToDelete.id}`, {
                method: "DELETE",
            });
            const data = await response.json();

            if (data.success) {
                success(
                    "User deleted",
                    `"${userToDelete.name}" has been deleted`,
                );
                setUsers((prev) =>
                    prev.filter((u) => u.id !== userToDelete.id),
                );
            } else {
                error("Failed to delete user", data.error);
            }
        } catch (err) {
            error("Failed to delete user", "Please try again later");
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            searchQuery === "" ||
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === "all" || user.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "name",
            header: "Name",
            cell: ({ row }) => {
                const user = row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>
                                {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <p className="font-medium">{user.name}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            accessorKey: "email",
            header: "Email",
            cell: ({ row }) => (
                <span className="text-sm text-muted-foreground">
                    {row.getValue("email")}
                </span>
            ),
        },
        {
            accessorKey: "role",
            header: "Role",
            cell: ({ row }) => <RoleBadge role={row.getValue("role")} />,
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => <StatusBadge status={row.getValue("status")} />,
        },
        {
            accessorKey: "lastLogin",
            header: "Last Login",
            cell: ({ row }) => {
                const lastLogin = row.getValue<string>("lastLogin");
                return lastLogin ? (
                    <span className="text-sm text-muted-foreground">
                        {new Date(lastLogin).toLocaleDateString()}
                    </span>
                ) : (
                    <span className="text-sm text-muted-foreground">Never</span>
                );
            },
        },
        {
            accessorKey: "createdAt",
            header: "Created",
            cell: ({ row }) => {
                const date = new Date(row.getValue("createdAt"));
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
            cell: ({ row }) => {
                const user = row.original;

                return (
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 gap-1 text-xs"
                            onClick={() =>
                                router.push(`/admin/users/${user.id}`)
                            }
                        >
                            <Edit className="h-3.5 w-3.5" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-3 gap-1 text-xs text-destructive border-destructive/40 hover:text-destructive"
                            onClick={() => {
                                setUserToDelete(user);
                                setDeleteDialogOpen(true);
                            }}
                        >
                            Delete
                        </Button>
                    </div>
                );
            },
            enableSorting: false,
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
                    <Skeleton className="h-10 w-64 mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3, 4].map((i) => (
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
                title="Users"
                description="Manage user accounts and permissions"
            >
                <RefreshButton
                    onClick={() => fetchUsers(true)}
                    isLoading={isRefreshing}
                />
                <CreateButton href="/admin/users/new" label="New User" />
            </PageHeader>

            <DataTable
                columns={columns}
                data={filteredUsers}
                toolbar={
                    <div className="admin-toolbar">
                        <div className="admin-toolbar-search">
                            <Search className="admin-toolbar-search-icon" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                aria-label="Search users"
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

                        <div className="admin-toolbar-filters">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                                className="admin-select"
                                aria-label="Filter by role"
                            >
                                <option value="all">All Roles</option>
                                <option value="admin">Admin</option>
                                <option value="editor">Editor</option>
                                <option value="author">Author</option>
                            </select>
                        </div>

                        <div className="admin-toolbar-actions">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-9 gap-1 px-3"
                            >
                                <Download className="h-4 w-4" />
                                <span className="hidden sm:inline">Export</span>
                            </Button>
                        </div>
                    </div>
                }
                emptyState={
                    users.length === 0 ? (
                        <UsersEmptyState
                            onCreateNew={() => router.push("/admin/users/new")}
                        />
                    ) : filteredUsers.length === 0 ? (
                        <SearchEmptyState query={searchQuery} />
                    ) : undefined
                }
            />

            <DeleteConfirmDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                itemName="User"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </div>
    );
}
