import Link from "next/link";
import Image from "next/image";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { notFound } from "next/navigation";

import PageTopItems from "@/components/PageTopItems/PageTopItems";
import NewsCard from "@/components/NewsCard/Card";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";

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

const similarItems: NewsItem[] = [
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
];

const shareItems = [
    {
        id: "facebook",
        label: "Facebook-da paylaş",
        name: "Facebook",
        icon: "/assets/icons/facebook_sh.svg",
    },
    {
        id: "whatsapp",
        label: "WhatsApp-da paylaş",
        name: "Whatsapp",
        icon: "/assets/icons/whatsapp_sh.svg",
    },
    {
        id: "telegram",
        label: "Telegram-da paylaş",
        name: "Telegram",
        icon: "/assets/icons/telegram_sh.svg",
    },
    {
        id: "x",
        label: "X-da paylaş",
        name: "X",
        icon: "/assets/icons/x_sh.svg",
    },
    {
        id: "link",
        label: "Linki kopyala",
        name: "Link",
        icon: "/assets/icons/link_sh.svg",
    },
];

const tagItems = ["Imtahan", "Azərbaycan", "Təhsil", "Məktəb", "Ədəbiyyat"];
const demoVideo = {
    sources: [
        {
            src: "https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8",
            type: "application/x-mpegURL",
        },
        {
            src: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            type: "video/mp4",
        },
    ],
    isLive: false,
};

const videosData: Record<
    string,
    {
        title: string;
        image: string;
        views: string;
        date: string;
        category: string;
        duration: string;
        description: string[];
        slug: string;
        type: "video" | "list";
        video?: {
            sources: { src: string; type: string }[];
            tracks?: {
                src: string;
                srclang: string;
                label: string;
                default?: boolean;
            }[];
            thumbnails?: string;
            isLive?: boolean;
        };
    }
