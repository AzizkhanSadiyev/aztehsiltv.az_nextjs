
import { type Locale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import BroadcastCard from "@/components/BroadcastCard/Card";
import PageTopItems from "@/components/PageTopItems/PageTopItems";
import Pagination from "@/components/Pagination/Pagination";
import styles from "./page.module.css";
import { getActiveCategories } from "@/lib/data/categories.data";
import { getPublishedVideoCountsByCategory } from "@/lib/data/videos.data";
import { pickLocalizedExact } from "@/lib/localization";

export const dynamic = "force-dynamic";

export default async function BroadcastsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<{ page?: string | string[] }>;
}) {
    const { locale } = await params;
    const _dict = await getDictionary(locale as Locale);
    const resolvedSearchParams = await searchParams;
    const resolvedLocale = locale as Locale;
    const categories = await getActiveCategories();
    const counts = await getPublishedVideoCountsByCategory({
        locale: resolvedLocale,
        fallbackLocale: defaultLocale,
    });

    const normalizeKey = (value: string) =>
        value
            .normalize("NFKD")
            .toLowerCase()
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ə/g, "e")
            .replace(/ı/g, "i")
            .replace(/ş/g, "s")
            .replace(/ğ/g, "g")
            .replace(/ç/g, "c")
            .replace(/ö/g, "o")
            .replace(/ü/g, "u")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const getLocalizedCategoryName = (category: (typeof categories)[number]) =>
        pickLocalizedExact(category.name, resolvedLocale, defaultLocale).trim();

    const findParent = () =>
        categories.find((category) => {
            const slug = category.slug;
            const name = getLocalizedCategoryName(category);
            const normalized = normalizeKey(name);
            return (
                slug === "verilisler" ||
                slug === "verilislar" ||
                slug === "broadcasts" ||
                normalized === "verilisler" ||
                normalized === "broadcasts"
            );
        });

    const parent = findParent();
    const children = parent
        ? categories.filter((category) => category.parentId === parent.id)
        : [];
    const localizedChildren = children.filter(
        (category) => getLocalizedCategoryName(category).trim().length > 0,
    );

    const broadcastItems = localizedChildren
        .slice()
        .sort((a, b) => {
            const orderDiff = (a.order ?? 0) - (b.order ?? 0);
            if (orderDiff !== 0) return orderDiff;
            const nameA = getLocalizedCategoryName(a);
            const nameB = getLocalizedCategoryName(b);
            return nameA.localeCompare(nameB);
        })
        .map((item, index) => {
            const title = getLocalizedCategoryName(item);
            const count = counts[item.id] ?? 0;
            const image =
                item.coverUrl ||
                item.icon ||
                `/assets/images/board_${(index % 5) + 1}.png`;
            return {
                id: item.id,
                title,
                count: `${count} video`,
                image,
                slug: item.slug,
            };
        });
    const itemsPerPage = 16;
    const totalItems = broadcastItems.length;
    const pageParam = Array.isArray(resolvedSearchParams?.page)
        ? resolvedSearchParams?.page[0]
        : resolvedSearchParams?.page;
    const parsedPage = Number.parseInt(pageParam ?? "1", 10);
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const currentPage = Number.isNaN(parsedPage)
        ? 1
        : Math.min(Math.max(parsedPage, 1), totalPages);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = broadcastItems.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    return (
        <div className={`section_wrap pad_bottom_40`}>
            {/* Page top items */}
            <div className="main_center">
                <PageTopItems />
            </div>
            {/* Page top items */}
            
            {/* broadcasts */}
            <div className="main_center margin_top_12">
                <div className="section_wrap">
                    <div className="sect_header">
                        <div>
                            <h1 className="sect_title">Verilişlər</h1>
                        </div>
                    </div>
                    <div className="row_item gap_20">
                        {paginatedItems.map((item, index) => (
                            <div
                                key={`${item.slug}-${index}`}
                            >
                                <BroadcastCard
                                    title={item.title}
                                    count={item.count}
                                    image={item.image}
                                    slug={item.slug}
                                />
                            </div>
                        ))}
                    </div>
                    
                    <div className="sect_footer">
                        <Pagination
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            basePath={`/${locale}/broadcasts`}
                        />
                    </div>
                </div>
            </div>
            {/* broadcasts */}
        </div>
    );
}
