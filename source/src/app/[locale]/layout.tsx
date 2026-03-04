import "@/styles/globals.css";
import "plyr/dist/plyr.css";
import "@/styles/form.css";
import "@/styles/pages.css";
import type { Metadata } from "next";
import { locales, type Locale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { notFound } from "next/navigation";
import Header from "@/layouts/Header/Header";
import Footer from "@/layouts/Footer/Footer";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";
import { getSiteSettings } from "@/lib/data/settings.data";
import { pickLocalized } from "@/lib/localization";

export async function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ locale: string }>;
}): Promise<Metadata> {
    const { locale } = await params;
    const settings = await getSiteSettings();
    const fallbackLocale =
        settings.localization?.defaultLocale || defaultLocale;
    const title =
        pickLocalized(settings.seo?.defaultTitle, locale, fallbackLocale) ||
        pickLocalized(settings.site?.name, locale, fallbackLocale);
    const description =
        pickLocalized(
            settings.seo?.defaultDescription,
            locale,
            fallbackLocale,
        ) ||
        pickLocalized(settings.site?.description, locale, fallbackLocale);

    const metadata: Metadata = {};
    if (title) metadata.title = title;
    if (description) metadata.description = description;
    if (settings.site?.url) {
        try {
            metadata.metadataBase = new URL(settings.site.url);
        } catch {
            // ignore invalid url
        }
    }
    return metadata;
}

export default async function LocaleLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    // Validate locale
    if (!locales.includes(locale as Locale)) {
        notFound();
    }

    const dict = await getDictionary(locale as Locale);
    const settings = await getSiteSettings();

    return (
        <div className="page">
            <ScrollToTop />
            <Header locale={locale} dict={dict} settings={settings} />

            {/* ===== MAIN CONTENT ===== */}
            <main className="main" id="main">
                <div className="section_wrap wrap_container">{children}</div>
            </main>

            <Footer locale={locale} dict={dict} settings={settings} />
        </div>
    );
}
