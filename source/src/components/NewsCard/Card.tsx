"use client";

import type { ElementType } from "react";
import styles from "./card.module.css";

/* ================= TYPES ================= */

type NewsCardProps = {
    title?: string;
    image?: string;
    href?: string;
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

export default function NewsCard({
    title = "Konqres kend mektebleri ucun fondu yeniden berpa etdi",
    image = "/assets/images/card_1.png",
    href = "#",
    views = "1.2 M baxis",
    date = "28 Dek 2026",
    category = "Imtahan",
    duration = "00:35",
    type = "video",
    titleAs: TitleTag = "h6",
    loading = false,
    variant = "default",
}: NewsCardProps) {
    if (loading) {
        return (
            <div
                className={cx(styles.card_item, styles.isLoading)}
                aria-busy="true"
            >
                <div className={styles.card_item_link}>
                    <div className={styles.item_img}>
                        <div className={styles.skeletonMedia}></div>
                    </div>
                    <div className={styles.item_content}>
                        <div className={styles.skeletonTitle}></div>
                        <div
                            className={cx(
                                styles.skeletonTitle,
                                styles.skeletonTitleSmall
                            )}
                        ></div>
                        <div
                            className={cx(
                                styles.catg_date_row,
                                styles.pad_left_48,
                                styles.skeletonMetaRow
                            )}
                        >
                            <div className={styles.skeletonIcon}></div>
                            <div className={styles.skeletonDates}>
                                <div className={styles.skeletonLine}></div>
                                <div className={styles.skeletonLine}></div>
                            </div>
                            <div className={styles.skeletonTag}></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cx(
                styles.card_item,
                variant === "short" && styles.shortCard
            )}
        >
            <a href={href} className={styles.card_item_link}>
                <div className={styles.item_img}>
                    <img src={image} alt={title} />
                    {duration ? (
                        <div className={styles.video_timer}>{duration}</div>
                    ) : null}
                </div>
                <div className={styles.item_content}>
                    <TitleTag className={styles.item_title}>{title}</TitleTag>
                    <div
                        className={cx(styles.catg_date_row, styles.pad_left_48)}
                    >
                        <div
                            className={cx(
                                styles.card_type_icon,
                                type === "list"
                                    ? styles.list_type
                                    : styles.video_type
                            )}
                        ></div>
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
                        {category ? (
                            <div className={styles.item_catg}>
                                {category}
                            </div>
                        ) : null}
                    </div>
                </div>
            </a>
        </div>
    );
}




