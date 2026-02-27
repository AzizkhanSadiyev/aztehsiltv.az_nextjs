"use client";

import React, { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import "@/styles/slider.css";
import styles from "./slider.module.css";

/* ================= TYPES ================= */

type Testimonial = {
    id: number;
    quote: string;
    name: string;
    position: string;
    company: string;
    logo: string;
};

/* ================= DATA ================= */

const testimonials: Testimonial[] = [
    {
        id: 1,
        quote: '"Strafig didn\'t just move our code; they evolved our team. The migration was invisible to our users."',
        name: "Ethan Brooks",
        position: "Head of SRE",
        company: "Google ads",
        logo: "/assets/images/testimon_1.png",
    },
    {
        id: 2,
        quote: '"They wrapped our legacy core with modern reliability practices without forcing a rewrite. Observability, runbooks, and automation landed fast — with zero drama."',
        name: "Aylin Carter",
        position: "Platform Engineering Lead",
        company: "Mastercard",
        logo: "/assets/images/testimon_2.png",
    },
    {
        id: 3,
        quote: '"Strafig brought structure to product decisions and execution. Clear roadmaps, fewer blockers, and measurable progress every sprint."',
        name: "Daniel Morgan",
        position: "Product & Delivery Manager",
        company: "BMW motors",
        logo: "/assets/images/testimon_3.png",
    },
    {
        id: 4,
        quote: '"They wrapped our legacy core with modern reliability practices without forcing a rewrite. Observability, runbooks, and automation landed fast — with zero drama."',
        name: "Aylin Carter",
        position: "Platform Engineering Lead",
        company: "Mastercard",
        logo: "/assets/images/testimon_2.png",
    },
    {
        id: 5,
        quote: '"Strafig brought structure to product decisions and execution. Clear roadmaps, fewer blockers, and measurable progress every sprint."',
        name: "Daniel Morgan",
        position: "Product & Delivery Manager",
        company: "BMW motors",
        logo: "/assets/images/testimon_3.png",
    },
];

/* ================= COMPONENT ================= */

export default function SliderTestimonial() {
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
        <div className={styles.testimonialSection}>
            <div className={styles.testimonialContainer}>
                {/* Left Arrow */}
                <button
                    className={`${styles.navButton} ${styles.navPrev}`}
                    onClick={handlePrev}
                    aria-label="Previous testimonial"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.87729 8.37011L10.3122 2.27393L11.6876 3.72583L5.25278 9.82202C4.73106 10.3163 4.33918 10.6891 4.04594 10.9999H22.9999V12.9999H4.04594C4.33918 13.3107 4.73106 13.6835 5.25278 14.1777L11.6876 20.2739L10.3122 21.7258L3.82792 15.5829C3.15109 14.9417 2.56989 14.3912 2.16722 13.8893C1.73666 13.3526 1.40796 12.7501 1.40796 11.9999C1.40796 11.2497 1.73666 10.6472 2.16722 10.1105C2.5699 9.60857 3.15109 9.05802 3.82793 8.41688C3.84433 8.40134 3.86078 8.38575 3.87729 8.37011Z"
                            fill="#7D7F78"
                        />
                    </svg>
                </button>

                {/* Swiper */}
                <div className={styles.swiperWrapper}>
                    <Swiper
                        modules={[Navigation]}
                        className={styles.testimonialSwiper}
                        slidesPerView={1}
                        spaceBetween={32}
                        loop
                        speed={500}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                        breakpoints={{
                            0: {
                                slidesPerView: 1,
                                spaceBetween: 16,
                            },
                            767: {
                                slidesPerView: 2,
                                spaceBetween: 20,
                            },
                            1100: {
                                slidesPerView: 3,
                                spaceBetween: 32,
                            },
                        }}
                    >
                        {testimonials.map((testimonial) => (
                            <SwiperSlide key={testimonial.id}>
                                <div className={styles.testimonialCard}>
                                    <div className={styles.quoteText}>
                                        {testimonial.quote}
                                    </div>
                                    <div className={styles.authorInfo}>
                                        <div className={styles.authorLogo}>
                                            <Image
                                                src={testimonial.logo}
                                                alt={testimonial.company}
                                                width={56}
                                                height={56}
                                                unoptimized
                                            />
                                        </div>
                                        <div className={styles.authorDetails}>
                                            <span
                                                className={styles.companyBadge}
                                            >
                                                {testimonial.company}
                                            </span>
                                            <h4 className={styles.authorName}>
                                                {testimonial.name}
                                            </h4>
                                            <p
                                                className={
                                                    styles.authorPosition
                                                }
                                            >
                                                {testimonial.position}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>

                {/* Right Arrow */}
                <button
                    className={`${styles.navButton} ${styles.navNext}`}
                    onClick={handleNext}
                    aria-label="Next testimonial"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                    >
                        <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18.7471 9.82202L12.3123 3.72583L13.6877 2.27393L20.172 8.41688C20.8488 9.05802 21.43 9.60857 21.8327 10.1105C22.2632 10.6472 22.5919 11.2497 22.5919 11.9999C22.5919 12.7501 22.2632 13.3526 21.8327 13.8893C21.43 14.3912 20.8488 14.9417 20.172 15.5829L13.6877 21.7258L12.3123 20.2739L18.7471 14.1777C19.2688 13.6835 19.6607 13.3107 19.954 12.9999H1V10.9999H19.954C19.6607 10.6891 19.2688 10.3163 18.7471 9.82202Z"
                            fill="#171914"
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
