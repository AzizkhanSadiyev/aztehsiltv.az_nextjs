import Link from "next/link";
import Image from "next/image";
import styles from "./PageTopItems.module.css";

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

export default function PageTopItems() {
    return (
        <div className={styles.topItems}>
            <div className="desktop">
                <div
                    className={cx(
                        styles.socialsSection,
                        "margin_top_12",
                        "margin_bottom_18"
                    )}
                >
                    <div className={styles.socialTitle}>
                        Bizi <span>sosial şəbəkələrdən</span> izləyin:
                    </div>
                    <ul className={styles.socials}>
                        <li>
                            <Link
                                href=""
                                className={styles.socialIcon}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className={styles.sclIcon}>
                                    <Image
                                        className={styles.logoLight}
                                        src="/assets/icons/icon_facebook_light.svg"
                                        width={16}
                                        height={16}
                                        alt="facebook"
                                    />
                                    <Image
                                        className={styles.logoDark}
                                        src="/assets/icons/icon_facebook.svg"
                                        width={16}
                                        height={16}
                                        alt="facebook"
                                    />
                                </span>
                                <span className={styles.sclName}>
                                    Facebook
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href=""
                                className={styles.socialIcon}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className={styles.sclIcon}>
                                    <Image
                                        className={styles.logoLight}
                                        src="/assets/icons/icon_instagram_light.svg"
                                        width={16}
                                        height={16}
                                        alt="instagram"
                                    />
                                    <Image
                                        className={styles.logoDark}
                                        src="/assets/icons/icon_instagram.svg"
                                        width={16}
                                        height={16}
                                        alt="instagram"
                                    />
                                </span>
                                <span className={styles.sclName}>
                                    Instagram
                                </span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href=""
                                className={styles.socialIcon}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className={styles.sclIcon}>
                                    <Image
                                        className={styles.logoLight}
                                        src="/assets/icons/icon_ytb_light.svg"
                                        width={16}
                                        height={16}
                                        alt="youtube"
                                    />
                                    <Image
                                        className={styles.logoDark}
                                        src="/assets/icons/icon_ytb.svg"
                                        width={16}
                                        height={16}
                                        alt="youtube"
                                    />
                                </span>
                                <span className={styles.sclName}>Youtube</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href=""
                                className={styles.socialIcon}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className={styles.sclIcon}>
                                    <Image
                                        className={styles.logoLight}
                                        src="/assets/icons/icon_telegram_light.svg"
                                        width={16}
                                        height={16}
                                        alt="telegram"
                                    />
                                    <Image
                                        className={styles.logoDark}
                                        src="/assets/icons/icon_telegram.svg"
                                        width={16}
                                        height={16}
                                        alt="telegram"
                                    />
                                </span>
                                <span className={styles.sclName}>Telegram</span>
                            </Link>
                        </li>
                        <li>
                            <Link
                                href=""
                                className={styles.socialIcon}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className={styles.sclIcon}>
                                    <Image
                                        className={styles.logoLight}
                                        src="/assets/icons/icon_tiktok_light.svg"
                                        width={16}
                                        height={16}
                                        alt="tiktok"
                                    />
                                    <Image
                                        className={styles.logoDark}
                                        src="/assets/icons/icon_tiktok.svg"
                                        width={16}
                                        height={16}
                                        alt="tiktok"
                                    />
                                </span>
                                <span className={styles.sclName}>Tiktok</span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className={cx(styles.mobileWrap, "mobile")}>
                <div className={styles.weatherCurrency}>
                    <div className={styles.weather}>
                        <span className={styles.weatherInfo}>25°</span>
                        <span className={styles.weatherIcon}>
                            <Image
                                src="/assets/icons/weather_rainy_night.svg"
                                width={32}
                                height={32}
                                alt="Weather"
                            />
                        </span>
                        <span className={styles.weatherLoc}>Baku</span>
                    </div>
                    <div className={styles.currencyItem}>
                        <div className={styles.currencyContent}>
                            <select
                                name="currency_type"
                                id="currency_select"
                                className={styles.currencySelect}
                            >
                                <option value="USD">USD</option>
                                <option value="EUR">EUR</option>
                                <option value="RUB">RUB</option>
                            </select>
                            <span className={styles.currencyInfo}>
                                (%0.47)
                            </span>
                        </div>
                        <span className={styles.currencyValue}>1.7000</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
