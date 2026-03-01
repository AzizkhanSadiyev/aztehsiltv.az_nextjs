"use client";
import Link from "next/link";
import Image from "next/image";

import { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import { Autoplay } from "swiper/modules";

import "swiper/css";
import NewsCard from "@/components/NewsCard/Card";
import styles from "./slider.module.css";

/* ================= TYPES ================= */

export type NewsItem = {
    id: number;
    title: string;
    image: string;
    slug?: string;
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
    slidesPerView?: number;
    spaceBetween?: number;
    breakpoints?: Record<number, { slidesPerView?: number; spaceBetween?: number }>;
};

export default function SliderNews({
    items,
    loading = false,
    title = "Arasdirma",
    slidesPerView = 3,
    spaceBetween = 20,
    breakpoints,
}: SliderNewsProps) {
    const swiperRef = useRef<SwiperType | null>(null);
    const swiperBreakpoints =
        breakpoints ??
        ({
            0: {
                slidesPerView: 1,
                spaceBetween: 16,
            },
            720: {
                slidesPerView: 2,
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
            className={`${styles.newsSection} pad_top_20 pad_bottom_20`}
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
                        <Image
                            className={styles.navIcon}
                            src="/assets/icons/prev.svg"
                            width={36}
                            height={36}
                            alt="Previous"
                        />
                    </button>
                    <button
                        type="button"
                        className={`${styles.navButton} ${styles.navNext}`}
                        onClick={handleNext}
                        aria-label="Next"
                    >
                        <Image
                            className={styles.navIcon}
                            src="/assets/icons/next.svg"
                            width={36}
                            height={36}
                            alt="Next"
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
                                  <NewsCard {...item} />
                              </SwiperSlide>
                          ))}
                </Swiper>
            </div>
        </div>
    );
}
