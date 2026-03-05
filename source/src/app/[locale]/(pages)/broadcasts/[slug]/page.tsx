import { type Locale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { notFound } from "next/navigation";
import PageTopItems from "@/components/PageTopItems/PageTopItems";
import NewsCard from "@/components/NewsCard/Card";
import Pagination from "@/components/Pagination/Pagination";
import { getCategoryBySlug } from "@/lib/data/categories.data";
import { getVideosList } from "@/lib/data/videos.data";
import { pickLocalized, pickLocalizedExact } from "@/lib/localization";
import styles from "../page.module.css";

export const dynamic = "force-dynamic";

const fallbackImages = [
    "/assets/images/card_1.png",
    "/assets/images/card_2.png",
    "/assets/images/card_3.png",
    "/assets/images/card_4.png",
];

const formatViews = (value: number, locale: Locale) => {
    const compact = new Intl.NumberFormat(locale, {
        notation: "compact",
        maximumFractionDigits: 1,
    }).format(Math.max(0, value || 0));
    const suffix =
        locale === "en" ? "views" : locale === "ru" ? "views" : "baxis";
    return `${compact} ${suffix}`;
};

const formatDate = (value: string | null | undefined, locale: Locale) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(locale, {
        day: "2-digit",
        month: "short",
        year: "numeric",
    }).format(date);
};

export default async function BroadcastCategoryPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string; slug: string }>;
    searchParams?: Promise<{ page?: string | string[] }>;
}) {
    const { locale, slug } = await params;
    const resolvedLocale = locale as Locale;
    const dict = await getDictionary(resolvedLocale);
    const resolvedSearchParams = await searchParams;

    const category = await getCategoryBySlug(slug);
    if (!category) {
        notFound();
    }
    const categoryLabel = pickLocalizedExact(
        category.name,
        resolvedLocale,
        defaultLocale
    ).trim();
    if (!categoryLabel) {
        notFound();
    }

    const itemsPerPage = 16;
    const pageParam = Array.isArray(resolvedSearchParams?.page)
        ? resolvedSearchParams?.page[0]
        : resolvedSearchParams?.page;
    const parsedPage = Number.parseInt(pageParam ?? "1", 10);
    const requestedPage = Number.isNaN(parsedPage) ? 1 : Math.max(parsedPage, 1);

    const filters = {
        status: "published" as const,
        categoryId: category.id,
    };

    let { videos, total } = await getVideosList({
        page: requestedPage,
        limit: itemsPerPage,
        filters: {
            ...filters,
            locale: resolvedLocale,
            fallbackLocale: defaultLocale,
        },
    });

    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    const currentPage = Math.min(requestedPage, totalPages);

    if (currentPage !== requestedPage) {
        const refreshed = await getVideosList({
            page: currentPage,
            limit: itemsPerPage,
            filters: {
                ...filters,
                locale: resolvedLocale,
                fallbackLocale: defaultLocale,
            },
        });
        videos = refreshed.videos;
        total = refreshed.total;
    }

    const displayItems = videos.map((video, index) => {
        const title = pickLocalizedExact(video.title, resolvedLocale, defaultLocale).trim();
        const slugValue = pickLocalized(video.slug, resolvedLocale, defaultLocale);
        return {
            id: video.id,
            title,
            image: video.coverUrl || fallbackImages[index % fallbackImages.length],
            views: formatViews(video.views ?? 0, resolvedLocale),
            date: formatDate(video.publishedAt ?? video.createdAt, resolvedLocale),
            category: categoryLabel,
            duration: video.duration ?? "",
            slug: slugValue || "#",
            type: video.type ?? "video",
        };
    });

    const basePath = `/${locale}/broadcasts/${slug}`;

    return (
        <div className="section_wrap pad_bottom_40">
            <div className="main_center">
                <PageTopItems />
            </div>

            <div className="main_center margin_top_12">
                <div className="section_wrap">
                    <div className="sect_header">
                        <div>
                            <h1 className="sect_title">{categoryLabel}</h1>
                        </div>
                    </div>

                    <div className="row_item gap_20">
                        {displayItems.map((item) => (
                            <NewsCard
                                key={item.id}
                                title={item.title}
                                image={item.image}
                                views={item.views}
                                date={item.date}
                                category={item.category}
                                duration={item.duration}
                                slug={item.slug}
                                type={item.type}
                            />
                        ))}
                        {displayItems.length === 0 ? (
                            <div className={styles.emptyState}>
                                {dict?.common?.noResults || "No results found"}
                            </div>
                        ) : null}
                    </div>

                    <div className="sect_footer">
                        <Pagination
                            totalItems={total}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            basePath={basePath}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
