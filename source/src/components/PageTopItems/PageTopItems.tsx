import Link from "next/link";
import Image from "next/image";
import styles from "./PageTopItems.module.css";
import { getSiteSettings } from "@/lib/data/settings.data";

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

export default async function PageTopItems() {
    const settings = await getSiteSettings();
    const socialLinks = [
        {
            id: "facebook",
            label: "Facebook",
            url: settings.social?.facebook,
            light: "/assets/icons/icon_facebook_light.svg",
            dark: "/assets/icons/icon_facebook.svg",
        },
        {
            id: "instagram",
            label: "Instagram",
            url: settings.social?.instagram,
            light: "/assets/icons/icon_instagram_light.svg",
            dark: "/assets/icons/icon_instagram.svg",
        },
        {
            id: "youtube",
            label: "Youtube",
            url: settings.social?.youtube,
            light: "/assets/icons/icon_ytb_light.svg",
            dark: "/assets/icons/icon_ytb.svg",
        },
        {
            id: "telegram",
            label: "Telegram",
            url: settings.social?.telegram,
            light: "/assets/icons/icon_telegram_light.svg",
            dark: "/assets/icons/icon_telegram.svg",
        },
        {
            id: "tiktok",
            label: "Tiktok",
            url: settings.social?.tiktok,
            light: "/assets/icons/icon_tiktok_light.svg",
            dark: "/assets/icons/icon_tiktok.svg",
        },
    ]
        .filter((item) => item.url && item.url.trim().length > 0)
        .map((item) => ({
            ...item,
            url: item.url!.trim(),
        }));
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
                        {socialLinks.map((item) => (
                            <li key={item.id}>
                                <Link
                                    href={item.url as string}
                                    className={styles.socialIcon}
                                    target="_blank"
                                    rel="noreferrer"
                                >
                                    <span className={styles.sclIcon}>
                                        <Image
                                            className={styles.logoLight}
                                            src={item.light}
                                            width={16}
                                            height={16}
                                            alt={item.label}
                                        />
                                        <Image
                                            className={styles.logoDark}
                                            src={item.dark}
                                            width={16}
                                            height={16}
                                            alt={item.label}
                                        />
                                    </span>
                                    <span className={styles.sclName}>
                                        {item.label}
                                    </span>
                                </Link>
                            </li>
                        ))}
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
