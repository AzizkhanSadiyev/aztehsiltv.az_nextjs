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
                            <a
                                href=""
                                className={styles.socialIcon}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className={styles.sclIcon}>
                                    <img
                                        className={styles.logoLight}
                                        src="/assets/icons/icon_facebook_light.svg"
                                        alt="facebook"
                                    />
                                    <img
                                        className={styles.logoDark}
                                        src="/assets/icons/icon_facebook.svg"
                                        alt="facebook"
                                    />
                                </span>
                                <span className={styles.sclName}>
                                    Facebook
                                </span>
                            </a>
                        </li>
                        <li>
                            <a
                                href=""
                                className={styles.socialIcon}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className={styles.sclIcon}>
                                    <img
                                        className={styles.logoLight}
                                        src="/assets/icons/icon_instagram_light.svg"
                                        alt="instagram"
                                    />
                                    <img
                                        className={styles.logoDark}
                                        src="/assets/icons/icon_instagram.svg"
                                        alt="instagram"
                                    />
                                </span>
                                <span className={styles.sclName}>
                                    Instagram
                                </span>
                            </a>
                        </li>
                        <li>
                            <a
                                href=""
                                className={styles.socialIcon}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className={styles.sclIcon}>
                                    <img
                                        className={styles.logoLight}
                                        src="/assets/icons/icon_ytb_light.svg"
                                        alt="youtube"
                                    />
                                    <img
                                        className={styles.logoDark}
                                        src="/assets/icons/icon_ytb.svg"
                                        alt="youtube"
                                    />
                                </span>
                                <span className={styles.sclName}>Youtube</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href=""
                                className={styles.socialIcon}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className={styles.sclIcon}>
                                    <img
                                        className={styles.logoLight}
                                        src="/assets/icons/icon_telegram_light.svg"
                                        alt="telegram"
                                    />
                                    <img
                                        className={styles.logoDark}
                                        src="/assets/icons/icon_telegram.svg"
                                        alt="telegram"
                                    />
                                </span>
                                <span className={styles.sclName}>Telegram</span>
                            </a>
                        </li>
                        <li>
                            <a
                                href=""
                                className={styles.socialIcon}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className={styles.sclIcon}>
                                    <img
                                        className={styles.logoLight}
                                        src="/assets/icons/icon_tiktok_light.svg"
                                        alt="tiktok"
                                    />
                                    <img
                                        className={styles.logoDark}
                                        src="/assets/icons/icon_tiktok.svg"
                                        alt="tiktok"
                                    />
                                </span>
                                <span className={styles.sclName}>Tiktok</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>

            <div className={cx(styles.mobileWrap, "mobile")}>
                <div className={styles.weatherCurrency}>
                    <div className={styles.weather}>
                        <span className={styles.weatherInfo}>25°</span>
                        <span className={styles.weatherIcon}>
                            <img
                                src="/assets/icons/weather_rainy_night.svg"
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
