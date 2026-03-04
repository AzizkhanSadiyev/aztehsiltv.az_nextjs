import Link from "next/link";
import { type Locale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import NewsCard from "@/components/NewsCard/Card";
import PageTopItems from "@/components/PageTopItems/PageTopItems";
import Pagination from "@/components/Pagination/Pagination";
import { getActiveCategories } from "@/lib/data/categories.data";
import { getVideosList } from "@/lib/data/videos.data";
import { pickLocalized } from "@/lib/localization";
import styles from "./page.module.css";

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
        locale === "en"
            ? "views"
            : locale === "ru"
              ? "views"
              : "baxis";
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

export default async function SearchPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<{
        page?: string | string[];
        category?: string | string[];
        q?: string | string[];
    }>;
}) {
    const { locale } = await params;
    const resolvedLocale = locale as Locale;
    const dict = await getDictionary(resolvedLocale);
    const resolvedSearchParams = await searchParams;
    const itemsPerPage = 16;

    const resolveParam = (value?: string | string[]) =>
        Array.isArray(value) ? value[0] : value;

    const pageParam = resolveParam(resolvedSearchParams?.page);
    const categoryParam = resolveParam(resolvedSearchParams?.category);
    const queryParam = resolveParam(resolvedSearchParams?.q) ?? "";
    const searchQuery = queryParam.trim();
    const parsedPage = Number.parseInt(pageParam ?? "1", 10);
    const requestedPage = Number.isNaN(parsedPage)
        ? 1
        : Math.max(parsedPage, 1);

    const categories = await getActiveCategories();
    const sortedCategories = categories.slice().sort((a, b) => {
        const orderDiff = (a.order ?? 0) - (b.order ?? 0);
        if (orderDiff != 0) return orderDiff;
        const nameA = pickLocalized(a.name, resolvedLocale, defaultLocale);
        const nameB = pickLocalized(b.name, resolvedLocale, defaultLocale);
        return nameA.localeCompare(nameB);
    });
    const selectedCategory = categoryParam
        ? sortedCategories.find((category) => category.slug === categoryParam)
        : undefined;

    const filters = {
        status: "published" as const,
        categoryId: selectedCategory?.id,
        search: searchQuery.length > 0 ? searchQuery : undefined,
    };

    let { videos, total } = await getVideosList({
        page: requestedPage,
        limit: itemsPerPage,
        filters,
    });

    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    const currentPage = Math.min(requestedPage, totalPages);

    if (currentPage != requestedPage) {
        const refreshed = await getVideosList({
            page: currentPage,
            limit: itemsPerPage,
            filters,
        });
        videos = refreshed.videos;
        total = refreshed.total;
    }

    const categoryNameMap = new Map(
        sortedCategories.map((category) => [
            category.id,
            pickLocalized(category.name, resolvedLocale, defaultLocale),
        ])
    );

    const displayItems = videos.map((video, index) => {
        const title = pickLocalized(video.title, resolvedLocale, defaultLocale);
        const slug = pickLocalized(video.slug, resolvedLocale, defaultLocale);
        return {
            id: video.id,
            title,
            image: video.coverUrl || fallbackImages[index % fallbackImages.length],
            views: formatViews(video.views ?? 0, resolvedLocale),
            date: formatDate(video.publishedAt ?? video.createdAt, resolvedLocale),
            category: video.categoryId
                ? categoryNameMap.get(video.categoryId) || ""
                : "",
            duration: video.duration ?? "",
            slug: slug || "#",
            type: video.type ?? "video",
        };
    });

    const basePath = `/${locale}/search`;
    const allLabel = dict?.category?.allNews ?? "All News";

    const buildFilterHref = (slug?: string) => {
        const params = new URLSearchParams();
        if (searchQuery) params.set("q", searchQuery);
        if (slug) params.set("category", slug);
        const queryString = params.toString();
        return queryString ? `${basePath}?${queryString}` : basePath;
    };

    return (
        <div className={`section_wrap pad_bottom_40 wrap_search_page`}>
            {/* Page top items */}
            <div className="main_center">
                <PageTopItems />
            </div>
            {/* Page top items */}

            {/* search */}
            <div className="main_center margin_top_12">
                <div className="section_wrap">
                    <div className="sect_header">
                        <div>
                            <h1 className="sect_title">
                                {searchQuery
                                    ? `"${searchQuery}" axtarış nəticələri`
                                    : dict?.common?.search || "Search results"}
                            </h1>
                        </div>
                    </div>

                    <form
                        className={styles.search_row}
                        method="get"
                        action={basePath}
                    >
                        <input
                            type="text"
                            name="q"
                            className={styles.search_input}
                            defaultValue={searchQuery}
                            placeholder={dict?.common?.search || "Axtar..."}
                        />
                        {selectedCategory ? (
                            <input
                                type="hidden"
                                name="category"
                                value={selectedCategory.slug}
                            />
                        ) : null}
                        <button
                            type="submit"
                            className={`${styles.search_opn} ${styles.icon_open}`}
                            aria-label="Search"
                        ></button>
                    </form>

                    <div className={`search_filter_sect ${styles.categoryFilters}`}>
                        <Link
                            href={buildFilterHref()}
                            className={`${styles.categoryFilter} ${
                                !selectedCategory
                                    ? styles.categoryFilterActive
                                    : ""
                            }`}
                        >
                            {allLabel}
                        </Link>
                        {sortedCategories.map((category) => {
                            const label = pickLocalized(
                                category.name,
                                resolvedLocale,
                                defaultLocale
                            );
                            return (
                                <Link
                                    key={category.id}
                                    href={buildFilterHref(category.slug)}
                                    className={`${styles.categoryFilter} ${
                                        selectedCategory?.id === category.id
                                            ? styles.categoryFilterActive
                                            : ""
                                    }`}
                                >
                                    {label || category.slug}
                                </Link>
                            );
                        })}
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
            {/* search */}
        </div>
    );
}
