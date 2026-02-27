"use client";

import type { ElementType } from "react";
import styles from "./card.module.css";

/* ================= TYPES ================= */

type BroadcastCardProps = {
    title: string;
    count: string;
    image: string;
    href?: string;
    titleAs?: ElementType;
};

/* ================= COMPONENT ================= */

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

export default function BroadcastCard({
    title,
    count,
    image,
    href = "#",
    titleAs: TitleTag = "span",
}: BroadcastCardProps) {
    return (
        <div className={styles.card_item}>
            <a href={href} className={styles.card_item_link}>
                <div className={styles.board_item}>
                    <div className={styles.item_img}>
                        <img src={image} alt={title} />
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
            </a>
        </div>
    );
}




