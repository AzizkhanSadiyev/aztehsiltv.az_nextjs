"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import Link from "next/link";
import Image from "next/image";

import styles from "./header.module.css";
import { locales } from "@/i18n/config";

interface Dictionary {
    navigation: {
        home: string;
        categories: string;
        contact: string;
        about: string;
        privacy: string;
        terms: string;
    };
    common: {
        search: string;
        loading: string;
        noResults: string;
        language: string;
    };
}

interface HeaderProps {
    locale: string;
    dict: Dictionary;
}

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

const localeLabelMap: Record<string, string> = {
    az: "Az",
    en: "En",
    ru: "Ru",
};

export default function Header({ locale, dict: _dict }: HeaderProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isLangOpen, setIsLangOpen] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const mobileMenuRef = useRef<HTMLElement | null>(null);
    const searchRef = useRef<HTMLDivElement | null>(null);
    const langRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null;
            if (!target) return;

            const clickedMenuToggle = target.closest?.("[data-menu-toggle]");
            const clickedSearchToggle = target.closest?.("[data-search-toggle]");
            const clickedLangToggle = target.closest?.("[data-lang-toggle]");

            if (isMobileMenuOpen && !clickedMenuToggle) {
                if (
                    mobileMenuRef.current &&
                    !mobileMenuRef.current.contains(target)
                ) {
                    setIsMobileMenuOpen(false);
                }
            }

            if (isSearchOpen && !clickedSearchToggle) {
                if (searchRef.current && !searchRef.current.contains(target)) {
                    setIsSearchOpen(false);
                }
            }

            if (isLangOpen && !clickedLangToggle) {
                if (langRef.current && !langRef.current.contains(target)) {
                    setIsLangOpen(false);
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isLangOpen, isMobileMenuOpen, isSearchOpen]);

    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        document.body.classList.toggle("transformed", isMobileMenuOpen);
        return () => {
            document.body.classList.remove("transformed");
        };
    }, [isMobileMenuOpen]);

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme");
        const prefersDark =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
        const nextDark =
            savedTheme === "dark" || (savedTheme === null && prefersDark);

        setIsDarkMode(nextDark);
        document.documentElement.setAttribute(
            "data-theme",
            nextDark ? "dark" : "light"
        );
    }, []);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsSearchOpen(false);
        setIsLangOpen(false);
    }, [pathname]);

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
    const toggleSearch = () =>
        setIsSearchOpen((prev) => {
            const next = !prev;
            if (next) {
                setIsLangOpen(false);
            }
            return next;
        });
    const closeSearch = () => setIsSearchOpen(false);
    const toggleLang = () =>
        setIsLangOpen((prev) => {
            const next = !prev;
            if (next) {
                setIsSearchOpen(false);
            }
            return next;
        });
    const toggleDarkMode = () => {
        setIsDarkMode((prev) => {
            const next = !prev;
            document.documentElement.setAttribute(
                "data-theme",
                next ? "dark" : "light"
            );
            localStorage.setItem("theme", next ? "dark" : "light");
            return next;
        });
    };

    const menuButtonClass = cx(
        styles.menu_btn,
        isMobileMenuOpen && styles.close
    );
    const navClass = cx(
        styles.navigation,
        isMobileMenuOpen && styles.transformed
    );
    const mobileClass = cx(styles.mobile, "mobile");
    const searchClass = cx(
        styles.hd_search,
        isSearchOpen && styles.opened
    );
    const langClass = cx(styles.lang_sect, isLangOpen && styles.clicked);

    const currentLocale =
        locale && locales.includes(locale as (typeof locales)[number])
            ? locale
            : "az";
    const localeLabel = localeLabelMap[currentLocale] || currentLocale;

    const pathWithoutLocale = (() => {
        const rawPath = pathname ?? "/";
        const segments = rawPath.split("/").filter(Boolean);
        if (segments.length === 0) return "";
        if (locales.includes(segments[0] as (typeof locales)[number])) {
            segments.shift();
        }
        return segments.length ? `/${segments.join("/")}` : "";
    })();

    const buildLocaleHref = (nextLocale: string) =>
        `/${nextLocale}${pathWithoutLocale}`;

    return (
        <header className={styles.header} id="header">
            <div className={styles.header_bottom}>
                <div className={cx(styles.header_left, "desktop")}>
                    <button
                        type="button"
                        className={menuButtonClass}
                        data-menu-toggle
                        aria-label={
                            isMobileMenuOpen ? "Close menu" : "Open menu"
                        }
                        aria-expanded={isMobileMenuOpen}
                        aria-controls="main-navigation"
                        onClick={toggleMobileMenu}
                    />
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
                <div className={styles.logo_sect}>
                    <Link href="/" className={styles.logo}>
                        <div className={styles.logo_img}>
                            <Image
                                className={styles["logo--light"]}
                                src="/assets/icons/logo.svg"
                                alt="AzTehsilTV Logo"
                                width={154}
                                height={32}
                            />
                            <Image
                                className={styles["logo--dark"]}
                                src="/assets/icons/logo_dark.svg"
                                alt="AzTehsilTV Logo"
                                width={154}
                                height={32}
                            />
                        </div>
                    </Link>
                </div>
                <div className={styles.header_right}>
                    <div className={styles.head_icons}>
                        <button
                            type="button"
                            className={cx(
                                styles.search_opn,
                                styles.icon_open,
                                "open_search"
                            )}
                            aria-label="Search"
                            aria-expanded={isSearchOpen}
                            aria-controls="header-search"
                            data-search-toggle
                            onClick={toggleSearch}
                        >
                            <span className={cx("desktop", styles.pr_28)}>
                                Təhsildə axtar
                            </span>
                        </button>
                        <div className={styles.hd_line}></div>
                        <button
                            type="button"
                            className={styles.dark_btn}
                            aria-label="Toggle dark mode"
                            aria-pressed={isDarkMode}
                            onClick={toggleDarkMode}
                        />
                        <div
                            className={cx(styles.hd_line, styles.mobile, "mobile")}
                        ></div>
                        <div className={langClass} ref={langRef}>
                            <button
                                type="button"
                                className={styles.lang_btn}
                                aria-haspopup="menu"
                                aria-expanded={isLangOpen}
                                aria-controls="header-lang-menu"
                                data-lang-toggle
                                onClick={toggleLang}
                            >
                                {localeLabel}
                            </button>
                            <ul className={styles.langs} id="header-lang-menu">
                                <li
                                    className={cx(
                                        currentLocale === "en" && styles.active
                                    )}
                                >
                                    <Link
                                        href={buildLocaleHref("en")}
                                        onClick={() => setIsLangOpen(false)}
                                    >
                                        En
                                    </Link>
                                </li>
                                <li
                                    className={cx(
                                        currentLocale === "ru" && styles.active
                                    )}
                                >
                                    <Link
                                        href={buildLocaleHref("ru")}
                                        onClick={() => setIsLangOpen(false)}
                                    >
                                        Ru
                                    </Link>
                                </li>
                                <li
                                    className={cx(
                                        currentLocale === "az" && styles.active
                                    )}
                                >
                                    <Link
                                        href={buildLocaleHref("az")}
                                        onClick={() => setIsLangOpen(false)}
                                    >
                                        Az
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <div
                            className={cx(styles.hd_line, styles.mobile, "mobile")}
                        ></div>
                        <div className={mobileClass}>
                            <button
                                type="button"
                                className={menuButtonClass}
                                data-menu-toggle
                                aria-label={
                                    isMobileMenuOpen
                                        ? "Close menu"
                                        : "Open menu"
                                }
                                aria-expanded={isMobileMenuOpen}
                                aria-controls="main-navigation"
                                onClick={toggleMobileMenu}
                            />
                        </div>
                        <div className="desktop">
                            <a
                                href="#"
                                className="btn_item btn_hotspot primary"
                                style={{ marginLeft: 4 }}
                            >
                                <span className="btn_icon">Canlı yayın</span>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className={searchClass} ref={searchRef} id="header-search">
                <form action="" method="get">
                    <div className={styles.search_row}>
                        <input
                            type="text"
                            name="q"
                            className={styles.search_input}
                            placeholder="Axtar..."
                        />
                        <button
                            type="submit"
                            className={cx(styles.search_opn, styles.icon_open)}
                            aria-label="Submit search"
                        ></button>
                        <button
                            type="button"
                            className={cx(
                                styles.search_opn,
                                styles.icon_close,
                                "close_search"
                            )}
                            aria-label="Close search"
                            data-search-toggle
                            onClick={closeSearch}
                        ></button>
                    </div>
                </form>
            </div>
            <nav
                className={navClass}
                id="main-navigation"
                ref={mobileMenuRef}
                aria-label="Primary"
            >
                <div className={styles.mob_body}>
                    <ul className={styles.hdr_menu}>
                        <li className={styles.active}>
                            <Link href="#">
                                <span
                                    className={cx(
                                        styles.menu_icon,
                                        styles.icon_menu_live
                                    )}
                                ></span>
                                Canlı
                            </Link>
                        </li>
                        <li>
                            <Link href="#">
                                <span
                                    className={cx(
                                        styles.menu_icon,
                                        styles.icon_menu_press
                                    )}
                                ></span>
                                Press-relizlər
                            </Link>
                        </li>
                        <li>
                            <Link href="#">
                                <span
                                    className={cx(
                                        styles.menu_icon,
                                        styles.icon_menu_short
                                    )}
                                ></span>
                                Shorts
                            </Link>
                        </li>
                        <li className={styles.has_sub}>
                            <Link href="#">
                                <span
                                    className={cx(
                                        styles.menu_icon,
                                        styles.icon_menu_exp
                                    )}
                                ></span>
                                Kəşf et
                            </Link>
                            <ul className={styles.drop_menu}>
                                <li>
                                    <Link href="#">Bütün bölmələr</Link>
                                </li>
                                <li>
                                    <Link href="#">Təhsil </Link>
                                </li>
                                <li>
                                    <Link href="#">Uğur hekayələri </Link>
                                </li>
                                <li>
                                    <Link href="#">Reportajlar</Link>
                                </li>
                                <li>
                                    <Link href="#">Layihələr</Link>
                                </li>
                                <li>
                                    <Link href="#">Xaricdə təhsil</Link>
                                </li>
                            </ul>
                        </li>
                        <li className={styles.has_sub}>
                            <Link href="#">
                                <span
                                    className={cx(
                                        styles.menu_icon,
                                        styles.icon_menu_board
                                    )}
                                ></span>
                                Verilişlər
                            </Link>
                            <ul className={styles.drop_menu}>
                                <li>
                                    <Link href="#">Metodik körpü </Link>
                                </li>
                                <li>
                                    <Link href="#">Uşaqlar və biz </Link>
                                </li>
                                <li>
                                    <Link href="#">Podkast </Link>
                                </li>
                                <li>
                                    <Link href="#">Təhsil saatı </Link>
                                </li>
                            </ul>
                        </li>
                    </ul>
                </div>
                <div className={styles.mob_footer}>
                    <div className={cx(styles.weather_currency, "desktop")}>
                        <div className={styles.weather}>
                            <span className={styles.weather_info}> 25° </span>
                            <span className={styles.weather_icon}>
                                <Image
                                    src="/assets/icons/weather_rainy_night.svg"
                                    alt="Weather"
                                    width={32}
                                    height={32}
                                />
                            </span>
                            <span className={styles.weather_loc}> Baki </span>
                        </div>
                        <div className={styles.currency_item}>
                            <div className={styles.currency_content}>
                                <select
                                    name="currency_type"
                                    id="currency_select"
                                    className={styles.currency_select}
                                >
                                    <option value="USD">USD</option>
                                    <option value="EUR">EUR</option>
                                    <option value="RUB">RUB</option>
                                </select>
                                <span className={styles.currency_info}>
                                    (%0.47)
                                </span>
                            </div>
                            <span className={styles.currency_value}>1.7000</span>
                        </div>
                    </div>
                    <div className={mobileClass}>
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
                                                className={styles["logo--light"]}
                                                src="/assets/icons/icon_facebook_light.svg"
                                                alt="facebook"
                                                width={16}
                                                height={16}
                                            />
                                            <Image
                                                className={styles["logo--dark"]}
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
                                                className={styles["logo--light"]}
                                                src="/assets/icons/icon_instagram_light.svg"
                                                alt="instagram"
                                                width={16}
                                                height={16}
                                            />
                                            <Image
                                                className={styles["logo--dark"]}
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
                                                className={styles["logo--light"]}
                                                src="/assets/icons/icon_ytb_light.svg"
                                                alt="youtube"
                                                width={16}
                                                height={16}
                                            />
                                            <Image
                                                className={styles["logo--dark"]}
                                                src="/assets/icons/icon_ytb.svg"
                                                alt="youtube"
                                                width={16}
                                                height={16}
                                            />
                                        </span>
                                        <span className={styles.scl_name}>Youtube</span>
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
                                                className={styles["logo--light"]}
                                                src="/assets/icons/icon_telegram_light.svg"
                                                alt="telegram"
                                                width={16}
                                                height={16}
                                            />
                                            <Image
                                                className={styles["logo--dark"]}
                                                src="/assets/icons/icon_telegram.svg"
                                                alt="telegram"
                                                width={16}
                                                height={16}
                                            />
                                        </span>
                                        <span className={styles.scl_name}>Telegram</span>
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
                                                className={styles["logo--light"]}
                                                src="/assets/icons/icon_tiktok_light.svg"
                                                alt="tiktok"
                                                width={16}
                                                height={16}
                                            />
                                            <Image
                                                className={styles["logo--dark"]}
                                                src="/assets/icons/icon_tiktok.svg"
                                                alt="tiktok"
                                                width={16}
                                                height={16}
                                            />
                                        </span>
                                        <span className={styles.scl_name}>Tiktok</span>
                                    </Link>
                                </li>
                            </ul>
                        </div>
                        <ul className={styles.desk_little_menu}>
                            <li>
                                <Link href="#">Haqqımızda </Link>
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
            </nav>
        </header>
    );
}
