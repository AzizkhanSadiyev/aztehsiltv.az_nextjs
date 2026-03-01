"use client";

import type { ElementType } from "react";
import styles from "./card.module.css";
import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";
/* ================= TYPES ================= */

type BroadcastCardProps = {
    title: string;
    count: string;
    image: string;
    slug?: string;
    titleAs?: ElementType;
};

/* ================= COMPONENT ================= */

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

export default function BroadcastCard({
    title,
    count,
    image,
    slug = "#",
    titleAs: TitleTag = "span",
}: BroadcastCardProps) {
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
            return `/${localeParam}/broadcasts/${slugValue}`;
        }

        return `/broadcasts/${slugValue}`;
    })();

    return (
        <div className={styles.card_item}>
            <Link href={resolvedHref} className={styles.card_item_link}>
                <div className={styles.board_item}>
                    <div className={styles.item_img}>
                        <Image src={image}  width={306} height={172} alt={title}/>
                    </div>
                </div>
                <div className={styles.item_content}>
                    <div
                        className={cx(styles.catg_date_row, styles.pad_left_48)}
                    >
                        <div
                            className={cx(
                                styles.card_type_icon,
                                styles.list_type
                            )}
                        ></div>
                        <TitleTag
                            className={cx(styles.item_catg, styles.bold_catg)}
                        >
                            {title}
                        </TitleTag>
                        <div className={styles.date_time_itm}>
                            <div className={styles.item_date}>{count}</div>
                        </div>
                    </div>
                </div>
            </Link>
        </div>
    );
}



