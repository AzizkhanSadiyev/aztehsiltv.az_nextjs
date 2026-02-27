import "@/styles/globals.css";
import "@/styles/form.css";
import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { notFound } from "next/navigation";
import Header from "@/layouts/Header/Header";
import Footer from "@/layouts/Footer/Footer";
import ScrollToTop from "@/components/ScrollToTop/ScrollToTop";

export async function generateStaticParams() {
    return locales.map((locale) => ({ locale }));
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

    return (
        <div className="page">
            <ScrollToTop />
            <Header locale={locale} dict={dict} />

            {/* ===== MAIN CONTENT ===== */}
            <main>{children}</main>

            <Footer locale={locale} dict={dict} />
        </div>
    );
}