> = {
    "silikon-sehrasi-mekteb-sagirdleri": {        
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_1.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "silikon-sehrasi-mekteb-sagirdleri",
        type: "video",
        video: demoVideo,
        description: [
            "Azərbaycan tarixi fənni ilə yanaşı, digər fənlərin də ana dilində tədrisi məsələsinə aydınlıq gətirilib.",
            "AzTehsil.com xəbər verir ki, bu barədə Təhsil İnstitutunun direktoru səlahiyyətlərini müvəqqəti icra edən, elm və təhsil nazirinin müşaviri Elnur Əliyev jurnalistlərə açıqlamasında deyib.",
            "O qeyd edib ki, Azərbaycan dili fənninin tədrisi genişlənir. Bəzi fənlər artıq Azərbaycan dilində keçirilir: “Artıq ədəbiyyat, hərbi hazırlıq və musiqi fənləri tədris dilindən asılı olmayaraq, bütün siniflərdə  Azərbaycan dilində tədris olunur və bu fənlər üzrə qiymətləndirmə də həmin dildə aparılır. Məqsəd şagirdlərin öyrənmə prosesinə təsiri və nəticələrin qiymətləndirilməsidir.   Hazırda digər fənlərin də Azərbaycan dilində tədrisi ilə bağlı müzakirələr davam edir. Konkret hansı fənlərin bu siyahıya əlavə olunacağı barədə qərar isə növbəti illərdə veriləcək”.",
        ],
    },
    "konqres-kend-mektebleri-fond": {        
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_3.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "konqres-kend-mektebleri-fond",
        type: "video",
        description: [
            "Azərbaycan tarixi fənni ilə yanaşı, digər fənlərin də ana dilində tədrisi məsələsinə aydınlıq gətirilib.",
            "AzTehsil.com xəbər verir ki, bu barədə Təhsil İnstitutunun direktoru səlahiyyətlərini müvəqqəti icra edən, elm və təhsil nazirinin müşaviri Elnur Əliyev jurnalistlərə açıqlamasında deyib.",
            "O qeyd edib ki, Azərbaycan dili fənninin tədrisi genişlənir. Bəzi fənlər artıq Azərbaycan dilində keçirilir: “Artıq ədəbiyyat, hərbi hazırlıq və musiqi fənləri tədris dilindən asılı olmayaraq, bütün siniflərdə  Azərbaycan dilində tədris olunur və bu fənlər üzrə qiymətləndirmə də həmin dildə aparılır. Məqsəd şagirdlərin öyrənmə prosesinə təsiri və nəticələrin qiymətləndirilməsidir.   Hazırda digər fənlərin də Azərbaycan dilində tədrisi ilə bağlı müzakirələr davam edir. Konkret hansı fənlərin bu siyahıya əlavə olunacağı barədə qərar isə növbəti illərdə veriləcək”.",
        ],
    },
    "tramp-mekteb-naharlari-sud-qanun": {        
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_2.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "tramp-mekteb-naharlari-sud-qanun",
        type: "video",
        description: [
            "Azərbaycan tarixi fənni ilə yanaşı, digər fənlərin də ana dilində tədrisi məsələsinə aydınlıq gətirilib.",
            "AzTehsil.com xəbər verir ki, bu barədə Təhsil İnstitutunun direktoru səlahiyyətlərini müvəqqəti icra edən, elm və təhsil nazirinin müşaviri Elnur Əliyev jurnalistlərə açıqlamasında deyib.",
            "O qeyd edib ki, Azərbaycan dili fənninin tədrisi genişlənir. Bəzi fənlər artıq Azərbaycan dilində keçirilir: “Artıq ədəbiyyat, hərbi hazırlıq və musiqi fənləri tədris dilindən asılı olmayaraq, bütün siniflərdə  Azərbaycan dilində tədris olunur və bu fənlər üzrə qiymətləndirmə də həmin dildə aparılır. Məqsəd şagirdlərin öyrənmə prosesinə təsiri və nəticələrin qiymətləndirilməsidir.   Hazırda digər fənlərin də Azərbaycan dilində tədrisi ilə bağlı müzakirələr davam edir. Konkret hansı fənlərin bu siyahıya əlavə olunacağı barədə qərar isə növbəti illərdə veriləcək”.",
        ],
    },
    "steam-laboratoriyalari-tecrube-setleri": {        
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_4.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "steam-laboratoriyalari-tecrube-setleri",
        type: "video",
        description: [
            "Azərbaycan tarixi fənni ilə yanaşı, digər fənlərin də ana dilində tədrisi məsələsinə aydınlıq gətirilib.",
            "AzTehsil.com xəbər verir ki, bu barədə Təhsil İnstitutunun direktoru səlahiyyətlərini müvəqqəti icra edən, elm və təhsil nazirinin müşaviri Elnur Əliyev jurnalistlərə açıqlamasında deyib.",
            "O qeyd edib ki, Azərbaycan dili fənninin tədrisi genişlənir. Bəzi fənlər artıq Azərbaycan dilində keçirilir: “Artıq ədəbiyyat, hərbi hazırlıq və musiqi fənləri tədris dilindən asılı olmayaraq, bütün siniflərdə  Azərbaycan dilində tədris olunur və bu fənlər üzrə qiymətləndirmə də həmin dildə aparılır. Məqsəd şagirdlərin öyrənmə prosesinə təsiri və nəticələrin qiymətləndirilməsidir.   Hazırda digər fənlərin də Azərbaycan dilində tədrisi ilə bağlı müzakirələr davam edir. Konkret hansı fənlərin bu siyahıya əlavə olunacağı barədə qərar isə növbəti illərdə veriləcək”.",
        ],
    },
    "silikon-sehrasi-mekteb-sagirdleri-2": {        
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_1.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "silikon-sehrasi-mekteb-sagirdleri",
        type: "video",
        description: [
            "Azərbaycan tarixi fənni ilə yanaşı, digər fənlərin də ana dilində tədrisi məsələsinə aydınlıq gətirilib.",
            "AzTehsil.com xəbər verir ki, bu barədə Təhsil İnstitutunun direktoru səlahiyyətlərini müvəqqəti icra edən, elm və təhsil nazirinin müşaviri Elnur Əliyev jurnalistlərə açıqlamasında deyib.",
            "O qeyd edib ki, Azərbaycan dili fənninin tədrisi genişlənir. Bəzi fənlər artıq Azərbaycan dilində keçirilir: “Artıq ədəbiyyat, hərbi hazırlıq və musiqi fənləri tədris dilindən asılı olmayaraq, bütün siniflərdə  Azərbaycan dilində tədris olunur və bu fənlər üzrə qiymətləndirmə də həmin dildə aparılır. Məqsəd şagirdlərin öyrənmə prosesinə təsiri və nəticələrin qiymətləndirilməsidir.   Hazırda digər fənlərin də Azərbaycan dilində tədrisi ilə bağlı müzakirələr davam edir. Konkret hansı fənlərin bu siyahıya əlavə olunacağı barədə qərar isə növbəti illərdə veriləcək”.",
        ],
    },
    "konqres-kend-mektebleri-fond-2": {        
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_3.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "konqres-kend-mektebleri-fond",
        type: "video",
        description: [
            "Azərbaycan tarixi fənni ilə yanaşı, digər fənlərin də ana dilində tədrisi məsələsinə aydınlıq gətirilib.",
            "AzTehsil.com xəbər verir ki, bu barədə Təhsil İnstitutunun direktoru səlahiyyətlərini müvəqqəti icra edən, elm və təhsil nazirinin müşaviri Elnur Əliyev jurnalistlərə açıqlamasında deyib.",
            "O qeyd edib ki, Azərbaycan dili fənninin tədrisi genişlənir. Bəzi fənlər artıq Azərbaycan dilində keçirilir: “Artıq ədəbiyyat, hərbi hazırlıq və musiqi fənləri tədris dilindən asılı olmayaraq, bütün siniflərdə  Azərbaycan dilində tədris olunur və bu fənlər üzrə qiymətləndirmə də həmin dildə aparılır. Məqsəd şagirdlərin öyrənmə prosesinə təsiri və nəticələrin qiymətləndirilməsidir.   Hazırda digər fənlərin də Azərbaycan dilində tədrisi ilə bağlı müzakirələr davam edir. Konkret hansı fənlərin bu siyahıya əlavə olunacağı barədə qərar isə növbəti illərdə veriləcək”.",
        ],
    },
    "tramp-mekteb-naharlari-sud-qanun-2": {        
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_2.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "tramp-mekteb-naharlari-sud-qanun",
        type: "video",
        description: [
            "Azərbaycan tarixi fənni ilə yanaşı, digər fənlərin də ana dilində tədrisi məsələsinə aydınlıq gətirilib.",
            "AzTehsil.com xəbər verir ki, bu barədə Təhsil İnstitutunun direktoru səlahiyyətlərini müvəqqəti icra edən, elm və təhsil nazirinin müşaviri Elnur Əliyev jurnalistlərə açıqlamasında deyib.",
            "O qeyd edib ki, Azərbaycan dili fənninin tədrisi genişlənir. Bəzi fənlər artıq Azərbaycan dilində keçirilir: “Artıq ədəbiyyat, hərbi hazırlıq və musiqi fənləri tədris dilindən asılı olmayaraq, bütün siniflərdə  Azərbaycan dilində tədris olunur və bu fənlər üzrə qiymətləndirmə də həmin dildə aparılır. Məqsəd şagirdlərin öyrənmə prosesinə təsiri və nəticələrin qiymətləndirilməsidir.   Hazırda digər fənlərin də Azərbaycan dilində tədrisi ilə bağlı müzakirələr davam edir. Konkret hansı fənlərin bu siyahıya əlavə olunacağı barədə qərar isə növbəti illərdə veriləcək”.",
        ],
    },
    "steam-laboratoriyalari-tecrube-setleri-2": {        
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_4.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "steam-laboratoriyalari-tecrube-setleri",
        type: "video",
        description: [
            "Azərbaycan tarixi fənni ilə yanaşı, digər fənlərin də ana dilində tədrisi məsələsinə aydınlıq gətirilib.",
            "AzTehsil.com xəbər verir ki, bu barədə Təhsil İnstitutunun direktoru səlahiyyətlərini müvəqqəti icra edən, elm və təhsil nazirinin müşaviri Elnur Əliyev jurnalistlərə açıqlamasında deyib.",
            "O qeyd edib ki, Azərbaycan dili fənninin tədrisi genişlənir. Bəzi fənlər artıq Azərbaycan dilində keçirilir: “Artıq ədəbiyyat, hərbi hazırlıq və musiqi fənləri tədris dilindən asılı olmayaraq, bütün siniflərdə  Azərbaycan dilində tədris olunur və bu fənlər üzrə qiymətləndirmə də həmin dildə aparılır. Məqsəd şagirdlərin öyrənmə prosesinə təsiri və nəticələrin qiymətləndirilməsidir.   Hazırda digər fənlərin də Azərbaycan dilində tədrisi ilə bağlı müzakirələr davam edir. Konkret hansı fənlərin bu siyahıya əlavə olunacağı barədə qərar isə növbəti illərdə veriləcək”.",
        ],
    },

};

