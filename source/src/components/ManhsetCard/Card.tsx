"use client";
import Link from "next/link";
import Image from "next/image";
import type { ElementType } from "react";
import { useParams } from "next/navigation";
import styles from "./card.module.css";

/* ================= TYPES ================= */

type ManshetItemProps = {
    title?: string;
    image?: string;
    slug?: string;
    views?: string;
    date?: string;
    category?: string;
    duration?: string;
    type?: "video" | "list";
    titleAs?: ElementType;
    loading?: boolean;
    variant?: "default" | "short";
};

/* ================= COMPONENT ================= */

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

export default function ManshetItem({
    title = "Konqres kend mektebleri ucun fondu yeniden berpa etdi",
    image = "/assets/images/card_1.png",
    slug = "#",
    views = "1.2 M baxis",
    date = "28 Dek 2026",
    category = "Imtahan",
    type = "video",
    titleAs: TitleTag = "div",
    loading = false,
    variant = "default",
}: ManshetItemProps) {
    const params = useParams<{ locale?: string | string[] }>();
    const localeParam =
        typeof params?.locale === "string"
            ? params.locale
            : Array.isArray(params?.locale)
              ? params.locale[0]
              : undefined;
    const resolvedHref = (() => {
        if (!slug || slug === "#") {
            return "#";
        }

        const slugValue = slug.trim();
        if (
            slugValue.startsWith("/") ||
            slugValue.startsWith("http://") ||
            slugValue.startsWith("https://") ||
            slugValue.startsWith("#")
        ) {
            return slugValue;
        }

        if (localeParam) {
            return `/${localeParam}/categories/${slugValue}`;
        }

        return `/categories/${slugValue}`;
    })();

    if (loading) {
        return (
            <div
                className={cx(styles.card_item, styles.isLoading)}
                aria-busy="true"
            >
                <Link href="#" className={styles.card_item_link}>
                    <div className={styles.item_img}>
                        <div className={styles.skeletonMedia}></div>
                    </div>
                    <div className={styles.item_content}>
                        <div
                            className={cx(
                                styles.catg_date_row,
                                styles.skeletonMetaRow,
                            )}
                        >
                            <div className={styles.skeletonTag}></div>
                            <div className={styles.skeletonDates}>
                                <div className={styles.skeletonLine}></div>
                                <div className={styles.skeletonLine}></div>
                            </div>
                        </div>
                        <div className={styles.skeletonTitle}></div>
                        <div
                            className={cx(
                                styles.skeletonTitle,
                                styles.skeletonTitleSmall,
                            )}
                        ></div>
                    </div>
                </Link>
            </div>
        );
    }

    return (
        <div
            className={cx(
                styles.card_item,
                variant === "short" && styles.shortCard,
            )}
        >
            <Link href={resolvedHref} className={styles.card_item_link}>
                <div className={styles.item_img}>
                    <Image src={image} alt={title} width={306} height={172} />
                </div>
                <div className={styles.item_content}>
                    <div className={styles.catg_date_row}>
                        {category ? (
                            <div className={styles.item_catg}>{category}</div>
                        ) : null}
                        {(views || date) && (
                            <div className={styles.date_time_itm}>
                                {views ? (
                                    <div className={styles.item_date}>
                                        {views}
                                    </div>
                                ) : null}
                                {date ? (
                                    <div className={styles.item_date}>
                                        {date}
                                    </div>
                                ) : null}
                            </div>
                        )}
                    </div>
                    <TitleTag className={styles.item_title}>{title}</TitleTag>
                    {type === "video" ? (
                        <div
                            className={cx(
                                "btn_item btn_video primary",
                                styles.action_button,
                            )}
                        >
                            <span className="btn_icon">Videonu izle</span>
                        </div>
                    ) : null}
                </div>
            </Link>
        </div>
    );
}
