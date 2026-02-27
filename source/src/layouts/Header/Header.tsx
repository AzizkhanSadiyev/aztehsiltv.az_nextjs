"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./header.module.css";

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

// Category definitions with slugs
const categories: { slug: string; name: string; highlight?: boolean }[] = [
    { slug: "services", name: "Services" },
    { slug: "trainings", name: "Trainings" },
    { slug: "testimonials", name: "Testimonials" },
    { slug: "about", name: "About us" },
    { slug: "contact", name: "Contact" },
];

// Hamburger icon
const HamburgerIcon = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="11"
        viewBox="0 0 15 11"
        fill="none"
    >
        <path d="M14.6667 1.33333H0V0H14.6667V1.33333Z" fill="#171914" />
        <path d="M14.6667 6H0V4.66667H14.6667V6Z" fill="#171914" />
        <path d="M0 10.6667H14.6667V9.33333H0V10.6667Z" fill="#171914" />
    </svg>
);

// Close icon
const CloseIcon = () => (
    <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        width="24"
        height="24"
    >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export default function Header({ locale, dict }: HeaderProps) {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const mobileMenuRef = useRef<HTMLDivElement>(null);

    // Check if a category is active based on current pathname
    const isCategoryActive = (categorySlug: string) => {
        return pathname?.includes(`/${categorySlug}`);
    };

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                mobileMenuRef.current &&
                !mobileMenuRef.current.contains(event.target as Node)
            ) {
                setIsMobileMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () =>
            document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Lock body scroll while the mobile menu is open
    useEffect(() => {
        if (!isMobileMenuOpen) return;

        const originalOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = originalOverflow;
        };
    }, [isMobileMenuOpen]);

    // Handle keyboard navigation
    const handleKeyDown = (event: React.KeyboardEvent, action: () => void) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            action();
        }
        if (event.key === "Escape") {
            setIsMobileMenuOpen(false);
        }
    };

    const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

    return (
        <header
            className={`${styles.stickyHeader} ${isMobileMenuOpen ? styles.opened : ""}`}
        >
            {/* ===== MAIN HEADER ===== */}
            <div className={styles.headerMain}>
                <div className="main_center">
                    <div className={styles.headerContainer}>
                        {/* Logo */}
                        <Link
                            href={`/${locale}`}
                            className={styles.logo}
                            aria-label="Strafig.AZ Ana Səhifə"
                        >
                            <Image
                                src="/assets/icons/logo.svg"
                                alt="Strafig.AZ Logo"
                                width={165}
                                height={44}
                            />
                        </Link>

                        {/* Desktop Navigation */}
                        <nav
                            className={styles.mainNav}
                            aria-label="Əsas naviqasiya"
                        >
                            <ul className={styles.navList}>
                                <li>
                                    <Link
                                        href={`/${locale}#services`}
                                        className={`${styles.navLink} ${isCategoryActive("services") ? styles.active : ""}`}
                                    >
                                        Services
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${locale}#trainings`}
                                        className={`${styles.navLink} ${isCategoryActive("trainings") ? styles.active : ""}`}
                                    >
                                        Trainings
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${locale}#testimonial`}
                                        className={styles.navLink}
                                        scroll={false}
                                    >
                                        Testimonials
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${locale}#about`}
                                        className={styles.navLink}
                                        scroll={false}
                                    >
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href={`/${locale}#contact`}
                                        className={styles.navLink}
                                        scroll={false}
                                    >
                                        Contact
                                    </Link>
                                </li>
                            </ul>
                        </nav>
                        <div className="desktop">
                            <Link
                                href={`/${locale}#contact`}
                                className={`${styles.btn_item} btn_item secondary`}
                                scroll={false}
                            >
                                Get in touch
                            </Link>
                        </div>

                        {/* Mobile Menu Button */}
                        <button
                            className={styles.mobileMenuButton}
                            onClick={toggleMobileMenu}
                            onKeyDown={(e) =>
                                handleKeyDown(e, toggleMobileMenu)
                            }
                            aria-expanded={isMobileMenuOpen}
                            aria-label="Menyu"
                            type="button"
                        >
                            {isMobileMenuOpen ? (
                                <CloseIcon />
                            ) : (
                                <HamburgerIcon />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== MOBILE MENU ===== */}
            <div
                className={`${styles.mobileMenu} ${isMobileMenuOpen ? styles.open : ""}`}
                ref={mobileMenuRef}
            >
                <div className="mobile">
                    <Link
                        href={`/${locale}#contact`}
                        className={`${styles.btn_item} btn_item secondary`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        scroll={false}
                    >
                        Get in touch
                    </Link>
                </div>
                <nav aria-label="Mobil naviqasiya">
                    <ul className={styles.mobileNavList}>
                        <li>
                            <Link
                                href={`/${locale}#services`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`${styles.navLink} ${isCategoryActive("services") ? styles.active : ""}`}
                            >
                                Services
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${locale}#trainings`}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`${styles.navLink} ${isCategoryActive("trainings") ? styles.active : ""}`}
                            >
                                Trainings
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${locale}#testimonial`}
                                className={styles.navLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                                scroll={false}
                            >
                                Testimonials
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${locale}#about`}
                                className={styles.navLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                                scroll={false}
                            >
                                About Us
                            </Link>
                        </li>
                        <li>
                            <Link
                                href={`/${locale}#contact`}
                                className={styles.navLink}
                                onClick={() => setIsMobileMenuOpen(false)}
                                scroll={false}
                            >
                                Contact
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    );
}
