
import Link from "next/link";
import Image from "next/image";

import styles from "./footer.module.css";
import { defaultLocale, locales } from "@/i18n/config";
import { pickLocalized } from "@/lib/localization";
import { getSiteSettings } from "@/lib/data/settings.data";
import type { SiteSettings, SettingsLink } from "@/types/settings.types";

type Dictionary = Record<string, any> & {
    navigation?: {
        home?: string;
        categories?: string;
        contact?: string;
        about?: string;
        privacy?: string;
        terms?: string;
    };
    home?: {
        footer?: {
            desc?: string;
        };
    };
};

interface FooterProps {
    locale: string;
    dict: Dictionary;
    settings?: SiteSettings;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

const fallbackMenuLinks: SettingsLink[] = [
    {
        id: "about",
        label: { az: "Haqqimizda", en: "About", ru: "About" },
        url: "#",
    },
    {
        id: "press",
        label: { az: "Press-relizler", en: "Press releases", ru: "Press" },
        url: "#",
    },
    {
        id: "ads",
        label: { az: "Saytda reklam", en: "Advertising", ru: "Advertising" },
        url: "#",
    },
    {
        id: "contact",
        label: { az: "Elaqe", en: "Contact", ru: "Contact" },
        url: "#",
    },
];

export default async function Footer({
    locale,
    dict: _dict,
    settings,
}: FooterProps) {
    const resolvedSettings = settings ?? (await getSiteSettings());
    const fallbackLocale =
        resolvedSettings.localization?.defaultLocale || defaultLocale;
    const currentLocale = (locale || fallbackLocale).toLowerCase();
    const supportedLocales =
        resolvedSettings.localization?.supportedLocales?.length
            ? resolvedSettings.localization.supportedLocales
            : locales;
    const localeCodesForPath = supportedLocales.map((code) =>
        (code || "").toLowerCase()
    );
    const menuLinks =
        resolvedSettings.menuLinks && resolvedSettings.menuLinks.length > 0
            ? resolvedSettings.menuLinks
            : fallbackMenuLinks;
    const resolveMenuLabel = (link: SettingsLink) =>
        pickLocalized(link.label, locale, fallbackLocale) || link.url || "Link";
    const buildMenuHref = (rawHref?: string | null) => {
        const trimmed = rawHref?.trim() || "";
        if (!trimmed) return "#";
        if (trimmed.startsWith("#")) return trimmed;
        if (/^(https?:)?\/\//i.test(trimmed)) return trimmed;
        if (/^(mailto:|tel:)/i.test(trimmed)) return trimmed;

        const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
        const url = new URL(withSlash, "http://localhost");
        const segments = url.pathname.split("/").filter(Boolean);
        if (segments.length && localeCodesForPath.includes(segments[0].toLowerCase())) {
            segments.shift();
        }
        const path = segments.length ? `/${segments.join("/")}` : "";
        return `/${currentLocale}${path}${url.search}${url.hash}`;
    };
    const socialLinks = [
        {
            id: "facebook",
            label: "Facebook",
            url: resolvedSettings.social?.facebook,
            icon: "/assets/icons/icon_facebook.svg",
        },
        {
            id: "instagram",
            label: "Instagram",
            url: resolvedSettings.social?.instagram,
            icon: "/assets/icons/icon_instagram.svg",
        },
        {
            id: "youtube",
            label: "Youtube",
            url: resolvedSettings.social?.youtube,
            icon: "/assets/icons/icon_ytb.svg",
        },
        {
            id: "telegram",
            label: "Telegram",
            url: resolvedSettings.social?.telegram,
            icon: "/assets/icons/icon_telegram.svg",
        },
        {
            id: "tiktok",
            label: "Tiktok",
            url: resolvedSettings.social?.tiktok,
            icon: "/assets/icons/icon_tiktok.svg",
        },
    ]
        .filter((item) => item.url && item.url.trim().length > 0)
        .map((item) => ({
            ...item,
            url: item.url!.trim(),
        }));
    const dict = _dict ?? ({} as Dictionary);
    const footerSocialDesc = dict?.home?.footer?.desc?.trim();
    const copyrightText = pickLocalized(
        resolvedSettings.footer?.copyright,
        locale,
        fallbackLocale,
    );
    return (
        <footer className={styles["site-footer"]} id="footer">
            <div className="main_center">
                <div className={cx(styles.footer_main, "width_full_mob")}>
                    <div className={styles["site-footer__top"]}>
                        <div className={styles["middle-grid"]}>
                            <div className={styles["footer-brand"]}>
                                <Link href={`/${currentLocale}`} className={styles["footer-logo"]}>
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
                                {menuLinks.map((link) => {
                                    const rawHref = link.url?.trim() || "#";
                                    const isExternal = /^https?:\/\//i.test(rawHref);
                                    const href = buildMenuHref(rawHref);
                                    return (
                                        <li key={link.id}>
                                            <Link
                                                href={href}
                                                target={isExternal ? "_blank" : undefined}
                                                rel={isExternal ? "noreferrer" : undefined}
                                            >
                                                {resolveMenuLabel(link)}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    </div>
                    <div className={styles["site-footer__middle"]}>
                        <div className={styles.socials_section}>
                            <div className={styles.social_title}>
                                {footerSocialDesc ? (
                                    footerSocialDesc
                                ) : (
                                    <>
                                        Bizi{' '}
                                        <span>sosial şəbəkələrdən</span>{' '}
                                        izl?yin:
                                    </>
                                )}
                            </div>
                            <ul className={styles.socials}>
                                {socialLinks.map((item) => (
                                    <li key={item.id}>
                                        <Link
                                            href={item.url as string}
                                            className={styles.social_icon}
                                            target="_blank"
                                            rel="noreferrer"
                                        >
                                            <span className={styles.scl_icn}>
                                                <Image
                                                    src={item.icon}
                                                    alt={item.label}
                                                    width={16}
                                                    height={16}
                                                />
                                            </span>
                                            <span className={styles.scl_name}>
                                                {item.label}
                                            </span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className={styles["footer-bottom"]}>
                        {copyrightText && (
                            <p className={styles["footer-copy"]}>
                                {copyrightText}
                            </p>
                        )}
                        <Link
                            href={resolvedSettings.footer?.poweredByUrl || "#"}
                            target="_blank"
                            rel="noreferrer"
                            className={styles["footer-powered"]}
                        >
                            <span>
                                {resolvedSettings.footer?.poweredByLabel ||
                                    "Powered by:"}
                            </span>
                            <Image
                                src={
                                    resolvedSettings.footer?.poweredByLogoUrl ||
                                    "/assets/icons/coresoft.svg"
                                }
                                alt="Powered by"
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
