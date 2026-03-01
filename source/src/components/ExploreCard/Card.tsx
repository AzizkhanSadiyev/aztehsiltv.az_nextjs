"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { ElementType } from "react";
import styles from "./card.module.css";

/* ================= TYPES ================= */

type ExploreCardProps = {
    title: string;
    slug?: string;
    titleAs?: ElementType;
};

/* ================= COMPONENT ================= */

export default function ExploreCard({
    title,
    slug = "#",
    titleAs: TitleTag = "span",
}: ExploreCardProps) {
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

    return (
        <div className={styles.card_item}>
            <Link href={resolvedHref} className={styles.card_item_link}>
                <div className={styles.explore_item}>
                    <TitleTag className={styles.explore_title}>
                        {title}
                    </TitleTag>
                </div>
            </Link>
        </div>
    );
}



