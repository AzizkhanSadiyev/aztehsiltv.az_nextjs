"use client";
import Link from "next/link";
import Image from "next/image";

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
    return (
        <div className={styles.card_item}>
            <Link href={slug} className={styles.card_item_link}>
                <div className={styles.explore_item}>
                    <TitleTag className={styles.explore_title}>
                        {title}
                    </TitleTag>
                </div>
            </Link>
        </div>
    );
}




