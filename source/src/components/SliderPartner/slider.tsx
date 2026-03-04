"use client";

import { useRef } from "react";
import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

import "swiper/css";
import styles from "./slider.module.css";
import Link from "next/link";

/* ================= TYPES ================= */

type Partner = {
    id: string;
    slug: string;
    name: string;
    image: string;
};

interface SliderPartnerProps {
    partners: Partner[];
}

/* ================= COMPONENT ================= */

export default function SliderPartner({ partners }: SliderPartnerProps) {
    const swiperRef = useRef<SwiperType | null>(null);

    if (!partners.length) {
        return null;
    }

    return (
        <section
            className={`${styles.partnerSection} pad_top_40 margin_bottom_18`}
            aria-label="Tərəfdaşlar"
        >
            <div className={styles.partnerShell}>
                <div className={styles.partnerHeader}>
                    <h2 className={styles.partnerTitle}>Tərəfdaşlar</h2>
                </div>
                <div className={styles.partnerSlider}>
                    <Swiper
                        modules={[Autoplay]}
                        className={styles.partnerSwiper}
                        slidesPerView={6}
                        spaceBetween={20}
                        loop
                        speed={800}
                        autoplay={{
                            delay: 3000,
                            disableOnInteraction: false,
                        }}
                        breakpoints={{
                            0: {
                                slidesPerView: 2,
                                spaceBetween: 12,
                            },
                            480: {
                                slidesPerView: 3,
                                spaceBetween: 16,
                            },
                            768: {
                                slidesPerView: 4,
                                spaceBetween: 18,
                            },
                            1024: {
                                slidesPerView: 5,
                                spaceBetween: 20,
                            },
                            1280: {
                                slidesPerView: 6,
                                spaceBetween: 20,
                            },
                        }}
                        onSwiper={(swiper) => {
                            swiperRef.current = swiper;
                        }}
                    >
                        {partners.map((partner) => (
                            <SwiperSlide key={partner.id}>
                                <Link className={styles.partnerCard} href={partner.slug}>
                                    <div className={styles.partnerLogo}>
                                        <Image
                                            src={partner.image}
                                            alt={partner.name}
                                            width={190}
                                            height={120}
                                            unoptimized
                                        />
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            </div>
        </section>
    );
}
