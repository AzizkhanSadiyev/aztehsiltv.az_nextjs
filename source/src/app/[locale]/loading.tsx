"use client";

import styles from "./loading.module.css";

export default function Loading() {
    return (
        <div className="main_center">
            <div className={styles.loadingWrap}>
                <span className={styles.loadingSpinner} aria-hidden="true" />
                <span className={styles.loadingText}>Loading...</span>
            </div>
        </div>
    );
}
