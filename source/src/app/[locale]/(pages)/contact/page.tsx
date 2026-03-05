import Link from "next/link";
import Image from "next/image";
import { type Locale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { getSiteSettings } from "@/lib/data/settings.data";
import { getPublishedVideos } from "@/lib/data/videos.data";
import { pickLocalized, pickLocalizedExact } from "@/lib/localization";
import type { Video } from "@/types/video.types";

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

const fallbackImages = [
    "/assets/images/card_1.png",
    "/assets/images/card_2.png",
    "/assets/images/card_3.png",
    "/assets/images/card_4.png",
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
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;

    const resolvedLocale = locale as Locale;
    const dict = await getDictionary(resolvedLocale);
    const homeDict = dict?.home ?? {};
    const settings = await getSiteSettings();
    const categoryBasePath = `/${locale}/categories`;
    const contact = settings?.contact ?? { email: "", phone: "", address: "" };
    const phoneValue = contact.phone?.trim() || "";
    const emailValue = contact.email?.trim() || "";
    const addressValue = contact.address?.trim() || "";
    const phoneHref = phoneValue
        ? `tel:${phoneValue.replace(/\s+/g, "")}`
        : "#";
    const emailHref = emailValue ? `mailto:${emailValue}` : "#";
    const latestTitle =
        homeDict?.latest?.title?.trim() ||
        homeDict?.lates?.title?.trim() ||
        (locale === "az" ? "Son" : locale === "ru" ? "Последний" : "Latest");
    const videosTitle =
        homeDict?.videos?.title?.trim() ||
        (locale === "az" ? "Videolar" : locale === "ru" ? "Видео" : "Videos");
    const moreTitle =
        homeDict?.more?.title?.trim() ||
        (locale === "az" ? "Daha çox" : locale === "ru" ? "Более" : "More");
    const footerSocialDesc = homeDict?.footer?.desc?.trim();
    const socialLinks = [
        {
            id: "facebook",
            label: "Facebook",
            url: settings?.social?.facebook,
            light: "/assets/icons/icon_facebook_light.svg",
            dark: "/assets/icons/icon_facebook.svg",
        },
        {
            id: "instagram",
            label: "Instagram",
            url: settings?.social?.instagram,
            light: "/assets/icons/icon_instagram_light.svg",
            dark: "/assets/icons/icon_instagram.svg",
        },
        {
            id: "youtube",
            label: "Youtube",
            url: settings?.social?.youtube,
            light: "/assets/icons/icon_ytb_light.svg",
            dark: "/assets/icons/icon_ytb.svg",
        },
        {
            id: "telegram",
            label: "Telegram",
            url: settings?.social?.telegram,
            light: "/assets/icons/icon_telegram_light.svg",
            dark: "/assets/icons/icon_telegram.svg",
        },
        {
            id: "tiktok",
            label: "Tiktok",
            url: settings?.social?.tiktok,
            light: "/assets/icons/icon_tiktok_light.svg",
            dark: "/assets/icons/icon_tiktok.svg",
        },
    ]
        .filter((item) => item.url && item.url.trim().length > 0)
        .map((item) => ({
            ...item,
            url: item.url!.trim(),
        }));

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

    const formatViews = (value: number) => {
        const compact = new Intl.NumberFormat(resolvedLocale, {
            notation: "compact",
            maximumFractionDigits: 1,
        }).format(Math.max(0, value || 0));
        const suffix =
            resolvedLocale === "en"
                ? "views"
                : resolvedLocale === "ru"
                  ? "views"
                  : "baxış";
        return `${compact} ${suffix}`;
    };

    const formatDate = (value: string | null | undefined) => {
        if (!value) return "";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return "";
        return new Intl.DateTimeFormat(resolvedLocale, {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }).format(date);
    };

    const getVideoTitle = (video: Video) =>
        pickLocalizedExact(video.title, resolvedLocale, defaultLocale).trim();

    const listLocale = {
        locale: resolvedLocale,
        fallbackLocale: defaultLocale,
    };

    const sidebarVideosRaw = await getPublishedVideos({
        flags: { isSidebar: true },
        limit: 8,
        ...listLocale,
    });
    const fallbackVideosRaw =
        sidebarVideosRaw.length > 0
            ? []
            : await getPublishedVideos({ limit: 8, ...listLocale });
    const sidebarSource = sidebarVideosRaw.length
        ? sidebarVideosRaw
        : fallbackVideosRaw;

    const sidebarItems: NewsItem[] = sidebarSource.map((video, index) => {
        const slugValue = pickLocalized(video.slug, resolvedLocale, defaultLocale);
        return {
            id: index + 1,
            title: getVideoTitle(video),
            image:
                video.coverUrl ||
                fallbackImages[index % fallbackImages.length],
            views: formatViews(video.views ?? 0),
            date: formatDate(
                video.publishedAt || video.updatedAt || video.createdAt,
            ),
            category: "",
            duration: video.duration || "",
            slug: slugValue || "#",
            type: video.type ?? "video",
        };
    });

    return (
        <div className="section_wrap wrap_inner_page pad_bottom_40">
            {/* Page top items */}
            <div className="main_center">
                <PageTopItems locale={locale} dict={dict} />
            </div>
            {/* Page top items */}
            <div
                className="section_wrap wrap_container margin_top_12"
            >
                <div className="main_center">
                    <div className="section_wrap wrap_contact_page">
                        <div className="sect_header">
                            <h1 className="sect_title">{dict.contact?.title || "Contact"}</h1>
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
                                        <div className="card-title">{dict.contact?.title || "Contact"}</div>
                                                                                <ul className="contact-list">
                                            {phoneValue && (
                                                <li className="contact-row">
                                                    <span className="contact-icon">
                                                        <Image
                                                            src="/assets/icons/phone.svg"
                                                            alt={dict.contact?.phone || "Phone"}
                                                            width="20"
                                                            height="20"
                                                        />
                                                    </span>
                                                    <div className="contact-text">
                                                        <Link
                                                            href={phoneHref}
                                                            className="contact-value"
                                                        >
                                                            {phoneValue}
                                                        </Link>
                                                        <div className="contact-label">
                                                            {dict.contact?.phone || "Phone"}
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                            {emailValue && (
                                                <li className="contact-row">
                                                    <span className="contact-icon">
                                                        <Image
                                                            src="/assets/icons/mail.svg"
                                                            alt={dict.contact?.email || "Email"}
                                                            width="20"
                                                            height="20"
                                                        />
                                                    </span>
                                                    <div className="contact-text">
                                                        <Link
                                                            href={emailHref}
                                                            className="contact-value"
                                                        >
                                                            {emailValue}
                                                        </Link>
                                                        <div className="contact-label">
                                                            {dict.contact?.email || "Email"}
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                            {addressValue && (
                                                <li className="contact-row">
                                                    <span className="contact-icon">
                                                        <Image
                                                            src="/assets/icons/location.svg"
                                                            alt={dict.contact?.address || "Address"}
                                                            width="20"
                                                            height="20"
                                                        />
                                                    </span>
                                                    <div className="contact-text">
                                                        <div className="contact-value">
                                                            {addressValue}
                                                        </div>
                                                        <div className="contact-label">
                                                            {dict.contact?.address || "Address"}
                                                        </div>
                                                    </div>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    {socialLinks.length > 0 && (
                                        <div className="socials_section">
                                            <div className="social_title">
                                                {footerSocialDesc || "Social networks"}
                                            </div>
                                            <ul className="socials">
                                                {socialLinks.map((item) => (
                                                    <li key={item.id}>
                                                        <Link
                                                            href={item.url as string}
                                                            className="social_icon"
                                                            target="_blank"
                                                            rel="noreferrer"
                                                        >
                                                            <span className="scl_icn">
                                                                <Image
                                                                    className="logo--light"
                                                                    src={item.light}
                                                                    alt={item.label}
                                                                    width="16"
                                                                    height="16"
                                                                />
                                                                <Image
                                                                    className="logo--dark"
                                                                    src={item.dark}
                                                                    alt={item.label}
                                                                    width="16"
                                                                    height="16"
                                                                />
                                                            </span>
                                                            <span className="scl_name">
                                                                {item.label}
                                                            </span>
                                                        </Link>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="wrap_right">
                                <section className="card video-card">
                                    <div className="video-card__header">
                                        <div className="section-label">
                                            <span className="">{latestTitle}</span>
                                            <span className="accent">
                                                {videosTitle}
                                            </span>
                                        </div>
                                        <Link
                                            className="link-more"
                                            href={categoryBasePath}
                                        >
                                            {moreTitle}
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



