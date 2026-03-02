import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { auth } from "@/auth-edge";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Normalize locale-prefixed admin routes to canonical /admin paths
  const adminLocaleMatch = pathname.match(/^\/(az|en|ru)(\/admin(?:\/.*)?|\/admin)$/);
  if (adminLocaleMatch) {
    const redirectUrl = req.nextUrl.clone();
    redirectUrl.pathname = adminLocaleMatch[2];
    return NextResponse.redirect(redirectUrl);
  }

  // Public routes that don't require authentication
  const isPublicRoute =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/core/health") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico" ||
    pathname === "/favicon.png" ||
    pathname === "/favicon.svg" ||
    !pathname.startsWith("/admin");

  if (isPublicRoute) return NextResponse.next();

  // Auth routes (login page)
  const isAuthRoute = pathname.startsWith("/admin/auth/login");

  // Session check via Auth.js (edge-safe config defined in src/auth.ts)
  let session = null;
  try {
    session = await auth();
  } catch (error) {
    console.error("Middleware auth error:", error);
  }
  const isLoggedIn = !!session?.user;

  // If accessing auth route while logged in, redirect to admin dashboard
  if (isAuthRoute && isLoggedIn) {
    const callbackParam = req.nextUrl.searchParams.get("callbackUrl");
    const safeCallback = callbackParam?.startsWith("/") ? callbackParam : "/admin";
    return NextResponse.redirect(new URL(safeCallback, req.url));
  }

  // If accessing protected admin route without authentication, redirect to login
  if (pathname.startsWith("/admin") && !isLoggedIn && !isAuthRoute) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(
      new URL(`/admin/auth/login?callbackUrl=${callbackUrl}`, req.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
