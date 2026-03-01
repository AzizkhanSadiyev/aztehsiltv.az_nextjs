import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import Link from "next/link";
import Image from "next/image";

import styles from "./page.module.css";

import NewsCard from "@/components/NewsCard/Card";
import SliderShort, { type ShortItem } from "@/components/SliderShort/slider";
import SliderNews, { type NewsItem } from "@/components/SliderNews/slider";
import SliderBroadcast, {
    type BroadcastItem,
} from "@/components/SliderBroadcast/slider";
import SliderPartner from "@/components/SliderPartner/slider";
import PageTopItems from "@/components/PageTopItems/PageTopItems";
import SliderExplore, {
    type ExploreItem,
} from "@/components/SliderExplore/slider";
import TopVideo from "@/components/TopVideo/TopVideo";

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);

    const newsItems: NewsItem[] = [
        {
            id: 1,
            title: "Konqres kend mektebleri ucun Fondu yeniden berpa etdi",
            image: "/assets/images/card_3.png",
            views: "1.2 M baxis",
            date: "28 Dek 2026",
            category: "Imtahan",
            duration: "00:35",
            slug: "konqres-kend-mektebleri-fond",
            type: "video",
        },
        {
            id: 2,
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
            id: 3,
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
            id: 4,
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
            id: 5,
            title: "Konqres kend mektebleri ucun Fondu yeniden berpa etdi",
            image: "/assets/images/card_3.png",
            views: "1.2 M baxis",
            date: "28 Dek 2026",
            category: "Imtahan",
            duration: "00:35",
            slug: "konqres-kend-mektebleri-fond-2",
            type: "video",
        },
        {
            id: 6,
            title: "STEAM laboratoriyalari ucun yeni tecrube setleri paylandi",
            image: "/assets/images/card_4.png",
            views: "540 K baxis",
            date: "25 Dek 2026",
            category: "Tehsil",
            duration: "00:42",
            slug: "steam-laboratoriyalari-tecrube-setleri-2",
            type: "video",
        },
        {
            id: 7,
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
            id: 8,
            title: "Tramp mekteb naharlarina tam sud qaytaran qanun imzaladi",
            image: "/assets/images/card_2.png",
            views: "960 K baxis",
            date: "27 Dek 2026",
            category: "Verilis",
            duration: "00:35",
            slug: "tramp-mekteb-naharlari-sud-qanun-2",
            type: "video",
        },
    ];
    const shortsItems: ShortItem[] = [
        {
            id: 1,
            title: "Niya Rayonlar immiqrasiya ile bagli protokollar tesis edirler",
            image: "/assets/images/short_1.png",
            views: "1.2 M baxis",
            date: "28 Dek 2026",
            category: "Verilis",
            duration: "00:35",
            slug: "konqres-kend-mektebleri-fond",
            type: "video",
        },
        {
            id: 2,
            title: "ABS her usaq ucun tovsiye edilen peyvendin sayi",
            image: "/assets/images/short_2.png",
            views: "1.2 M baxis",
            date: "28 Dek 2026",
            category: "Verilis",
            duration: "00:35",
            slug: "steam-laboratoriyalari-tecrube-setleri",
            type: "video",
        },
        {
            id: 3,
            title: "Mekteb liderlerini ilhamlandirmaq ucun 14 yeni Qerari",
            image: "/assets/images/short_3.png",
            views: "1.2 M baxis",
            date: "28 Dek 2026",
            category: "Tehsil",
            duration: "00:35",
            slug: "silikon-sehrasi-mekteb-sagirdleri",
            type: "video",
        },
        {
            id: 4,
            title: "Bunlar direktorlarin oyrənmək istediyi yeni bacariqlardir",
            image: "/assets/images/short_4.png",
            views: "1.2 M baxis",
            date: "28 Dek 2026",
            category: "Tehsil",
            duration: "00:35",
            slug: "tramp-mekteb-naharlari-sud-qanun",
            type: "video",
        },
        {
            id: 5,
            title: "Zohran Mamdani Manhetten mektebinin mudirini Nyu-York",
            image: "/assets/images/short_5.png",
            views: "1.2 M baxis",
            date: "28 Dek 2026",
            category: "Verilis",
            duration: "00:35",
            slug: "konqres-kend-mektebleri-fond-2",
            type: "video",
        },
        {
            id: 6,
            title: "Mekteb liderlerini ilhamlandirmaq ucun 14 yeni Qerari",
            image: "/assets/images/short_3.png",
            views: "1.2 M baxis",
            date: "28 Dek 2026",
            category: "Tehsil",
            duration: "00:35",
            slug: "silikon-sehrasi-mekteb-sagirdleri-2",
            type: "video",
        },
        {
            id: 7,
            title: "Bunlar direktorlarin oyrənmək istediyi yeni bacariqlardir",
            image: "/assets/images/short_4.png",
            views: "1.2 M baxis",
            date: "28 Dek 2026",
            category: "Tehsil",
            duration: "00:35",
            slug: "tramp-mekteb-naharlari-sud-qanun-2",
            type: "video",
        },
    ];

    const exploreItems: ExploreItem[] = [
        { id: 1, title: "Butun bolmeler", slug: "#" },
        { id: 2, title: "Tehsil", slug: "#" },
        { id: 3, title: "Ugur hekayeleri", slug: "#" },
        { id: 4, title: "Reportajlar", slug: "#" },
        { id: 5, title: "Layiheler", slug: "#" },
        { id: 6, title: "Xaricde tehsil", slug: "#" },
        { id: 7, title: "Ugur hekayeleri", slug: "#" },
        { id: 8, title: "Reportajlar", slug: "#" },
    ];
    const broadcastItems: BroadcastItem[] = [
        {
            id: 1,
            title: "Metodik korpu",
            count: "364 video",
            image: "/assets/images/board_1.png",
            slug: "konqres-kend-mektebleri-fond",
        },
        {
            id: 2,
            title: "Usaqlar ve biz",
            count: "128 video",
            image: "/assets/images/board_2.png",
            slug: "steam-laboratoriyalari-tecrube-setleri",
        },
        {
            id: 3,
            title: "Podkast",
            count: "92 video",
            image: "/assets/images/board_3.png",
            slug: "silikon-sehrasi-mekteb-sagirdleri",
        },
        {
            id: 4,
            title: "Tehsil saati",
            count: "56 video",
            image: "/assets/images/board_4.png",
            slug: "tramp-mekteb-naharlari-sud-qanun",
        },
        {
            id: 5,
            title: "Tehsil saati",
            count: "56 video",
            image: "/assets/images/board_5.png",
            slug: "konqres-kend-mektebleri-fond-2",
        },
        {
            id: 6,
            title: "Podkast",
            count: "92 video",
            image: "/assets/images/board_3.png",
            slug: "silikon-sehrasi-mekteb-sagirdleri-2",
        },
        {
            id: 7,
            title: "Tehsil saati",
            count: "56 video",
            image: "/assets/images/board_4.png",
            slug: "tramp-mekteb-naharlari-sud-qanun-2",
        },
    ];

    return (
        <>
            {/* Page top items */}
            <div className="main_center">
                <PageTopItems />
            </div>
            {/* Page top items */}

            {/* Short videolar */}
            <div className="main_center">
                <SliderShort
                    title="Short videolar"
                    items={shortsItems}
                    slidesPerView={5}
                />
            </div>
            {/* Short videolar */}

            {/* section Last video */}
            <div className="mobile">
                <section className="section_wrap pad_top_20 pad_bottom_20">
                    <div className="main_center">
                        <div className="sect_header">
                            <Link href="#" className="sect_title">
                                Son videolar
                            </Link>
                        </div>
                        <div className="sect_body">
                            <div className="row_item gap_20">
                                {newsItems.slice(0, 12).map((item) => (
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
                        </div>
                        <div className="sect_footer">
                            <Link
                                href="#"
                                title="AztehsilTv"
                                className="more load_more_btn"
                            >
                                Daha çox
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
            {/* section Last video  */}

            {/* Xaricdə təhsil */}
            <div className="desktop">
                <div className="main_center">
                    <SliderNews
                        title="Xaricdə təhsil"
                        items={newsItems}
                        slidesPerView={4}
                    />
                </div>
            </div>
            {/* Xaricdə təhsil */}

            {/* Kəşf et */}
            <div className="desktop">
                <div className="main_center">
                    <SliderExplore
                        title="Kəşf et"
                        items={exploreItems}
                        slidesPerView={6}
                    />
                </div>
            </div>
            {/* Kəşf et */}

            {/* Araşdırma */}
            <div className="desktop">
                <div className="main_center">
                    <SliderNews
                        title="Araşdırma"
                        items={newsItems}
                        slidesPerView={3}
                    />
                </div>
            </div>
            {/* Araşdırma */}

            {/* Verilişlər */}
            <div className="desktop">
                <div className="main_center">
                    <SliderBroadcast
                        title="Verilişlər"
                        items={broadcastItems}
                        slidesPerView={5}
                    />
                </div>
            </div>
            {/* Verilişlər */}

            {/* Uğur hekayələri */}
            <div className="desktop">
                <div className="main_center">
                    <SliderNews
                        title="Uğur hekayələri"
                        items={newsItems}
                        slidesPerView={4}
                    />
                </div>
            </div>
            {/* Uğur hekayələri */}

            {/* TopVideo */}
            <div className="main_center">
                <TopVideo />
            </div>
            {/* TopVideo */}

            {/* Təhsil saatı */}
            <div className="desktop">
                <div className="main_center">
                    <SliderNews
                        title="Təhsil saatı"
                        items={newsItems}
                        slidesPerView={3}
                    />
                </div>
            </div>
            {/* Təhsil saatı */}

            {/* Podkast */}
            <div className="desktop">
                <div className="main_center">
                    <SliderNews
                        title="Podkast"
                        items={newsItems}
                        slidesPerView={4}
                    />
                </div>
            </div>
            {/* Podkast */}

            {/* Partners */}
            <div className="main_center">
                <SliderPartner />
            </div>
            {/* Partners */}
        </>
    );
}
