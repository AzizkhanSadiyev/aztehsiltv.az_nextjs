
import Link from "next/link";
import Image from "next/image";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import BroadcastCard from "@/components/BroadcastCard/Card";
import PageTopItems from "@/components/PageTopItems/PageTopItems";
import Pagination from "@/components/Pagination/Pagination";
import styles from "./page.module.css";

const broadcastItems = [
    {
        id: 1,
        title: "Metodik korpu",
        count: "364 video",
        image: "/assets/images/board_1.png",
        slug: "#",
    },
    {
        id: 2,
        title: "Usaqlar ve biz",
        count: "128 video",
        image: "/assets/images/board_2.png",
        slug: "#",
    },
    {
        id: 3,
        title: "Podkast",
        count: "92 video",
        image: "/assets/images/board_3.png",
        slug: "#",
    },
    {
        id: 4,
        title: "Tehsil saati",
        count: "56 video",
        image: "/assets/images/board_4.png",
        slug: "#",
    },
    {
        id: 5,
        title: "Tehsil saati",
        count: "56 video",
        image: "/assets/images/board_5.png",
        slug: "#",
    },
    {
        id: 6,
        title: "Podkast",
        count: "92 video",
        image: "/assets/images/board_3.png",
        slug: "#",
    },
    {
        id: 7,
        title: "Tehsil saati",
        count: "56 video",
        image: "/assets/images/board_4.png",
        slug: "#",
    },
    {
        id: 8,
        title: "Tehsil saati",
        count: "56 video",
        image: "/assets/images/board_5.png",
        slug: "#",
    },
];
export default async function TrainingsPage({
    params,
    searchParams,
}: {
    params: Promise<{ locale: string }>;
    searchParams?: { page?: string | string[] };
}) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);
    const itemsPerPage = 8;
    const totalItems = broadcastItems.length;
    const pageParam = Array.isArray(searchParams?.page)
        ? searchParams?.page[0]
        : searchParams?.page;
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
