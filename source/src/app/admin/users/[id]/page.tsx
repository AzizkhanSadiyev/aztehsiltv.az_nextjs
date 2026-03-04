"use client";

import { useState, useEffect, useCallback, FormEvent } from "react";
import { useRouter, useParams } from "next/navigation";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import {
    FormLayout,
    FormSection,
    FormField,
    FormActions,
    Input,
    Switch,
} from "@/components/admin/ui/FormLayout";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/admin/ui/ToastProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { rolePermissions, type Permission, type UserRole } from "@/types/admin.types";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface UserFormData {
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    password: string;
    permissions: Permission[];
    newPassword: string;
    confirmPassword: string;
}

interface UserResponse {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    permissions?: Permission[];
}

const PERMISSION_OPTIONS: { value: Permission; label: string; description: string }[] = [
    { value: "videos.view", label: "View Videos", description: "Read and view videos" },
    { value: "videos.create", label: "Create Videos", description: "Create new videos" },
    { value: "videos.edit", label: "Edit Videos", description: "Edit existing videos" },
    { value: "videos.delete", label: "Delete Videos", description: "Remove videos" },
    { value: "videos.publish", label: "Publish Videos", description: "Publish or unpublish videos" },
    { value: "categories.manage", label: "Manage Categories", description: "Create and edit categories" },
    { value: "broadcasts.manage", label: "Manage Broadcasts", description: "Create and edit broadcasts" },
    { value: "partners.manage", label: "Manage Partners", description: "Create and edit partners" },
    { value: "media.view", label: "View Media", description: "Browse media library" },
    { value: "media.upload", label: "Upload Media", description: "Upload media files" },
    { value: "media.delete", label: "Delete Media", description: "Remove media files" },
    { value: "users.view", label: "View Users", description: "Access user list" },
    { value: "users.manage", label: "Manage Users", description: "Create, edit, delete users" },
    { value: "settings.view", label: "View Settings", description: "Read settings" },
    { value: "settings.edit", label: "Edit Settings", description: "Update settings" },
];

function PasswordField({
    id,
    label,
    value,
    onChange,
    placeholder,
    error,
    show,
    onToggle,
    required,
}: {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    error?: string;
    show: boolean;
    onToggle: () => void;
    required?: boolean;
}) {
    return (
        <FormField label={label} htmlFor={id} required={required} error={error}>
            <div className="relative">
                <Input
                    id={id}
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder}
                    error={!!error}
                    className="admin-input--icon"
                   
                />
                <button
                    type="button"
                    onClick={onToggle}
                    aria-label={show ? "Hide password" : "Show password"}
                    className="admin-password-toggle"
                >
                    {show ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </button>
            </div>
        </FormField>
    );
}

