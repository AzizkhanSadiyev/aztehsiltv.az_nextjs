import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/lib/data/users.data";
import type { User } from "@/types/admin.types";

/**
 * Get the current session from server components
 * @returns Session object or null if not authenticated
 */
export async function getServerSession() {
  try {
    return await auth();
  } catch (error) {
    console.error("getServerSession error:", error);
    return null;
  }
}

/**
 * Require authentication or redirect to login page
 * Use in server components to protect routes
 * @param redirectTo - Optional path to redirect after login
 * @returns Session object
 */
export async function requireAuth(redirectTo?: string) {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("requireAuth error:", error);
  }

  if (!session || !session.user) {
    const callbackUrl = redirectTo || "/admin";
    redirect(`/admin/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  }

  return session;
}

/**
 * Check if the current user has a specific permission
 * @param permission - Permission string to check (e.g., "videos.edit")
 * @returns true if user has permission, false otherwise
 */
export async function checkPermission(permission: string): Promise<boolean> {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("checkPermission auth error:", error);
  }

  if (!session || !session.user) {
    return false;
  }

  const userPermissions = session.user.permissions || [];
  return userPermissions.includes(permission);
}

/**
 * Require a specific permission or throw error
 * Use in API routes or server actions
 * @param permission - Permission string required
 * @throws Error if user doesn't have permission
 */
export async function requirePermission(permission: string) {
  const hasPermission = await checkPermission(permission);

  if (!hasPermission) {
    throw new Error(`Permission denied: ${permission} required`);
  }
}

/**
 * Get current user with full details from database
 * @returns User object or null if not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("getCurrentUser auth error:", error);
  }

  if (!session || !session.user) {
    return null;
  }

  try {
    const user = await getUserById(session.user.id);
    return user as User;
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/**
 * Check if user has admin role
 * @returns true if user is admin, false otherwise
 */
export async function isAdmin(): Promise<boolean> {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("isAdmin auth error:", error);
  }

  if (!session || !session.user) {
    return false;
  }

  return session.user.role === "admin";
}

/**
 * Check if user has editor role or higher
 * @returns true if user is editor or admin, false otherwise
 */
export async function isEditor(): Promise<boolean> {
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("isEditor auth error:", error);
  }

  if (!session || !session.user) {
    return false;
  }

  return ["admin", "editor"].includes(session.user.role);
}
