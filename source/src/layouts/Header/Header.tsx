"use client";

import {
    useCallback,
    useEffect,
    useRef,
    useState,
    useSyncExternalStore,
} from "react";
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

type ThemeMode = "light" | "dark";
type MenuState = {
    pathKey: string;
    isMobileMenuOpen: boolean;
    isSearchOpen: boolean;
    isLangOpen: boolean;
};

type CategoryNavItem = {
    id: string;
    name: string;
    slug: string;
    parentId: string | null;
    positions?: number[];
    isActive?: boolean;
    order?: number;
};


const THEME_STORAGE_KEY = "theme";
const DEFAULT_THEME: ThemeMode = "light";

const getPreferredTheme = (): ThemeMode => {
    if (typeof window === "undefined") return DEFAULT_THEME;
    const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (savedTheme === "dark" || savedTheme === "light") {
        return savedTheme;
    }
    const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
    return prefersDark ? "dark" : "light";
};

let currentTheme: ThemeMode = DEFAULT_THEME;
const themeListeners = new Set<() => void>();

const notifyThemeListeners = () => {
    for (const listener of themeListeners) {
        listener();
    }
};

const applyTheme = (nextTheme: ThemeMode) => {
    if (typeof document !== "undefined") {
        document.documentElement.setAttribute("data-theme", nextTheme);
    }
};

const setTheme = (nextTheme: ThemeMode) => {
    currentTheme = nextTheme;
    applyTheme(nextTheme);
    if (typeof window !== "undefined") {
        window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    }
    notifyThemeListeners();
};

const themeStore = {
    subscribe(listener: () => void) {
        themeListeners.add(listener);
        return () => {
            themeListeners.delete(listener);
        };
    },
    getSnapshot() {
        return currentTheme;
    },
    getServerSnapshot() {
        return DEFAULT_THEME;
    },
    setTheme,
};

if (typeof window !== "undefined") {
    currentTheme = getPreferredTheme();
    applyTheme(currentTheme);
}

