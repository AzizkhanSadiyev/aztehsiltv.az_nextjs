import Link from "next/link";
import styles from "./top.module.css";

type TopVideoProps = {
    href?: string;
    cover?: string;
    badgeIcon?: string;
    badgeText?: string;
    title?: string;
    category?: string;
    views?: string;
    date?: string;
};

export default function TopVideo({
    href = "#",
    cover = "/assets/images/top_video_cover.png",
    badgeIcon = "/assets/icons/icon_fire.svg",
    badgeText = "Gunun videosu",
    title = "Ayova shtatinin kechmish rehberi ABS vetendashligini saxta shekilde iddia etmekde gunahini etiraf etdi",
    category = "Tehsil",
    views = "1.2 M baxis",
    date = "28 Dek 2026",
}: TopVideoProps) {
    const cx = (...classes: Array<string | false | null | undefined>) =>
        classes.filter(Boolean).join(" ");

    return (
        <section
            className={cx(styles.top_video_sect, "pad_bottom_20", "pad_top_20")}
        >
            <Link href={href} className={styles.top_video__wrap}>
                <div className={styles.top_video__media}>
                    <img src={cover} alt="Top video cover" />
                    <span
                        className={styles.play_white}
                        aria-hidden="true"
                    ></span>
                </div>

                <div className={styles.top_video__info}>
                    <span className={styles.top_video__badge}>
                        <img src={badgeIcon} alt="" aria-hidden="true" />
                        <span>{badgeText}</span>
                    </span>

                    <h2 className={styles.top_video__title}>{title}</h2>

                    <div className={styles.top_video__meta}>
                        <span>{category}</span>
                        <span>{views}</span>
                        <span className={styles.dot}></span>
                        <span>{date}</span>
                    </div>
                </div>
            </Link>
        </section>
    );
}
