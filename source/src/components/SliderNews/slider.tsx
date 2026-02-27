"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import NewsCard from "@/components/NewsCard/Card";
import styles from "./slider.module.css";

/* ================= TYPES ================= */

export type NewsItem = {
    id: number;
    title: string;
    image: string;
    href?: string;
    views?: string;
    date?: string;
    category?: string;
    duration?: string;
    type?: "video" | "list";
};

/* ================= COMPONENT ================= */

const cx = (...classes: Array<string | false | null | undefined>) =>
    classes.filter(Boolean).join(" ");

type SliderNewsProps = {
    items: NewsItem[];
    loading?: boolean;
    title?: string;
};

export default function SliderNews({
    items,
    loading = false,
    title = "Arasdirma",
}: SliderNewsProps) {
    const swiperRef = useRef<SwiperType | null>(null);

    const handlePrev = () => {
        if (swiperRef.current) {
            swiperRef.current.slidePrev();
        }
    };

    const handleNext = () => {
        if (swiperRef.current) {
            swiperRef.current.slideNext();
        }
    };

    return (
        <div className={styles.newsSection}>
            <div className={cx("sect_header", styles.newsHeader)}>
                <h2 className="sect_title">{title}</h2>
                <div className={styles.navGroup}>
                    <button
                        type="button"
                        className={`${styles.navButton} ${styles.navPrev}`}
                        onClick={handlePrev}
                        aria-label="Previous"
                    >
                        <img
                            className={styles.navIcon}
                            src="/assets/icons/prev.svg"
                            alt=""
                            aria-hidden="true"
                        />
                    </button>
                    <button
                        type="button"
                        className={`${styles.navButton} ${styles.navNext}`}
                        onClick={handleNext}
                        aria-label="Next"
                    >
                        <img
                            className={styles.navIcon}
                            src="/assets/icons/next.svg"
                            alt=""
                            aria-hidden="true"
                        />
                    </button>
                </div>
            </div>
            <div className={styles.newsSlider}>
                <Swiper
                    className={styles.newsSwiper}
                    slidesPerView={3}
                    spaceBetween={24}
                    loop
                    speed={600}
                    breakpoints={{
                        0: {
                            slidesPerView: 1,
                            spaceBetween: 16,
                        },
                        720: {
                            slidesPerView: 2,
                            spaceBetween: 18,
                        },
                        1100: {
                            slidesPerView: 3,
                            spaceBetween: 24,
                        },
                    }}
                    onSwiper={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                >
                    {loading
                        ? Array.from({ length: 3 }).map((_, index) => (
                              <SwiperSlide key={`loading-${index}`}>
                                  <NewsCard loading />
                              </SwiperSlide>
                          ))
                        : items.map((item) => (
                              <SwiperSlide key={item.id}>
                                  <NewsCard {...item} />
                              </SwiperSlide>
                          ))}
                </Swiper>
            </div>
        </div>
    );
}


