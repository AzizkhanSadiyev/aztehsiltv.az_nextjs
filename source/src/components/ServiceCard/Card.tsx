"use client";

import Image from "next/image";
import Link from "next/link";
import type { ElementType } from "react";
import styles from "./card.module.css";

/* ================= TYPES ================= */

type NewsCardCategory = {
    name: string;
    slug: string;
};

type NewsCardProps = {
    title: string;
    description?: string;
    image: string;
    slug: string;
    more: string;
    locale?: string;
    titleAs?: ElementType;
};

/* ================= COMPONENT ================= */

export default function NewsCard({
    title,
    description,
    image,
    slug,
    more,
    locale = "az",
    titleAs: TitleTag = "p",
}: NewsCardProps) {
    // const categorySlug = typeof category === "object" ? category.slug : "news";

    // const categoryName =
    //     typeof category === "object" ? category.name : category;

    // const href = `/${locale}/category/${categorySlug}/${slug}`;

    return (
        <div className={styles.news_card}>
            {/* IMAGE */}
            <div className={styles.news_card_image}>
                <Image
                    src={image}
                    alt={title || "Services image"}
                    width={316}
                    height={398}
                />
            </div>

            {/* CONTENT */}
            <div className={styles.news_card_content}>
                {/* TITLE */}
                {title && (
                    <TitleTag className={styles.news_card_title}>
                        {title}
                    </TitleTag>
                )}

                {/* DESCRIPTION (istəsən aktivləşdir) */}
                {description && (
                    <p className={styles.news_card_description}>
                        {description}
                    </p>
                )}
                {/* DESCRIPTION (istəsən aktivləşdir) */}
                {more && (
                    <Link
                        href={`/${locale}/services/${slug}`}
                        className={styles.news_card_more}
                    >
                        {more}
                    </Link>
                )}
            </div>
        </div>
    );
}
