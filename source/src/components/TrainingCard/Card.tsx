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
    subtitle: string;
    description?: string;
    image: string;
    slug: string;
    locale?: string;
    titleAs?: ElementType;
};

/* ================= COMPONENT ================= */

export default function NewsCard({
    title,
    subtitle,
    description,
    image,
    slug,
    locale = "az",
    titleAs: TitleTag = "p",
}: NewsCardProps) {
    // const categorySlug = typeof category === "object" ? category.slug : "news";

    // const categoryName =
    //     typeof category === "object" ? category.name : category;

    // const href = `/${locale}/category/${categorySlug}/${slug}`;

    return (
        <Link
            href={`/${locale}/trainings/${slug}`}
            className={styles.news_card}
        >
            {/* IMAGE */}
            <div className={styles.news_card_image_sect}>
                <div className={styles.news_card_image}>
                    <Image
                        src={image}
                        alt={title || "Services image"}
                        width={316}
                        height={398}
                    />
                </div>
                <div className={styles.news_card_image_content}>
                    {/* TITLE */}
                    {title && (
                        <TitleTag className={styles.news_card_title}>
                            {title}
                        </TitleTag>
                    )}
                    {/* subtitle */}
                    {subtitle && (
                        <TitleTag className={styles.news_card_subtitle}>
                            {subtitle}
                        </TitleTag>
                    )}
                </div>
            </div>

            {/* CONTENT */}
            <div className={styles.news_card_content}>
                {/* DESCRIPTION (istəsən aktivləşdir) */}
                {description && (
                    <p className={styles.news_card_description}>
                        {description}
                    </p>
                )}
            </div>
        </Link>
    );
}
