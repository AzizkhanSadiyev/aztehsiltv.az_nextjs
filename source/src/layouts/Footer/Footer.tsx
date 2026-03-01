
import Link from "next/link";
import Image from "next/image";

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
                                        <Image
                                            src="/assets/icons/logo_dark.svg"
                                            alt="AzTehsilTV"
                                            width={154}
                                            height={32}
                                        />
                                    </div>
                                </Link>
                            </div>
                            <ul className={styles.desk_little_menu}>
                                <li>
                                    <Link href="#">Haqqımızda </Link>
                                </li>
                                <li>
                                    <Link href="#">Press-relizlər </Link>
                                </li>
                                <li>
                                    <Link href="#">Saytda reklam </Link>
                                </li>
                                <li>
                                    <Link href="#">Əlaqə </Link>
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
                                    <Link
                                        href=""
                                        className={styles.social_icon}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <span className={styles.scl_icn}>
                                            <Image
                                                src="/assets/icons/icon_facebook.svg"
                                                alt="facebook"
                                                width={16}
                                                height={16}
                                            />
                                        </span>
                                        <span className={styles.scl_name}>
                                            Facebook
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href=""
                                        className={styles.social_icon}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <span className={styles.scl_icn}>
                                            <Image
                                                src="/assets/icons/icon_instagram.svg"
                                                alt="instagram"
                                                width={16}
                                                height={16}
                                            />
                                        </span>
                                        <span className={styles.scl_name}>
                                            Instagram
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href=""
                                        className={styles.social_icon}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <span className={styles.scl_icn}>
                                            <Image
                                                src="/assets/icons/icon_ytb.svg"
                                                alt="youtube"
                                                width={16}
                                                height={16}
                                            />
                                        </span>
                                        <span className={styles.scl_name}>
                                            Youtube
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href=""
                                        className={styles.social_icon}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <span className={styles.scl_icn}>
                                            <Image
                                                src="/assets/icons/icon_telegram.svg"
                                                alt="telegram"
                                                width={16}
                                                height={16}
                                            />
                                        </span>
                                        <span className={styles.scl_name}>
                                            Telegram
                                        </span>
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href=""
                                        className={styles.social_icon}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <span className={styles.scl_icn}>
                                            <Image
                                                src="/assets/icons/icon_tiktok.svg"
                                                alt="tiktok"
                                                width={16}
                                                height={16}
                                            />
                                        </span>
                                        <span className={styles.scl_name}>
                                            Tiktok
                                        </span>
                                    </Link>
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
                        <Link href="https://coresoft.az/" target="_blank" className={styles["footer-powered"]}>
                            <span>Powered by:</span>
                            <Image
                                src="/assets/icons/coresoft.svg"
                                alt="Coresoft"
                                width={78}
                                height={24}
                            />
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
