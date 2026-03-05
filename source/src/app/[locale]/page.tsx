import { type Locale, defaultLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import Link from "next/link";
import Image from "next/image";

import NewsCard from "@/components/NewsCard/Card";
import SliderShort, { type ShortItem } from "@/components/SliderShort/slider";
import SliderManhet, {
    type ManshetItem,
} from "@/components/SliderManshet/slider";
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
import { getPublishedPartners } from "@/lib/data/partners.data";
import { getActiveCategories } from "@/lib/data/categories.data";
import { pickLocalized, pickLocalizedExact } from "@/lib/localization";
import {
    getPublishedVideos,
    getPublishedVideoCountsByCategory,
} from "@/lib/data/videos.data";
import type { Video } from "@/types/video.types";

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const resolvedLocale = (locale || defaultLocale) as Locale;
    const categoryBasePath = `/${resolvedLocale}/categories`;

    const dict = await getDictionary(resolvedLocale);
    const homeDict = dict?.home ?? {};

    const categories = await getActiveCategories();
    const partners = await getPublishedPartners();
    const counts = await getPublishedVideoCountsByCategory({
        locale: resolvedLocale,
        fallbackLocale: defaultLocale,
    });

    const fallbackImages = [
        "/assets/images/card_1.png",
        "/assets/images/card_2.png",
        "/assets/images/card_3.png",
        "/assets/images/card_4.png",
    ];

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

    const activeCategories = categories.filter(
        (category) => category.isActive !== false,
    );
    const categoryById = new Map(
        activeCategories.map((category) => [category.id, category]),
    );

    const getLocalizedCategoryName = (category: (typeof activeCategories)[number]) =>
        pickLocalizedExact(category.name, resolvedLocale, defaultLocale).trim();

    const getCategoryLabel = (id?: string | null) => {
        if (!id) return "";
        const category = categoryById.get(id);
        if (!category) return "";
        return getLocalizedCategoryName(category);
    };

    const getVideoTitle = (video: Video) =>
        pickLocalizedExact(video.title, resolvedLocale, defaultLocale).trim();

    const getVideoSlug = (video: Video) =>
        pickLocalized(video.slug, resolvedLocale, defaultLocale);

    const hasLocalizedTitle = (video: Video) =>
        getVideoTitle(video).length > 0;

    const getVideoCategoryId = (video: Video) =>
        video.categoryId ?? video.categoryIds?.[0] ?? null;

    const findCategory = (slugCandidates: string[], nameCandidates: string[]) =>
        activeCategories.find((category) => {
            if (slugCandidates.includes(category.slug)) return true;
            const label = getLocalizedCategoryName(category);
            return nameCandidates.some(
                (name) => normalizeKey(label) === normalizeKey(name),
            );
        });

    const getSectionTitle = (
        category: (typeof activeCategories)[number] | undefined | null,
    ) => {
        if (!category) return "";
        return getLocalizedCategoryName(category);
    };

    const exploreParent = findCategory(
        ["kesf-et", "keshf-et", "kashf-et", "explore", "discover"],
        ["Kəşf et", "Kesf et", "Kashf et", "Explore", "Discover"],
    );
    const broadcastParent = findCategory(
        ["verilisler", "verilislar", "broadcasts", "broadcast"],
        ["Verilişlər", "Verilisler", "Broadcasts"],
    );

    const exploreChildren = exploreParent
        ? activeCategories.filter(
              (category) => category.parentId === exploreParent.id,
          )
        : [];
    const broadcastChildren = broadcastParent
        ? activeCategories.filter(
              (category) => category.parentId === broadcastParent.id,
          )
        : [];
    const localizedExploreChildren = exploreChildren.filter(
        (category) => getLocalizedCategoryName(category).trim().length > 0,
    );
    const localizedBroadcastChildren = broadcastChildren.filter(
        (category) => getLocalizedCategoryName(category).trim().length > 0,
    );

    const exploreAllLabel =
        homeDict?.allcategories?.title?.trim() ||
        (resolvedLocale === "az"
            ? "Bütün bölmələr"
            : resolvedLocale === "ru"
              ? "Все разделы"
              : "All categories");

    const exploreItems: ExploreItem[] = [
        {
            id: 0,
            title: exploreAllLabel,
            slug: categoryBasePath,
        },
        ...localizedExploreChildren
            .filter((item) => item.slug !== "butun-bolmeler")
            .slice()
            .sort((a, b) => {
                const orderDiff = (a.order ?? 0) - (b.order ?? 0);
                if (orderDiff !== 0) return orderDiff;
                const nameA = getLocalizedCategoryName(a);
                const nameB = getLocalizedCategoryName(b);
                return nameA.localeCompare(nameB);
            })
            .map((item, index) => ({
                id: index + 1,
                title: getLocalizedCategoryName(item),
                slug: `${categoryBasePath}?category=${encodeURIComponent(
                    item.slug,
                )}`,
            })),
    ];

    const videoCountLabel = resolvedLocale === "ru" ? "видео" : "video";
    const broadcastItems: BroadcastItem[] = localizedBroadcastChildren
        .slice()
        .sort((a, b) => {
            const orderDiff = (a.order ?? 0) - (b.order ?? 0);
            if (orderDiff !== 0) return orderDiff;
            const nameA = getLocalizedCategoryName(a);
            const nameB = getLocalizedCategoryName(b);
            return nameA.localeCompare(nameB);
        })
        .map((item, index) => ({
            id: index + 1,
            title: getLocalizedCategoryName(item),
            count: `${counts[item.id] ?? 0} ${videoCountLabel}`,
            image:
                item.coverUrl ||
                item.icon ||
                fallbackImages[index % fallbackImages.length],
            slug: item.slug,
        }));

    const overseasCategory = findCategory(
        ["xaricde-tehsil"],
        ["Xaricdə təhsil", "Xaricde tehsil"],
    );
    const researchCategory = findCategory(
        ["arasdirma"],
        ["Araşdırma", "Arasdirma"],
    );
    const successCategory = findCategory(
        ["ugur-hekayeleri"],
        ["Uğur hekayələri", "Ugur hekayeleri"],
    );
    const educationCategory = findCategory(
        ["tehsil-saati"],
        ["Təhsil saatı", "Tehsil saati"],
    );
    const podcastCategory = findCategory(
        ["podkast", "podcast"],
        ["Podkast", "Podcast"],
    );
    const shortCategory = findCategory(
        ["shorts", "short"],
        ["Shorts", "Short videolar", "Short videos"],
    );
    const exploreTitle = getSectionTitle(exploreParent);
    const broadcastTitle = getSectionTitle(broadcastParent);
    const overseasTitle = getSectionTitle(overseasCategory);
    const researchTitle = getSectionTitle(researchCategory);
    const successTitle = getSectionTitle(successCategory);
    const educationTitle = getSectionTitle(educationCategory);
    const podcastTitle = getSectionTitle(podcastCategory);
    const shortTitle = getSectionTitle(shortCategory) || "Shorts";
    const latestTitle =
        homeDict?.latest?.title?.trim() ||
        homeDict?.lates?.title?.trim() ||
        (resolvedLocale === "az"
            ? "Son"
            : resolvedLocale === "ru"
              ? "Последний"
              : "Latest");
    const videosTitle =
        homeDict?.videos?.title?.trim() ||
        (resolvedLocale === "az"
            ? "Videolar"
            : resolvedLocale === "ru"
              ? "Видео"
              : "Videos");
    const moreTitle =
        homeDict?.more?.title?.trim() ||
        (resolvedLocale === "az"
            ? "Daha çox"
            : resolvedLocale === "ru"
              ? "Более"
              : "More");
    const dayVideoTitle =
        homeDict?.dayvideo?.title?.trim() ||
        (resolvedLocale === "az"
            ? "Günün videosu"
            : resolvedLocale === "ru"
              ? "Видео дня"
              : "Video of the day");
    const watchTitle =
        homeDict?.watch?.title?.trim() ||
        (resolvedLocale === "az"
            ? "Videonu izle"
            : resolvedLocale === "ru"
              ? "Смотреть видео"
              : "Watch video");
    const partnersTitle =
        homeDict?.partners?.title?.trim() ||
        (resolvedLocale === "az"
            ? "Tərəfdaşlar"
            : resolvedLocale === "ru"
              ? "Партнеры"
              : "Partners");

    const listLocale = {
        locale: resolvedLocale,
        fallbackLocale: defaultLocale,
    };

    const [
        manshetVideosRaw,
        shortVideosRaw,
        sidebarVideosRaw,
        topVideosRaw,
        latestVideosRaw,
        overseasVideosRaw,
        researchVideosRaw,
        successVideosRaw,
        educationVideosRaw,
        podcastVideosRaw,
    ] = await Promise.all([
        getPublishedVideos({ flags: { isManshet: true }, limit: 200, ...listLocale }),
        shortCategory
            ? getPublishedVideos({
                  categoryId: shortCategory.id,
                  limit: 12,
                  ...listLocale,
              })
            : getPublishedVideos({ flags: { isShort: true }, limit: 12, ...listLocale }),
        getPublishedVideos({ flags: { isSidebar: true }, limit: 6, ...listLocale }),
        getPublishedVideos({ flags: { isTopVideo: true }, limit: 12, ...listLocale }),
        getPublishedVideos({ limit: 16, ...listLocale }),
        overseasCategory
            ? getPublishedVideos({
                  categoryId: overseasCategory.id,
                  limit: 12,
                  ...listLocale,
              })
            : Promise.resolve([] as Video[]),
        researchCategory
            ? getPublishedVideos({
                  categoryId: researchCategory.id,
                  limit: 12,
                  ...listLocale,
              })
            : Promise.resolve([] as Video[]),
        successCategory
            ? getPublishedVideos({
                  categoryId: successCategory.id,
                  limit: 12,
                  ...listLocale,
              })
            : Promise.resolve([] as Video[]),
        educationCategory
            ? getPublishedVideos({
                  categoryId: educationCategory.id,
                  limit: 12,
                  ...listLocale,
              })
            : Promise.resolve([] as Video[]),
        podcastCategory
            ? getPublishedVideos({
                  categoryId: podcastCategory.id,
                  limit: 12,
                  ...listLocale,
              })
            : Promise.resolve([] as Video[]),
    ]);

    const filterLocalizedVideos = (videos: Video[]) =>
        videos.filter((video) => hasLocalizedTitle(video));

    const latestVideos = filterLocalizedVideos(latestVideosRaw ?? []);
    const manshetVideos = filterLocalizedVideos(manshetVideosRaw);
    const shortVideos = filterLocalizedVideos(shortVideosRaw);
    const sidebarCandidates = filterLocalizedVideos(sidebarVideosRaw);
    const sidebarVideos = sidebarCandidates.length
        ? sidebarCandidates
        : latestVideos.slice(0, 6);
    const topVideoCandidates = filterLocalizedVideos(topVideosRaw);
    const topVideo = topVideoCandidates.length
        ? topVideoCandidates
              .slice()
              .sort((a, b) => {
                  const dateA = new Date(
                      a.updatedAt || a.publishedAt || a.createdAt,
                  ).getTime();
                  const dateB = new Date(
                      b.updatedAt || b.publishedAt || b.createdAt,
                  ).getTime();
                  return dateB - dateA;
              })[0]
        : null;

    const mapVideoToItem = (video: Video, index: number): NewsItem => {
        const categoryId = getVideoCategoryId(video);
        const slug = getVideoSlug(video);
        return {
            id: index + 1,
            title: getVideoTitle(video),
            image:
                video.coverUrl || fallbackImages[index % fallbackImages.length],
            views: formatViews(video.views),
            date: formatDate(
                video.publishedAt || video.updatedAt || video.createdAt,
            ),
            category: categoryId ? getCategoryLabel(categoryId) : "",
            duration: video.duration || undefined,
            slug: slug || "#",
            type: video.type,
        };
    };

    const manshetItems: ManshetItem[] = manshetVideos.map(mapVideoToItem);
    const shortsItems: ShortItem[] = shortVideos.map(mapVideoToItem);
    const latestItems: NewsItem[] = latestVideos.map(mapVideoToItem);
    const sidebarItems: NewsItem[] = sidebarVideos.map(mapVideoToItem);

    const overseasItems: NewsItem[] = filterLocalizedVideos(
        overseasVideosRaw,
    ).map(mapVideoToItem);
    const researchItems: NewsItem[] = filterLocalizedVideos(
        researchVideosRaw,
    ).map(mapVideoToItem);
    const successItems: NewsItem[] = filterLocalizedVideos(
        successVideosRaw,
    ).map(mapVideoToItem);
    const educationItems: NewsItem[] = filterLocalizedVideos(
        educationVideosRaw,
    ).map(mapVideoToItem);
    const podcastItems: NewsItem[] = filterLocalizedVideos(
        podcastVideosRaw,
    ).map(mapVideoToItem);

    const resolveSlug = (slug?: string) => {
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

    const topVideoProps = topVideo
        ? {
              slug: resolveSlug(getVideoSlug(topVideo)),
              cover: topVideo.coverUrl || fallbackImages[0],
              title: getVideoTitle(topVideo),
              category: getCategoryLabel(getVideoCategoryId(topVideo)),
              views: formatViews(topVideo.views),
              date: formatDate(
                  topVideo.publishedAt || topVideo.updatedAt || topVideo.createdAt,
              ),
              badgeText: dayVideoTitle,
          }
        : {};

    return (
        <>
            {/* Page top items */}
            <div className="main_center">
                <PageTopItems locale={resolvedLocale} dict={dict} />
            </div>
            {/* Page top items */}

            {/* Main slider section */}
            <div
                className="section_wrap pad_bottom_20"
                style={{ paddingBottom: "24px" }}
            >
                <div className="main_center">
                    <div className="row_item_manshet same_h_block">
                        <div className="wrap_left">
                            <SliderManhet
                                items={manshetItems}
                                slidesPerView={1}
                                watchLabel={watchTitle}
                            />
                        </div>
                        <div className="wrap_right">
                            <section className="card video-card">
                                <div className="video-card__header">
                                    <div className="section-label">
                                        <span className="">{latestTitle}</span>
                                        <span className="accent">{videosTitle}</span>
                                    </div>
                                    <Link className="link-more" href={categoryBasePath}>
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
                                <div
                                    className="video-list"
                                    style={{
                                        overflow: "auto",
                                    }}
                                >
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
            {/* Main slider section  */}

            {/* Short videolar */}
            <div className="main_center">
                <SliderShort
                    title={shortTitle}
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
                            <Link href={categoryBasePath} className="sect_title">
                                {`${latestTitle} ${videosTitle}`.trim()}
                            </Link>
                        </div>
                        <div className="sect_body">
                            <div className="row_item gap_20">
                                {latestItems.slice(0, 12).map((item) => (
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
                                href={categoryBasePath}
                                title="AztehsilTv"
                                className="more load_more_btn"
                            >
                                {moreTitle}
                            </Link>
                        </div>
                    </div>
                </section>
            </div>
            {/* section Last video  */}

            {/* Xaricdə təhsil */}
            {overseasItems.length && overseasTitle ? (
                <div className="desktop">
                    <div className="main_center">
                        <SliderNews
                            title={overseasTitle}
                            items={overseasItems}
                            slidesPerView={4}
                        />
                    </div>
                </div>
            ) : null}
            {/* Xaricdə təhsil */}

            {/* Kəşf et */}
            {exploreTitle ? (
                <div className="desktop">
                    <div className="main_center">
                        <SliderExplore
                            title={exploreTitle}
                            items={exploreItems}
                            slidesPerView={6}
                        />
                    </div>
                </div>
            ) : null}
            {/* Kəşf et */}

            {/* Araşdırma */}
            {researchItems.length && researchTitle ? (
                <div className="desktop">
                    <div className="main_center">
                        <SliderNews
                            title={researchTitle}
                            items={researchItems}
                            slidesPerView={3}
                        />
                    </div>
                </div>
            ) : null}
            {/* Araşdırma */}

            {/* Verilişlər */}
            {broadcastItems.length && broadcastTitle ? (
                <div className="desktop">
                    <div className="main_center">
                        <SliderBroadcast
                            title={broadcastTitle}
                            items={broadcastItems}
                            slidesPerView={5}
                        />
                    </div>
                </div>
            ) : null}
            {/* Verilişlər */}

            {/* Uğur hekayələri */}
            {successItems.length && successTitle ? (
                <div className="desktop">
                    <div className="main_center">
                        <SliderNews
                            title={successTitle}
                            items={successItems}
                            slidesPerView={4}
                        />
                    </div>
                </div>
            ) : null}
            {/* Uğur hekayələri */}

            {/* TopVideo */}
            {topVideo ? (
                <div className="main_center">
                    <TopVideo {...topVideoProps} />
                </div>
            ) : null}
            {/* TopVideo */}

            {/* Təhsil saatı */}
            {educationItems.length && educationTitle ? (
                <div className="desktop">
                    <div className="main_center">
                        <SliderNews
                            title={educationTitle}
                            items={educationItems}
                            slidesPerView={3}
                        />
                    </div>
                </div>
            ) : null}
            {/* Təhsil saatı */}

            {/* Podkast */}
            {podcastItems.length && podcastTitle ? (
                <div className="desktop">
                    <div className="main_center">
                        <SliderNews
                            title={podcastTitle}
                            items={podcastItems}
                            slidesPerView={4}
                        />
                    </div>
                </div>
            ) : null}
            {/* Podkast */}

            {/* Partners */}
            <div className="main_center">
                <SliderPartner
                    title={partnersTitle}
                    partners={partners.map((partner) => ({
                        id: partner.id,
                        name: partner.name,
                        slug: partner.websiteUrl || "#",
                        image: partner.logo,
                    }))}
                />
            </div>
            {/* Partners */}
        </>
    );
}