export default async function VideoDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;

    // Check if videos exists
    const videos = videosData[slug];
    if (!videos) {
        notFound();
    }

    const dict = await getDictionary(locale as Locale);
    const categoryBasePath = `/${locale}/categories`;
    const metaCategory = videos.category || "Imtahan";
    const metaDate = videos.date || "28 Dek 2026";
    const metaViews = videos.views || "1.2 M baxış";
    const sidebarItems = [...similarItems, ...similarItems].slice(0, 8);
    const videoConfig = videos.video;

    const resolveSlug = (slug: string) => {
        if (!slug || slug === "#") return "#";
        if (
            slug.startsWith("/") ||
            slug.startsWith("http://") ||
            slug.startsWith("https://") ||
            slug.startsWith("#")
        ) {
            return slug;
        }
        return `${categoryBasePath}/${slug}`;
    };

    return (
        <div className="section_wrap wrap_inner_page pad_bottom_40">
            {/* Page top items */}
            <div className="main_center">
                <PageTopItems />
            </div>
            {/* Page top items */}
            <div className="main_center">
                <div className="wrap_detail_page">
                    <div className="sect_body clearfix">
                        <div className="wrap_left">
                            <div className="detail_content_card">
                                <div className="news_in_img">
                                    {videoConfig ? (
                                        <VideoPlayer
                                            title={videos.title}
                                            poster={videos.image}
                                            sources={videoConfig.sources}
                                            tracks={videoConfig.tracks}
                                            thumbnails={videoConfig.thumbnails}
                                            isLive={videoConfig.isLive}
                                        />
                                    ) : (
                                        <Image
                                            src={videos.image}
                                            alt={videos.title}
                                            width={800}
                                            height={450}
                                        />
                                    )}
                                </div>
                                <div className="news_header">
                                    <h1 className="news_hd">
                                        {videos.title}
                                    </h1>
                                </div>
                                <div className="detail_meta_bar">
                                    <div className="detail_meta_item">
                                        <span className="meta_value">
                                            {metaCategory}
                                        </span>
                                    </div>
                                    <div className="detail_meta_item">
                                        <span className="meta_value">
                                            {metaDate}
                                        </span>
                                    </div>
                                    <div className="detail_meta_item">
                                        <span className="meta_value">
                                            {metaViews}
                                        </span>
                                    </div>
                                    <a href="#" className="share_link_item">
                                        {"Paylaş"}
                                    </a>
                                </div>
                            </div>

                            <div className="detail_content_card">
                                <div className="news_inner_items">
                                    <div className="detail_container">
                                        <div className="sect_body">
                                            <div
                                                className="nw_in_text clearfix"
                                                data-detail-container="true"
                                            >
                                                {videos.description.map(
                                                    (paragraph, index) => (
                                                        <p key={index}>
                                                            {paragraph}
                                                        </p>
                                                    )
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <section className="share-section margin_top_18 margin_bottom_18">
                                <div className="share-title">
                                    {"Videonu paylaş:"}
                                </div>

                                <div className="share-list">
                                    {shareItems.map((item) => (
                                        <Link
                                            key={item.id}
                                            className="share-item"
                                            href="#"
                                            aria-label={item.label}
                                        >
                                            <span className="share-icon">
                                                <Image
                                                    src={item.icon}
                                                    alt={item.name}
                                                    width={24}
                                                    height={24}
                                                />
                                            </span>
                                            <span className="share-label">
                                                {item.name}
                                            </span>
                                        </Link>
                                    ))}
                                </div>
                            </section>

                            <div className="vide_tag_section">
                                <div className="vide_tag_title">{"TEQLƏR:"}</div>

                                <div className="vide_tag_list">
                                    {tagItems.map((tag) => (
                                        <Link
                                            key={tag}
                                            href="#"
                                            className="vide_tag_item"
                                        >
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="wrap_right">
                            <section className="card video-card">
                                <div className="video-card__header">
                                    <div className="section-label">
                                        <span className="">Son</span>
                                        <span className="accent">Videolar</span>
                                    </div>
                                    <Link
                                        className="link-more"
                                        href={categoryBasePath}
                                    >
                                        {"Daha çox"}
                                        <span className="link-arrow">
                                            <Image
                                                src="/assets/icons/chevron-right.svg"
                                                alt="right"
                                                width={12}
                                                height={12}
                                            />
                                        </span>
                                    </Link>
                                </div>
                                <div className="video-list">
                                    {sidebarItems.map((item, index) => (
                                        <Link
                                            key={`${item.id}-${index}`}
                                            className="video-item"
                                            href={resolveSlug(item.slug)}
                                        >
                                            <div className="video-thumb">
                                                <Image
                                                    src={item.image}
                                                    alt={item.title}
                                                    width={153}
                                                    height={86}
                                                />
                                                <span className="duration">
                                                    {item.duration}
                                                </span>
                                            </div>
                                            <div className="video-copy">
                                                <h4 className="video-title">
                                                    {item.title}
                                                </h4>
                                                <div className="video-meta">
                                                    <span className="meta-icon play"></span>
                                                    <span className="meta-text">
                                                        {item.views}
                                                    </span>
                                                    <span className="meta-dot"></span>
                                                    <span className="meta-text">
                                                        {item.date}
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Videos */}
            <div className="main_center pad_top_40">
                <section className="detail_similar">
                    <div className="section_wrap">
                        <div className="sect_header clearfix">
                            <div className="sect_title">{"Ox\u015far videolar"}</div>
                        </div>
                        <div className="sect_body">
                            <div className="row_item gap_20">
                                {similarItems.map((item) => (
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
                    </div>
                </section>
            </div>
            {/* Similar Videos */}
        </div>
    );
}



