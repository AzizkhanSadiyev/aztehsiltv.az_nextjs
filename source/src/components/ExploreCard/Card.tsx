"use client";

import type { ElementType } from "react";
import styles from "./card.module.css";

/* ================= TYPES ================= */

type ExploreCardProps = {
    title: string;
    href?: string;
    titleAs?: ElementType;
};

/* ================= COMPONENT ================= */

export default function ExploreCard({
    title,
    href = "#",
    titleAs: TitleTag = "span",
}: ExploreCardProps) {
    return (
        <div className={styles.card_item}>
            <a href={href} className={styles.card_item_link}>
                <div className={styles.explore_item}>
                    <TitleTag className={styles.explore_title}>
                        {title}
                    </TitleTag>
                </div>
            </a>
        </div>
    );
}




