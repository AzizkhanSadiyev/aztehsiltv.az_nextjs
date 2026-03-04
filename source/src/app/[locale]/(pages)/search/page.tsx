
import Link from "next/link";
import Image from "next/image";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import NewsCard from "@/components/NewsCard/Card";
import PageTopItems from "@/components/PageTopItems/PageTopItems";
import Pagination from "@/components/Pagination/Pagination";
import styles from "./page.module.css";

type NewsItem = {
    id: number;
    title: string;
    image: string;
    views: string;
    date: string;
    category: string;
    duration: string;
    slug: string;
    type: "video" | "list";
};

const newsItems: NewsItem[] = [
    {
        id: 1,
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_1.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "silikon-sehrasi-mekteb-sagirdleri",
        type: "video",
    },
    {
        id: 2,
        title: "Tramp mekteb naharlarina tam sud qaytaran qanun imzaladi",
        image: "/assets/images/card_2.png",
        views: "960 K baxis",
        date: "27 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "tramp-mekteb-naharlari-sud-qanun",
        type: "video",
    },
    {
        id: 3,
        title: "Konqres kend mektebleri ucun Fondu yeniden berpa etdi. Onlarin mubarizeleri hele bitmeyib",
        image: "/assets/images/card_3.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Imtahan",
        duration: "00:35",
        slug: "konqres-kend-mektebleri-fond",
        type: "video",
    },
    {
        id: 4,
        title: "STEAM laboratoriyalari ucun yeni tecrube setleri paylandi",
        image: "/assets/images/card_4.png",
        views: "540 K baxis",
        date: "25 Dek 2026",
        category: "Tehsil",
        duration: "00:42",
        slug: "steam-laboratoriyalari-tecrube-setleri",
        type: "video",
    },
    {
        id: 5,
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_1.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "silikon-sehrasi-mekteb-sagirdleri-2",
        type: "video",
    },
    {
        id: 6,
        title: "Tramp mekteb naharlarina tam sud qaytaran qanun imzaladi",
        image: "/assets/images/card_2.png",
        views: "960 K baxis",
        date: "27 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "tramp-mekteb-naharlari-sud-qanun-2",
        type: "video",
    },
    {
        id: 7,
        title: "Konqres kend mektebleri ucun Fondu yeniden berpa etdi. Onlarin mubarizeleri hele bitmeyib",
        image: "/assets/images/card_3.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Imtahan",
        duration: "00:35",
        slug: "konqres-kend-mektebleri-fond-2",
        type: "video",
    },
    {
        id: 8,
        title: "STEAM laboratoriyalari ucun yeni tecrube setleri paylandi",
        image: "/assets/images/card_4.png",
        views: "540 K baxis",
        date: "25 Dek 2026",
        category: "Tehsil",
        duration: "00:42",
        slug: "steam-laboratoriyalari-tecrube-setleri-2",
        type: "video",
    },
];
export default async function CategoriesPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams?: Promise<{ page?: string | string[] }>;
}) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);
    const resolvedSearchParams = await searchParams;
    const itemsPerPage = 12;
    const totalItems = newsItems.length;
    const pageParam = Array.isArray(resolvedSearchParams?.page)
        ? resolvedSearchParams?.page[0]
        : resolvedSearchParams?.page;
    const parsedPage = Number.parseInt(pageParam ?? "1", 10);
    const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
    const currentPage = Number.isNaN(parsedPage)
        ? 1
        : Math.min(Math.max(parsedPage, 1), totalPages);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedItems = newsItems.slice(
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
                            <h1 className="sect_title"> &quot;aze&quot; üzrə axtarış nəticələri</h1>
                        </div>
                    </div>

                    <div className={styles.search_row}>
                        <input
                            type="text"
                            name="q"
                            className={styles.search_input}
                            value="aze"
                            placeholder="Axtar..."
                        />
                        <button
                            type="submit"
                            className={`${styles.search_opn} ${styles.icon_open}`}
                        ></button>
                    </div>
                    <div
                        className={`${styles.search_filter_sect} pad_bottom_20 pad_top_20`}
                    >
                        <label className={styles.search_filter_item}>
                            <input
                                type="radio"
                                name="search_type"
                                value="0"
                                checked
                            />
                            <span>Bütün bölmələr</span>
                        </label>
                        <label className={styles.search_filter_item}>
                            <input type="radio" name="search_type" 
                                value="1"/>
                            <span>Təhsil </span>
                        </label>
                        <label className={styles.search_filter_item}>
                            <input type="radio" name="search_type" value="2"/>
                            <span>Layihələr</span>
                        </label>
                    </div>


                    <div className="row_item gap_20">
                        {paginatedItems.map((item) => (
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
                    </div>
                    <div className="sect_footer">
                        <Pagination
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                            currentPage={currentPage}
                            basePath={`/${locale}/categories`}
                        />
                    </div>
                </div>
            </div>
            {/* broadcasts */}
        </div>
    );
}
