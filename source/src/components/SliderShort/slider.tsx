"use client";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import NewsCard from "@/components/NewsCard/Card";
import styles from "./slider.module.css";

/* ================= TYPES ================= */

export type ShortItem = {
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
    items: ShortItem[];
    loading?: boolean;
    title?: string;
    slidesPerView?: number;
    spaceBetween?: number;
    breakpoints?: Record<
        number,
        { slidesPerView?: number; spaceBetween?: number }
    >;
};

export default function SliderNews({
    items,
    loading = false,
    title = "Arasdirma",
    slidesPerView = 5,
    spaceBetween = 20,
    breakpoints,
}: SliderNewsProps) {
    const swiperRef = useRef<SwiperType | null>(null);
    const swiperBreakpoints =
        breakpoints ??
        ({
            0: {
                slidesPerView: 2,
                spaceBetween: 18,
            },
            480: {
                slidesPerView: 3,
                spaceBetween: 18,
            },
            1100: {
                slidesPerView,
                spaceBetween,
            },
        } as const);

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
        <div
            className={`${styles.newsSection} ${styles.shortWrap} pad_top_20 pad_bottom_20`}
            aria-label={title}
        >
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
                    modules={[Autoplay]}
                    className={styles.newsSwiper}
                    slidesPerView={slidesPerView}
                    spaceBetween={spaceBetween}
                    loop
                    speed={1600}
                    autoplay={{
                        delay: 2800,
                        disableOnInteraction: false,
                    }}
                    breakpoints={swiperBreakpoints}
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
                                  <NewsCard {...item} variant="short" />
                              </SwiperSlide>
                          ))}
                </Swiper>
            </div>
        </div>
    );
}
