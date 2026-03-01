import Link from "next/link";
import Image from "next/image";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { notFound } from "next/navigation";

import PageTopItems from "@/components/PageTopItems/PageTopItems";
import NewsCard from "@/components/NewsCard/Card";

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


export default async function VideoDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;

    const dict = await getDictionary(locale as Locale);
    const categoryBasePath = `/${locale}/categories`;
    const sidebarItems = [...similarItems, ...similarItems].slice(0, 8);

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
            <div
                className="section_wrap wrap_container margin_top_12"
            >
                <div className="main_center">
                    <div className="section_wrap wrap_contact_page">
                        <div className="sect_header">
                            <h1 className="sect_title">Bizimlə əlaqə</h1>
                        </div>
                        <div className="sect_body clearfix">
                            <div className="wrap_left">
                                <div className="contact-left">
                                    <div className="card brand-card">
                                        <div className="brand-logo">
                                            <Image
                                                src="/assets/icons/contact_logo1.png"
                                                alt="Təhsil TV loqosu"
                                                width="36"
                                                height="36"
                                            />
                                        </div>
                                        <div className="brand-copy">
                                            <div className="brand-name">
                                                Təhsil TV
                                            </div>
                                            <Link
                                                className="brand-link"
                                                href="https://www.aztehsil.com"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                www.aztehsil.com
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="card brand-card">
                                        <div className="brand-logo">
                                            <Image
                                                src="/assets/icons/contact_logo2.png"
                                                alt="Aztəhsil loqosu"
                                                width="36"
                                                height="36"
                                            />
                                        </div>
                                        <div className="brand-copy">
                                            <div className="brand-name">
                                                Aztəhsil
                                            </div>
                                            <Link
                                                className="brand-link"
                                                href="https://www.aztehsil.com"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                www.aztehsil.com
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="card contact-card">
                                        <div className="card-title">
                                            Əlaqə məlumatları
                                        </div>
                                        <ul className="contact-list">
                                            <li className="contact-row">
                                                <span
                                                    className="contact-icon"
                                                >
                                                    <Image
                                                        src="/assets/icons/phone.svg"
                                                        alt="Telefon"
                                                        width="20"
                                                        height="20"
                                                    />
                                                </span>
                                                <div
                                                    className="contact-text"
                                                >
                                                    <Link
                                                        href="tel:+994000000000"
                                                        className="contact-value"
                                                    >
                                                        +994 00 000 00
                                                        00
                                                    </Link>
                                                    <div
                                                        className="contact-label"
                                                    >
                                                        Telefon
                                                    </div>
                                                </div>
                                            </li>
                                            <li className="contact-row">
                                                <span
                                                    className="contact-icon"
                                                >
                                                    <Image
                                                        src="/assets/icons/mail.svg"
                                                        alt="E-poçt"
                                                        width="20"
                                                        height="20"
                                                    />
                                                </span>
                                                <div
                                                    className="contact-text"
                                                >
                                                    <Link
                                                        href="mailto:info@aztehsil.com"
                                                        className="contact-value"
                                                    >
                                                        info@aztehsil.com
                                                    </Link>
                                                    <div
                                                        className="contact-label"
                                                    >
                                                        E-poçt
                                                    </div>
                                                </div>
                                            </li>
                                            <li className="contact-row">
                                                <span
                                                    className="contact-icon"
                                                >
                                                    <Image
                                                        src="/assets/icons/location.svg"
                                                        alt="Ünvan"
                                                        width="20"
                                                        height="20"
                                                    />
                                                </span>
                                                <div
                                                    className="contact-text"
                                                >
                                                    <div
                                                        className="contact-value"
                                                    >
                                                        Bakı şəh, Səbail
                                                        ray, Maqomayev
                                                        3. 78
                                                    </div>
                                                    <div
                                                        className="contact-label"
                                                    >
                                                        Ünvan
                                                    </div>
                                                </div>
                                            </li>
                                        </ul>
                                    </div>
                                    <div className="socials_section">
                                        <div className="social_title">
                                            Sosial şəbəkələr
                                        </div>
                                        <ul className="socials">
                                            <li>
                                                <Link
                                                    href=""
                                                    className="social_icon"
                                                    target="_blank"
                                                >
                                                    <span
                                                        className="scl_icn"
                                                    >
                                                        <Image
                                                            className="logo--light"
                                                            src="/assets/icons/icon_facebook_light.svg"
                                                            alt="facebook"
                                                            width="16"
                                                            height="16"
                                                        />
                                                        <Image
                                                            className="logo--dark"
                                                            src="/assets/icons/icon_facebook.svg"
                                                            alt="facebook"
                                                            width="16"
                                                            height="16"
                                                        />
                                                    </span>
                                                    <span
                                                        className="scl_name"
                                                    >
                                                        Facebook
                                                    </span>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href=""
                                                    className="social_icon"
                                                    target="_blank"
                                                >
                                                    <span
                                                        className="scl_icn"
                                                    >
                                                        <Image
                                                            className="logo--light"
                                                            src="/assets/icons/icon_instagram_light.svg"
                                                            alt="instagram"
                                                            width="16"
                                                            height="16"
                                                        />
                                                        <Image
                                                            className="logo--dark"
                                                            src="/assets/icons/icon_instagram.svg"
                                                            alt="instagram"
                                                            width="16"
                                                            height="16"
                                                        />
                                                    </span>
                                                    <span
                                                        className="scl_name"
                                                    >
                                                        Instagram
                                                    </span>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href=""
                                                    className="social_icon"
                                                    target="_blank"
                                                >
                                                    <span
                                                        className="scl_icn"
                                                    >
                                                        <Image
                                                            className="logo--light"
                                                            src="/assets/icons/icon_ytb_light.svg"
                                                            alt="youtube"
                                                            width="16"
                                                            height="16"
                                                        />
                                                        <Image
                                                            className="logo--dark"
                                                            src="/assets/icons/icon_ytb.svg"
                                                            alt="youtube"
                                                            width="16"
                                                            height="16"
                                                        />
                                                    </span>
                                                    <span
                                                        className="scl_name"
                                                    >
                                                        Youtube
                                                    </span>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href=""
                                                    className="social_icon"
                                                    target="_blank"
                                                >
                                                    <span
                                                        className="scl_icn"
                                                    >
                                                        <Image
                                                            className="logo--light"
                                                            src="/assets/icons/icon_telegram_light.svg"
                                                            alt="telegram"
                                                            width="16"
                                                            height="16"
                                                        />
                                                        <Image
                                                            className="logo--dark"
                                                            src="/assets/icons/icon_telegram.svg"
                                                            alt="telegram"
                                                            width="16"
                                                            height="16"
                                                        />
                                                    </span>
                                                    <span
                                                        className="scl_name"
                                                    >
                                                        Telegram
                                                    </span>
                                                </Link>
                                            </li>
                                            <li>
                                                <Link
                                                    href=""
                                                    className="social_icon"
                                                    target="_blank"
                                                >
                                                    <span
                                                        className="scl_icn"
                                                    >
                                                        <Image
                                                            className="logo--light"
                                                            src="/assets/icons/icon_tiktok_light.svg"
                                                            alt="tiktok"
                                                            width="16"
                                                            height="16"
                                                        />
                                                        <Image
                                                            className="logo--dark"
                                                            src="/assets/icons/icon_tiktok.svg"
                                                            alt="tiktok"
                                                            width="16"
                                                            height="16"
                                                        />
                                                    </span>
                                                    <span
                                                        className="scl_name"
                                                    >
                                                        Tiktok
                                                    </span>
                                                </Link>
                                            </li>
                                        </ul>
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
            </div>

        </div>
    );
}
