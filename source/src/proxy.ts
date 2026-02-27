import { NextRequest, NextResponse } from "next/server";

const locales = ["az", "en", "ru"];
const defaultLocale = "en";

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Statik faylları və API-ləri keçir
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.startsWith("/static") ||
        pathname.includes(".") // fayllar (.ico, .png, vs.)
    ) {
        return NextResponse.next();
    }

    // Pathname-də locale olub-olmadığını yoxla
    const pathnameHasLocale = locales.some(
        (locale) =>
            pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
    );

    if (pathnameHasLocale) {
        return NextResponse.next();
    }

    // Locale yoxdursa, default locale ilə redirect et
    request.nextUrl.pathname = `/${defaultLocale}${pathname}`;

    return NextResponse.redirect(request.nextUrl);
}

export const config = {
    matcher: ["/((?!_next|api|static|.*\\..*).*)"],
};
