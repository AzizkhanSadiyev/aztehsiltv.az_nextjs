import Link from "next/link";
import styles from "./footer.module.css";

interface Dictionary {
    navigation: {
        home: string;
        categories: string;
        contact: string;
        about: string;
        privacy: string;
        terms: string;
    };
}

interface FooterProps {
    locale: string;
    dict: Dictionary;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

export default function Footer({ locale: _locale, dict: _dict }: FooterProps) {
    return (
        <footer className={styles["site-footer"]} id="footer">
            <div className="main_center">
                <div className={cx(styles.footer_main, "width_full_mob")}>
                    <div className={styles["site-footer__top"]}>
                        <div className={styles["middle-grid"]}>
                            <div className={styles["footer-brand"]}>
                                <Link href="/" className={styles["footer-logo"]}>
                                    <div className={styles.logo_img}>
                                        <img
                                            src="/assets/icons/logo_dark.svg"
                                            alt="AzTehsilTV"
                                        />
                                    </div>
                                </Link>
                            </div>
                            <ul className={styles.desk_little_menu}>
                                <li>
                                    <a href="#">Haqqımızda </a>
                                </li>
                                <li>
                                    <a href="#">Press-relizlər </a>
                                </li>
                                <li>
                                    <a href="#">Saytda reklam </a>
                                </li>
                                <li>
                                    <a href="#">Əlaqə </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className={styles["site-footer__middle"]}>
                        <div className={styles.socials_section}>
                            <div className={styles.social_title}>
                                Bizi
                                <span>sosial şəbəkələrdən</span>
                                izləyin:
                            </div>
                            <ul className={styles.socials}>
                                <li>
                                    <a
                                        href=""
                                        className={styles.social_icon}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <span className={styles.scl_icn}>
                                            <img
                                                src="/assets/icons/icon_facebook.svg"
                                                alt="facebook"
                                            />
                                        </span>
                                        <span className={styles.scl_name}>
                                            Facebook
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href=""
                                        className={styles.social_icon}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <span className={styles.scl_icn}>
                                            <img
                                                src="/assets/icons/icon_instagram.svg"
                                                alt="instagram"
                                            />
                                        </span>
                                        <span className={styles.scl_name}>
                                            Instagram
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href=""
                                        className={styles.social_icon}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <span className={styles.scl_icn}>
                                            <img
                                                src="/assets/icons/icon_ytb.svg"
                                                alt="youtube"
                                            />
                                        </span>
                                        <span className={styles.scl_name}>
                                            Youtube
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href=""
                                        className={styles.social_icon}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <span className={styles.scl_icn}>
                                            <img
                                                src="/assets/icons/icon_telegram.svg"
                                                alt="telegram"
                                            />
                                        </span>
                                        <span className={styles.scl_name}>
                                            Telegram
                                        </span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        href=""
                                        className={styles.social_icon}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <span className={styles.scl_icn}>
                                            <img
                                                src="/assets/icons/icon_tiktok.svg"
                                                alt="tiktok"
                                            />
                                        </span>
                                        <span className={styles.scl_name}>
                                            Tiktok
                                        </span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className={styles["footer-bottom"]}>
                        <p className={styles["footer-copy"]}>
                            © 2018 - 2026 AztəhsilTV.az Müəllif hüquqları
                            qorunur. Məlumatdan istifadə edərkən hiperlinklə
                            istinad olunmalıdır.
                        </p>
                        <div className={styles["footer-powered"]}>
                            <span>Powered by:</span>
                            <img
                                src="/assets/icons/coresoft.svg"
                                alt="Coresoft"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
