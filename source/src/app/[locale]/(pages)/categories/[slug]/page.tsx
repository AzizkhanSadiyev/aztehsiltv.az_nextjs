import Link from "next/link";
import Image from "next/image";
import { type Locale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { notFound } from "next/navigation";
import { headers } from "next/headers";

import PageTopItems from "@/components/PageTopItems/PageTopItems";
import NewsCard from "@/components/NewsCard/Card";
import VideoPlayer from "@/components/VideoPlayer/VideoPlayer";
import ShareBar from "@/components/ShareBar/ShareBar";
import { getActiveCategories } from "@/lib/data/categories.data";
import {
    getPublishedVideoBySlug,
    getPublishedVideos,
} from "@/lib/data/videos.data";
import {
    pickLocalized,
    pickLocalizedExact,
    safeLocaleKey,
} from "@/lib/localization";
import { getSiteSettings } from "@/lib/data/settings.data";
import type { Video } from "@/types/video.types";

export const dynamic = "force-dynamic";

const shareItemDefinitions = [
    {
        id: "facebook",
        label: "Share on Facebook",
        name: "Facebook",
        icon: "/assets/icons/facebook_sh.svg",
    },
    {
        id: "whatsapp",
        label: "Share on WhatsApp",
        name: "Whatsapp",
        icon: "/assets/icons/whatsapp_sh.svg",
    },
    {
        id: "telegram",
        label: "Share on Telegram",
        name: "Telegram",
        icon: "/assets/icons/telegram_sh.svg",
    },
    {
        id: "x",
        label: "Share on X",
        name: "X",
        icon: "/assets/icons/x_sh.svg",
    },
    {
        id: "link",
        label: "Copy link",
        name: "Link",
        icon: "/assets/icons/link_sh.svg",
    },
];

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

const buildVideoSources = (url?: string | null) => {
    if (!url) return [];
    const normalized = url.toLowerCase();
    if (normalized.endsWith(".m3u8")) {
        return [{ src: url, type: "application/x-mpegURL" }];
    }
    if (normalized.endsWith(".mp4")) {
        return [{ src: url, type: "video/mp4" }];
    }
    if (normalized.endsWith(".webm")) {
        return [{ src: url, type: "video/webm" }];
    }
    return [];
};

const getYoutubeEmbedUrl = (url?: string | null) => {
    if (!url) return null;
    try {
        const parsed = new URL(url);
        const hostname = parsed.hostname.replace("www.", "");
        if (hostname === "youtu.be") {
            const id = parsed.pathname.replace("/", "").split("/")[0];
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }
        if (hostname === "youtube.com" || hostname === "m.youtube.com") {
            const id = parsed.searchParams.get("v");
            return id ? `https://www.youtube.com/embed/${id}` : null;
        }
    } catch {
        return null;
    }
    return null;
};

export default async function VideoDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;
    const settings = await getSiteSettings();
    const fallbackLocale =
        settings.localization?.defaultLocale || defaultLocale;
    const resolvedLocale = (locale || fallbackLocale) as Locale;

    const video = await getPublishedVideoBySlug(
        slug,
        resolvedLocale,
        fallbackLocale
    );
    if (!video) {
        notFound();
    }

    const dict = await getDictionary(resolvedLocale);
    const categories = await getActiveCategories();
    const categoryMap = new Map(
        categories.map((category) => [
            category.id,
            pickLocalizedExact(category.name, resolvedLocale, fallbackLocale).trim(),
        ])
    );

    const categoryBasePath = `/${locale}/categories`;
    const safeLocale = safeLocaleKey(resolvedLocale, fallbackLocale);
    const localizedTitle = pickLocalizedExact(
        video.title,
        resolvedLocale,
        fallbackLocale
    );
    if (!localizedTitle.trim()) {
        notFound();
    }
    const title = localizedTitle.trim();
    const rawDescription = pickLocalizedExact(
        video.description ?? {},
        resolvedLocale,
        fallbackLocale
    );
    const escapeHtml = (value: string) =>
        value
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#039;");
    const normalizeDescriptionHtml = (value: string) => {
        const trimmed = value.trim();
        if (!trimmed) return "";
        if (/<[a-z][\s\S]*>/i.test(trimmed)) {
            return trimmed;
        }
        return trimmed
            .split(/\n{2,}/)
            .map((block) =>
                `<p>${escapeHtml(block).replace(/\n/g, "<br />")}</p>`
            )
            .join("");
    };
    const descriptionHtml = normalizeDescriptionHtml(rawDescription);
    const metaCategory = video.categoryId
        ? categoryMap.get(video.categoryId) || "Category"
        : "Category";
    const metaDate = formatDate(video.publishedAt ?? video.createdAt, resolvedLocale);
    const metaViews = formatViews(video.views ?? 0, resolvedLocale);
    const tagsByLocale =
        (video.metadata as any)?.tagsByLocale || null;
    const localizedTags = Array.isArray(tagsByLocale?.[safeLocale])
        ? tagsByLocale[safeLocale]
        : [];
    const tagItems = localizedTags.length
        ? localizedTags
        : safeLocale === fallbackLocale && Array.isArray(video.tags)
          ? video.tags
          : [];

    const headersList = await headers();
    const host =
        headersList.get("x-forwarded-host") ?? headersList.get("host");
    const proto =
        headersList.get("x-forwarded-proto") ?? "http";
    const baseUrl =
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
        (host ? `${proto}://${host}` : "");
    const pageUrl = baseUrl
        ? `${baseUrl}/${locale}/categories/${slug}`
        : "";
    const encodedUrl = pageUrl ? encodeURIComponent(pageUrl) : "";
    const encodedTitle = encodeURIComponent(title);

    const shareItems = shareItemDefinitions.map((item) => {
        if (!pageUrl) {
            return { ...item, href: "#", copy: item.id === "link" };
        }
        if (item.id === "facebook") {
            return {
                ...item,
                href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            };
        }
        if (item.id === "whatsapp") {
            return {
                ...item,
                href: `https://api.whatsapp.com/send?text=${encodeURIComponent(
                    `${title} ${pageUrl}`,
                )}`,
            };
        }
        if (item.id === "telegram") {
            return {
                ...item,
                href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
            };
        }
        if (item.id === "x") {
            return {
                ...item,
                href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
            };
        }
        if (item.id === "link") {
            return { ...item, href: pageUrl, copy: true };
        }
        return { ...item, href: pageUrl };
    });

    const sources = buildVideoSources(video.sourceUrl);
    const youtubeEmbed = getYoutubeEmbedUrl(video.sourceUrl);

    const resolveSlug = (slugValue: string) => {
        if (!slugValue || slugValue === "#") return "#";
        if (
            slugValue.startsWith("/") ||
            slugValue.startsWith("http://") ||
            slugValue.startsWith("https://") ||
            slugValue.startsWith("#")
        ) {
            return slugValue;
        }
        return `${categoryBasePath}/${slugValue}`;
    };

    const hasLocalizedTitle = (item: Video) => {
        const title = pickLocalizedExact(
            item.title,
            resolvedLocale,
            fallbackLocale
        ).trim();
        return title.length > 0;
    };

    const sidebarSource = (await getPublishedVideos({
        limit: 12,
        locale: resolvedLocale,
        fallbackLocale,
    })).filter((item) => hasLocalizedTitle(item));
    const sidebarCandidates = sidebarSource.filter(
        (item) => item.id !== video.id
    );
    const sidebarItems = (sidebarCandidates.length
        ? sidebarCandidates
        : sidebarSource
    )
        .slice(0, 8)
        .map((item, index) => {
            const itemTitle = pickLocalizedExact(
                item.title,
                resolvedLocale,
                fallbackLocale
            ).trim();
            const itemSlug = pickLocalized(
                item.slug,
                resolvedLocale,
                fallbackLocale
            );
            return {
                id: item.id,
                title: itemTitle,
                image:
                    item.coverUrl ||
                    fallbackImages[index % fallbackImages.length],
                views: formatViews(item.views ?? 0, resolvedLocale),
                date: formatDate(item.publishedAt ?? item.createdAt, resolvedLocale),
                duration: item.duration ?? "",
                slug: itemSlug || "#",
            };
        })
        .filter((item) => item.title.trim().length > 0);

    const relatedCategoryId =
        video.categoryId || video.categoryIds?.[0] || null;
    const similarSource = relatedCategoryId
        ? (await getPublishedVideos({
              categoryId: relatedCategoryId,
              limit: 8,
              locale: resolvedLocale,
              fallbackLocale,
          })).filter(
              (item) =>
                  hasLocalizedTitle(item) &&
                  (item.categoryId === relatedCategoryId ||
                      item.categoryIds?.includes(relatedCategoryId)),
          )
        : [];

    const similarItems = similarSource
        .filter((item) => item.id !== video.id)
        .slice(0, 4)
        .map((item, index) => {
            const itemTitle = pickLocalizedExact(
                item.title,
                resolvedLocale,
                fallbackLocale
            ).trim();
            const itemSlug = pickLocalized(
                item.slug,
                resolvedLocale,
                fallbackLocale
            );
            return {
                id: item.id,
                title: itemTitle,
                image:
                    item.coverUrl ||
                    fallbackImages[(index + 1) % fallbackImages.length],
                views: formatViews(item.views ?? 0, resolvedLocale),
                date: formatDate(item.publishedAt ?? item.createdAt, resolvedLocale),
                category: relatedCategoryId
                    ? categoryMap.get(relatedCategoryId) || ""
                    : item.categoryId
                      ? categoryMap.get(item.categoryId) || ""
                      : item.categoryIds?.length
                        ? categoryMap.get(item.categoryIds[0]) || ""
                        : "",
                duration: item.duration ?? "",
                slug: itemSlug || "#",
                type: item.type ?? "video",
            };
        })
        .filter((item) => item.title.trim().length > 0);

    const shareLabel = dict?.news?.shareNews ?? "Share";
    const relatedLabel = dict?.news?.relatedNews ?? "Related videos";

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
                                    {youtubeEmbed ? (
                                        <iframe
                                            src={youtubeEmbed}
                                            title={title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : sources.length > 0 ? (
                                        <VideoPlayer
                                            title={title}
                                            poster={video.coverUrl || undefined}
                                            sources={sources}
                                        />
                                    ) : (
                                        <Image
                                            src={
                                                video.coverUrl ||
                                                fallbackImages[0]
                                            }
                                            alt={title}
                                            width={800}
                                            height={450}
                                        />
                                    )}
                                </div>
                                <div className="news_header">
                                    <h1 className="news_hd">{title}</h1>
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
                                        {shareLabel}
                                    </a>
                                </div>
                            </div>

                            <div className="detail_content_card">
                                <div className="news_inner_items">
                                    <div className="detail_container">
                                        <div className="sect_body">
                                            {descriptionHtml ? (
                                                <div
                                                    className="nw_in_text clearfix"
                                                    data-detail-container="true"
                                                    dangerouslySetInnerHTML={{
                                                        __html: descriptionHtml,
                                                    }}
                                                />
                                            ) : (
                                                <div className="nw_in_text clearfix">
                                                    <p>
                                                        {dict?.common?.noResults ||
                                                            "No description"}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <ShareBar
                                items={shareItems}
                                shareLabel={shareLabel}
                            />

                            <div className="vide_tag_section">
                                <div className="vide_tag_title">Tags:</div>

                                <div className="vide_tag_list">
                                    {tagItems.length ? (
                                        tagItems.map((tag) => (
                                            <Link
                                                key={tag}
                                                href="#"
                                                className="vide_tag_item"
                                            >
                                                #{tag}
                                            </Link>
                                        ))
                                    ) : (
                                        <span className="vide_tag_item muted">
                                            No tags
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="wrap_right">
                            <section className="card video-card">
                                <div className="video-card__header">
                                    <div className="section-label">
                                        <span className="">Latest</span>
                                        <span className="accent">Videos</span>
                                    </div>
                                    <Link
                                        className="link-more"
                                        href={categoryBasePath}
                                    >
                                        {dict?.navigation?.more || "More"}
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
                                                {item.duration ? (
                                                    <span className="duration">
                                                        {item.duration}
                                                    </span>
                                                ) : null}
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
                            <div className="sect_title">{relatedLabel}</div>
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
