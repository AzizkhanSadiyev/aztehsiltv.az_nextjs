"use client";

import { useEffect, useCallback, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
    const pathname = usePathname();
    const isFirstRender = useRef(true);
    const lastHash = useRef("");

    // Get header offset based on screen size
    const getHeaderOffset = useCallback(() => {
        if (typeof window !== "undefined") {
            return window.innerWidth >= 1024 ? 120 : 72;
        }
        return 120;
    }, []);

    const scrollToElement = useCallback(
        (hash: string) => {
            const element = document.querySelector(hash);
            if (element) {
                const headerOffset = getHeaderOffset();
                const elementPosition = element.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + window.scrollY - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: "smooth",
                });
            }
        },
        [getHeaderOffset],
    );

    // Handle pathname changes (page navigation)
    useEffect(() => {
        const hash = window.location.hash;

        if (hash) {
            // Delay for page transitions
            const delay = isFirstRender.current ? 300 : 200;
            lastHash.current = hash;
            setTimeout(() => {
                scrollToElement(hash);
            }, delay);
        } else {
            // No hash, scroll to top
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: "instant",
            });
        }

        isFirstRender.current = false;
    }, [pathname, scrollToElement]);

    // Poll for hash changes (workaround for Next.js Link not triggering hashchange)
    useEffect(() => {
        const checkHash = () => {
            const currentHash = window.location.hash;
            if (currentHash && currentHash !== lastHash.current) {
                lastHash.current = currentHash;
                scrollToElement(currentHash);
            }
        };

        // Check hash periodically
        const interval = setInterval(checkHash, 100);

        // Also listen for hashchange event
        const handleHashChange = () => {
            const hash = window.location.hash;
            if (hash) {
                lastHash.current = hash;
                scrollToElement(hash);
            }
        };

        window.addEventListener("hashchange", handleHashChange);

        return () => {
            clearInterval(interval);
            window.removeEventListener("hashchange", handleHashChange);
        };
    }, [scrollToElement]);

    // Handle popstate (browser back/forward)
    useEffect(() => {
        const handlePopState = () => {
            setTimeout(() => {
                const hash = window.location.hash;
                if (hash) {
                    lastHash.current = hash;
                    scrollToElement(hash);
                } else {
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "instant",
                    });
                }
            }, 100);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, [scrollToElement]);

    return null;
}
