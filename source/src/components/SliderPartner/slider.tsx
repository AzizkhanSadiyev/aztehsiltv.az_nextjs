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
    id: number;
    slug: string;
    name: string;
    image: string;
};

/* ================= DATA ================= */

const partners: Partner[] = [
    {
        id: 1,
        slug: "#",
        name: "Partner 1",
        image: "/assets/images/partner_1.png",
    },
    {
        id: 2,
        slug: "#",
        name: "Partner 2",
        image: "/assets/images/partner_2.png",
    },
    {
        id: 3,
        slug: "#",
        name: "Partner 3",
        image: "/assets/images/partner_3.png",
    },
    {
        id: 4,
        slug: "#",
        name: "Partner 4",
        image: "/assets/images/partner_4.png",
    },
    {
        id: 5,
        slug: "#",
        name: "Partner 5",
        image: "/assets/images/partner_5.png",
    },
    {
        id: 6,
        slug: "#",
        name: "Partner 6",
        image: "/assets/images/partner_6.png",
    },
    {
        id: 7,
        slug: "#",
        name: "Partner 7",
        image: "/assets/images/partner_4.png",
    },
    {
        id: 8,
        slug: "#",
        name: "Partner 8",
        image: "/assets/images/partner_5.png",
    },
    {
        id: 9,
        slug: "#",
        name: "Partner 9",
        image: "/assets/images/partner_6.png",
    },
];

/* ================= COMPONENT ================= */

export default function SliderPartner() {
    const swiperRef = useRef<SwiperType | null>(null);

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