export default function UserEditPage() {
    const router = useRouter();
    const params = useParams();
    const { success, error } = useToast();

    const isNew = params.id === "new";
    const userId = isNew ? null : (params.id as string);

    const [formData, setFormData] = useState<UserFormData>({
        name: "",
        email: "",
        role: "author",
        isActive: true,
        password: "",
        permissions: [...rolePermissions.author],
        newPassword: "",
        confirmPassword: "",
    });

    const [isLoading, setIsLoading] = useState(!isNew);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const getErrorMessage = (value: any) => {
        if (!value) return "Unknown";
        if (typeof value === "string") return value;
        if (typeof value.message === "string" && value.message.trim()) {
            return value.message;
        }
        if (typeof value.code === "string" && value.code.trim()) {
            return value.code;
        }
        try {
            return JSON.stringify(value);
        } catch {
            return "Unknown";
        }
    };

    const fetchUser = useCallback(async () => {
        if (!userId) return;
        setIsLoading(true);
        try {
            const response = await fetch(`/api/users/${userId}`);
            const data = await response.json();

            if (data.success && data.data) {
                const user = data.data as UserResponse;
                const role = user.role || "author";
                const permissions = user.permissions?.length
                    ? user.permissions
                    : rolePermissions[role];
                setFormData((prev) => ({
                    ...prev,
                    name: user.name || "",
                    email: user.email || "",
                    role,
                    isActive: user.isActive ?? true,
                    permissions: [...permissions],
                }));
            } else {
                error("Failed to load user", getErrorMessage(data.error));
                router.push("/admin/users");
            }
        } catch (err) {
            error("Failed to load user", "Please try again later");
            router.push("/admin/users");
        } finally {
            setIsLoading(false);
        }
    }, [userId, error, router]);

    useEffect(() => {
        if (!isNew) {
            fetchUser();
        }
    }, [isNew, fetchUser]);

    useEffect(() => {
        if (isNew) return;
        setErrors((prev) => {
            const next = { ...prev };
            if (!formData.newPassword && !formData.confirmPassword) {
                delete next.newPassword;
                delete next.confirmPassword;
                return next;
            }

            if (
                formData.newPassword &&
                formData.newPassword.trim().length > 0 &&
                formData.newPassword.trim().length < 8
            ) {
                next.newPassword = "Password must be at least 8 characters";
            } else {
                delete next.newPassword;
            }

            if (
                formData.confirmPassword &&
                formData.confirmPassword !== formData.newPassword
            ) {
                next.confirmPassword = "Passwords do not match";
            } else {
                delete next.confirmPassword;
            }

            return next;
        });
    }, [formData.newPassword, formData.confirmPassword, isNew]);

    const handleChange = (
        field: keyof UserFormData,
        value: string | boolean,
    ) => {
        setFormData((prev) => {
            if (field === "newPassword" && typeof value === "string") {
                const shouldMirror =
                    !prev.confirmPassword || prev.confirmPassword === prev.newPassword;
                return {
                    ...prev,
                    newPassword: value,
                    confirmPassword: shouldMirror ? value : prev.confirmPassword,
                };
            }
            return { ...prev, [field]: value };
        });
        if (errors[field]) {
            setErrors((prev) => {
                const next = { ...prev };
                delete next[field];
                return next;
            });
        }
    };

    const handleRoleChange = (value: UserRole) => {
        setFormData((prev) => ({
            ...prev,
            role: value,
            permissions:
                value === "admin"
                    ? [...rolePermissions.admin]
                    : [...rolePermissions[value]],
        }));
    };

    const togglePermission = (permission: Permission) => {
        if (formData.role === "admin") return;
        setFormData((prev) => {
            const exists = prev.permissions.includes(permission);
            return {
                ...prev,
                permissions: exists
                    ? prev.permissions.filter((p) => p !== permission)
                    : [...prev.permissions, permission],
            };
        });
    };

    const validate = (): boolean => {
        const nextErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            nextErrors.name = "Name is required";
        }

        if (!formData.email.trim()) {
            nextErrors.email = "Email is required";
        } else if (
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)
        ) {
            nextErrors.email = "Invalid email address";
        }

        if (isNew && formData.password.trim().length < 8) {
            nextErrors.password = "Password must be at least 8 characters";
        }

        if (!isNew && formData.newPassword.trim()) {
            if (formData.newPassword.trim().length < 8) {
                nextErrors.newPassword = "Password must be at least 8 characters";
            }
            if (formData.confirmPassword.trim() !== formData.newPassword.trim()) {
                nextErrors.confirmPassword = "Passwords do not match";
            }
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!validate()) return;

        setIsSaving(true);
        try {
            const url = isNew ? "/api/users" : `/api/users/${userId}`;
            const method = isNew ? "POST" : "PUT";
            const payload = {
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                role: formData.role,
                isActive: formData.isActive,
                permissions: formData.permissions,
                ...(isNew ? { password: formData.password } : {}),
            };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const data = await response.json();

            if (data.success) {
                if (!isNew && formData.newPassword.trim()) {
                    const passwordResponse = await fetch(
                        `/api/users/${userId}/password`,
                        {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                password: formData.newPassword.trim(),
                            }),
                        },
                    );
                    const passwordData = await passwordResponse.json();
                    if (!passwordData.success) {
                        error(
                            "Failed to update password",
                            getErrorMessage(passwordData.error),
                        );
                        setIsSaving(false);
                        return;
                    }
                }

                success(
                    isNew ? "User created" : "User updated",
                    `"${formData.name}" has been ${isNew ? "created" : "updated"}`,
                );
                router.push("/admin/users");
            } else {
                error("Failed to save user", getErrorMessage(data.error));
            }
        } catch (err) {
            error("Failed to save user", "Please try again later");
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <Skeleton className="h-4 w-20 mb-4" />
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-96 w-full max-w-2xl rounded-lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title={isNew ? "New User" : "Edit User"}
                description={
                    isNew
                        ? "Create a new admin user"
                        : `Editing: ${formData.name}`
                }
                backHref="/admin/users"
                backLabel="Back to Users"
            />

            <FormLayout onSubmit={handleSubmit} className="max-w-2xl">
                <FormSection title="User Details">
                    <FormField
                        label="Full Name"
                        htmlFor="name"
                        required
                        error={errors.name}
                    >
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) =>
                                handleChange("name", e.target.value)
                            }
                            placeholder="Enter full name"
                            error={!!errors.name}
                           
                        />
                    </FormField>

                    <FormField
                        label="Email Address"
                        htmlFor="email"
                        required
                        error={errors.email}
                    >
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                                handleChange("email", e.target.value)
                            }
                            placeholder="user@example.com"
                            error={!!errors.email}
                           
                        />
                    </FormField>

                    {isNew && (
                        <PasswordField
                            id="password"
                            label="Password"
                            value={formData.password}
                            onChange={(value) =>
                                handleChange("password", value)
                            }
                            placeholder="Minimum 8 characters"
                            error={errors.password}
                            required
                            show={showCreatePassword}
                            onToggle={() =>
                                setShowCreatePassword((prev) => !prev)
                            }
                        />
                    )}
                </FormSection>

                {!isNew && (
                    <FormSection
                        title="Security"
                        description="Reset the user's password"
                    >
                        <PasswordField
                            id="newPassword"
                            label="New Password"
                            value={formData.newPassword}
                            onChange={(value) =>
                                handleChange("newPassword", value)
                            }
                            placeholder="Minimum 8 characters"
                            error={errors.newPassword}
                            show={showNewPassword}
                            onToggle={() =>
                                setShowNewPassword((prev) => !prev)
                            }
                        />

                        <PasswordField
                            id="confirmPassword"
                            label="Confirm Password"
                            value={formData.confirmPassword}
                            onChange={(value) =>
                                handleChange("confirmPassword", value)
                            }
                            placeholder="Repeat new password"
                            error={errors.confirmPassword}
                            show={showConfirmPassword}
                            onToggle={() =>
                                setShowConfirmPassword((prev) => !prev)
                            }
                        />
                    </FormSection>
                )}
                
                <FormSection
                    title="Access"
                    description="Manage role, permissions, and access status"
                >
                    <FormField
                        label="Role"
                        htmlFor="role"
                        className="text-black"
                    >
                        <Select
                            value={formData.role}
                            onValueChange={(value) =>
                                handleRoleChange(value as UserRole)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent className="text-black">
                                <SelectItem value="admin">Admin</SelectItem>
                                <SelectItem value="editor">Editor</SelectItem>
                                <SelectItem value="author">Author</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>

                    <FormField
                        label="Permissions"
                        hint={
                            formData.role === "admin"
                                ? "Admin users always have full access."
                                : "Select the permissions for this user."
                        }
                        
                    >
                        <div className="admin-permissions-grid">
                            {PERMISSION_OPTIONS.map((permission) => {
                                const checked = formData.permissions.includes(permission.value);
                                return (
                                    <label
                                        key={permission.value}
                                        className={cn(
                                            "admin-permission-card",
                                            checked && "is-checked",
                                            formData.role === "admin"
                                                ? "is-disabled"
                                                : "is-editable",
                                        )}
                                    >
                                        <input
                                            type="checkbox"
                                            className="admin-permission-checkbox"
                                            checked={checked}
                                            onChange={() => togglePermission(permission.value)}
                                            disabled={formData.role === "admin"} 
                                        />
                                        <div>
                                            <p className="admin-permission-title">
                                                {permission.label}
                                            </p>
                                            <p className="admin-permission-desc">
                                                {permission.description}
                                            </p>
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    </FormField>

                    <div className="admin-toggle-card">
                        <div>
                            <p className="admin-toggle-card__title">Active User</p>
                            <p className="admin-toggle-card__desc">
                                Allow this user to access the admin panel
                            </p>
                        </div>
                        <Switch
                            checked={formData.isActive}
                            onCheckedChange={(checked) =>
                                handleChange("isActive", checked)
                            }
                        />
                    </div>
                </FormSection>


                <FormActions
                    onCancel={() => router.push("/admin/users")}
                    submitLabel={isNew ? "Create User" : "Save Changes"}
                    isSubmitting={isSaving}
                />
            </FormLayout>
        </div>
    );
}
