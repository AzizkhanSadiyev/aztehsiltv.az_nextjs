"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./page.module.css";

const TARGET_SELECTOR = '[data-detail-container="true"]';
const DEFAULT_FONT_SIZE = 18;
const MIN_FONT_SIZE = 14;
const MAX_FONT_SIZE = 26;
const STEP = 2;

function clamp(value: number, min: number, max: number) {
    return Math.min(max, Math.max(min, value));
}

export default function TextScaleControls() {
    const [fontSize, setFontSize] = useState<number>(DEFAULT_FONT_SIZE);

    useEffect(() => {
        const target = document.querySelector<HTMLElement>(TARGET_SELECTOR);
        if (!target) return;

        target.style.setProperty("--detail-font-size", `${fontSize}px`);
    }, [fontSize]);

    const handleChange = useCallback((delta: number) => {
        setFontSize((size) => {
            const current = size ?? DEFAULT_FONT_SIZE;
            return clamp(current + delta, MIN_FONT_SIZE, MAX_FONT_SIZE);
        });
    }, []);

    return (
        <div className={styles.text_scale}>
            <button
                type="button"
                className={styles.scaleminus}
                aria-label="Şrifti kiçilt"
                onClick={() => handleChange(-STEP)}
                disabled={fontSize <= MIN_FONT_SIZE}
            ></button>
            <div className={styles.scalefont} aria-hidden="true"></div>
            <button
                type="button"
                className={styles.scaleplus}
                aria-label="Şrifti böyüt"
                onClick={() => handleChange(STEP)}
                disabled={fontSize >= MAX_FONT_SIZE}
            ></button>
        </div>
    );
}