export default function Header({ locale, dict: _dict }: HeaderProps) {
    const pathname = usePathname();
    const pathKey = pathname ?? "";
    const [menuState, setMenuState] = useState<MenuState>(() => ({
        pathKey,
        isMobileMenuOpen: false,
        isSearchOpen: false,
        isLangOpen: false,
    }));
    const updateMenuState = useCallback(
        (updater: (prev: MenuState) => MenuState) => {
            setMenuState((prev) => {
                const base =
                    prev.pathKey === pathKey
                        ? prev
                        : {
                              pathKey,
                              isMobileMenuOpen: false,
                              isSearchOpen: false,
                              isLangOpen: false,
                          };
                return updater(base);
            });
        },
        [pathKey]
    );
    const isSamePath = menuState.pathKey === pathKey;
    const isMobileMenuOpen = isSamePath && menuState.isMobileMenuOpen;
    const isSearchOpen = isSamePath && menuState.isSearchOpen;
    const isLangOpen = isSamePath && menuState.isLangOpen;
    const theme = useSyncExternalStore(
        themeStore.subscribe,
        themeStore.getSnapshot,
        themeStore.getServerSnapshot
    );
    const isDarkMode = theme === "dark";
    const mobileMenuRef = useRef<HTMLElement | null>(null);
    const searchRef = useRef<HTMLDivElement | null>(null);
    const langRef = useRef<HTMLDivElement | null>(null);
    const [categories, setCategories] = useState<CategoryNavItem[]>([]);
    const [isCategoriesLoading, setIsCategoriesLoading] = useState(false);

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
                    updateMenuState((prev) => ({
                        ...prev,
                        isMobileMenuOpen: false,
                    }));
                }
            }

            if (isSearchOpen && !clickedSearchToggle) {
                if (searchRef.current && !searchRef.current.contains(target)) {
                    updateMenuState((prev) => ({
                        ...prev,
                        isSearchOpen: false,
                    }));
                }
            }

            if (isLangOpen && !clickedLangToggle) {
                if (langRef.current && !langRef.current.contains(target)) {
                    updateMenuState((prev) => ({
                        ...prev,
                        isLangOpen: false,
                    }));
                }
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isLangOpen, isMobileMenuOpen, isSearchOpen, updateMenuState]);

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

    const toggleMobileMenu = () =>
        updateMenuState((prev) => ({
            ...prev,
            isMobileMenuOpen: !prev.isMobileMenuOpen,
        }));
    const toggleSearch = () =>
        updateMenuState((prev) => {
            const next = !prev.isSearchOpen;
            return {
                ...prev,
                isSearchOpen: next,
                isLangOpen: next ? false : prev.isLangOpen,
            };
        });
    const closeSearch = () =>
        updateMenuState((prev) => ({
            ...prev,
            isSearchOpen: false,
        }));
    const toggleLang = () =>
        updateMenuState((prev) => {
            const next = !prev.isLangOpen;
            return {
                ...prev,
                isLangOpen: next,
                isSearchOpen: next ? false : prev.isSearchOpen,
            };
        });
    const toggleDarkMode = () => {
        themeStore.setTheme(isDarkMode ? "light" : "dark");
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
    const categoryBasePath = `/${currentLocale}/categories`;
    const broadcastBasePath = `/${currentLocale}/broadcasts`;

    useEffect(() => {
        let isMounted = true;
        const controller = new AbortController();

        const loadCategories = async () => {
            setIsCategoriesLoading(true);
            try {
                const response = await fetch(
                    `/api/categories?lang=${currentLocale}`,
                    { signal: controller.signal }
                );
                const payload = await response.json();
                if (!response.ok || !payload?.success) {
                    throw new Error(
                        payload?.error?.message || "Failed to load categories"
                    );
                }
                if (isMounted) {
                    setCategories(payload?.data ?? []);
                }
            } catch (error) {
                if ((error as Error)?.name !== "AbortError") {
                    console.error("Failed to load categories", error);
                }
                if (isMounted) {
                    setCategories([]);
                }
            } finally {
                if (isMounted) {
                    setIsCategoriesLoading(false);
                }
            }
        };

        loadCategories();

        return () => {
            isMounted = false;
            controller.abort();
        };
    }, [currentLocale]);


    const normalizeKey = (value: string) =>
        value
            .normalize("NFKD")
            .toLowerCase()
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/ə/g, "e")
            .replace(/ı/g, "i")
            .replace(/ş/g, "s")
            .replace(/ğ/g, "g")
            .replace(/ç/g, "c")
            .replace(/ö/g, "o")
            .replace(/ü/g, "u")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");

    const findParent = (slugCandidates: string[], nameCandidates: string[]) =>
        categories.find(
            (category) =>
                slugCandidates.includes(category.slug) ||
                nameCandidates.some(
                    (name) => normalizeKey(category.name) === normalizeKey(name)
                )
        );

    const sortCategories = (list: CategoryNavItem[]) =>
        list.slice().sort((a, b) => {
            const orderDiff = (a.order ?? 0) - (b.order ?? 0);
            if (orderDiff !== 0) return orderDiff;
            return a.name.localeCompare(b.name);
        });

    const activeCategories = categories.filter(
        (category) => category.isActive !== false
    );

    const exploreParent = findParent(
        ["kesf-et", "keshf-et", "kashf-et", "explore", "discover"],
        ["Kəşf et", "Kesf et", "Kashf et", "Explore", "Discover"]
    );
    const broadcastParent = findParent(
        ["verilisler", "verilislar", "broadcasts", "broadcast"],
        ["Verilişlər", "Verilisler", "Broadcasts"]
    );

    const exploreChildren = exploreParent
        ? sortCategories(
              activeCategories.filter(
                  (category) => category.parentId === exploreParent.id
              )
          )
        : [];
    const broadcastChildren = broadcastParent
        ? sortCategories(
              activeCategories.filter(
                  (category) => category.parentId === broadcastParent.id
              )
          )
        : [];

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
                                        onClick={() =>
                                            updateMenuState((prev) => ({
                                                ...prev,
                                                isLangOpen: false,
                                            }))
                                        }
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
                                        onClick={() =>
                                            updateMenuState((prev) => ({
                                                ...prev,
                                                isLangOpen: false,
                                            }))
                                        }
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
                                        onClick={() =>
                                            updateMenuState((prev) => ({
                                                ...prev,
                                                isLangOpen: false,
                                            }))
                                        }
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
                                    <Link href={categoryBasePath}>
                                        Bütün bölmələr
                                    </Link>
                                </li>
                                {isCategoriesLoading ? (
                                    <li>
                                        <span>Yüklənir...</span>
                                    </li>
                                ) : exploreChildren.length > 0 ? (
                                    exploreChildren
                                        .filter(
                                            (item) =>
                                                item.slug !== "butun-bolmeler"
                                        )
                                        .map((item) => (
                                        <li key={item.id}>
                                            <Link
                                                href={`${categoryBasePath}/${item.slug}`}
                                            >
                                                {item.name}
                                            </Link>
                                        </li>
                                    ))
                                ) : (
                                    <li>
                                        <span>Kateqoriya yoxdur</span>
                                    </li>
                                )}
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
                                    <Link href={broadcastBasePath}>
                                        Bütün verilişlər
                                    </Link>
                                </li>
                                {isCategoriesLoading ? (
                                    <li>
                                        <span>Yüklənir...</span>
                                    </li>
                                ) : broadcastChildren.length > 0 ? (
                                    broadcastChildren
                                        .filter(
                                            (item) =>
                                                item.slug !== "butun-verilisler"
                                        )
                                        .map((item) => (
                                            <li key={item.id}>
                                                <Link
                                                    href={`${categoryBasePath}/${item.slug}`}
                                                >
                                                    {item.name}
                                                </Link>
                                            </li>
                                        ))
                                ) : (
                                    <li>
                                        <span>Veriliş yoxdur</span>
                                    </li>
                                )}
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


