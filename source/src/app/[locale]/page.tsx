import { locales, type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import Link from "next/link";
import Image from "next/image";
import styles from "./page.module.css";

import ServiceCard from "@/components/ServiceCard/Card";
import TrainingCard from "@/components/TrainingCard/Card";
import SliderTestimonial from "@/components/SliderTestimonial/slider";
import TeamCard from "@/components/TeamCard/Card";
import SliderPartner from "@/components/SliderPartner/slider";
import ContactForm from "@/components/ContactForm/ContactForm";

import { link } from "fs";

export default async function HomePage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);

    const services = [
        {
            title: "SRE & Infrastructure",
            description:
                "High-availability systems that wrap your legacy core in modern resilience.",
            image: "/assets/images/card_1.png",
            slug: "sre-infrastructure",
            more: "Learn more",
        },
        {
            title: "DevOps Transformation",
            description:
                'Moving from manual to automated without the "Big Bang" risk',
            image: "/assets/images/card_2.png",
            slug: "devops-transformation",
            more: "Learn more",
        },
        {
            title: "Product Management",
            description:
                "Roadmaps that bridge the gap between technical debt and market-ready features.",
            image: "/assets/images/card_3.png",
            slug: "product-management",
            more: "Learn more",
        },
        {
            title: "Development",
            description: "Building software that respond your demand",
            image: "/assets/images/card_4.png",
            slug: "development",
            more: "Learn more",
        },
    ];
    const trainings = [
        {
            title: "Kubernetes Mastery",
            subtitle: "From local dev to production-ready clusters.",
            description:
                "Roadmaps that bridge the gap between technical debt and market-ready features.",
            image: "/assets/icons/training_icon.svg",
            slug: "kubernetes-mastery",
        },
        {
            title: "Modern DevOps Culture",
            subtitle: "Shifting mindsets along with the tech stack.",
            description:
                "Roadmaps that bridge the gap between technical debt and market-ready features.",
            image: "/assets/icons/training_icon.svg",
            slug: "modern-devops-culture",
        },
        {
            title: "SRE Foundations",
            subtitle: "Reliability as a feature, not an afterthought.",
            description:
                "Roadmaps that bridge the gap between technical debt and market-ready features.",
            image: "/assets/icons/training_icon.svg",
            slug: "sre-foundations",
        },
    ];
    const teams = [
        {
            name: "Adrian Whitmore",
            position: "Founder",
            description:
                "Leads incremental change—clear roadmaps, low risk, steady progress around legacy.",
            image: "/assets/images/team_1.png",
            linkedinUrl: "https://linkedin.com/in/....",
        },
        {
            name: "Miles Harrington",
            position: "Head of Platform",
            description:
                "Builds delivery systems—CI/CD, Kubernetes, automation around legacy.",
            image: "/assets/images/team_2.png",
            linkedinUrl: "https://linkedin.com/in/....",
        },
        {
            name: "Elena Varga",
            position: "Head of SRE & Reliability",
            description:
                "Makes reliability a feature—SLOs, observability, incident readiness, calm ops.",
            image: "/assets/images/team_3.png",
            linkedinUrl: "https://linkedin.com/in/....",
        },
        {
            name: "Noah Kensington",
            position: "Product Strategy Lead",
            description:
                "Turns strategy into delivery—pragmatic roadmaps, less debt, more value.",
            image: "/assets/images/team_4.png",
            linkedinUrl: "https://linkedin.com/in/....",
        },
    ];

    return (
        <>
            <div className="main_center">
                {/* wrap_manshet */}
                <div className={styles.wrap_manshet}>
                    <div className={styles.manshet_content}>
                        <div className={styles.msh_pin}>
                            Technical Transformation Partner
                        </div>
                        <div className={styles.msh_title}>
                            <p>
                                <strong>Incremental</strong> Progress
                            </p>
                            <p>
                                <strong>Irreversible</strong> Success
                            </p>
                        </div>
                        <div className={styles.msh_description}>
                            Inspired by the Strangler Fig, we specialize in the
                            art of incremental transformation. We build the
                            future around your legacy systems, replacing
                            complexity with stability—one root at a time.
                        </div>
                        <div className={styles.msh_buttons}>
                            <div className={`${styles.btn_item_info} `}>
                                Ready to talk?
                            </div>
                            <Link
                                href={`/${locale}#contact`}
                                className={`btn_item btn_more primary`}
                            >
                                <span className="btn_icon">Get in touch</span>
                            </Link>
                        </div>
                    </div>
                    <div className={styles.manshet_img}>
                        <Image
                            src="/assets/images/manshet_1.png"
                            alt={"Manhset image"}
                            width={596}
                            height={596}
                        />
                    </div>
                </div>
                {/* wrap_manshet */}
            </div>

            <div className="border_line"></div>

            {/* Services */}
            <div className="main_center" id="services">
                <div className="section_wrap wrapper_services pad_top_88 pad_bottom_88">
                    <div className="sect_header">
                        <div>
                            <h2 className="sect_title">Services</h2>
                            <div className="sect_info">Core Foundations</div>
                        </div>
                        <Link
                            href={`/${locale}/services`}
                            className="btn_item w_auto btn_more white"
                        >
                            <span className="btn_icon">All services</span>
                        </Link>
                    </div>
                    <div className="row_item gap_32">
                        {services.map((item, index) => (
                            <div
                                className="col_item"
                                key={`${item.slug}-${index}`}
                            >
                                <ServiceCard
                                    title={item.title}
                                    description={item.description}
                                    image={item.image}
                                    slug={item.slug}
                                    more={item.more}
                                    locale={locale}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Services */}

            <div className="border_line"></div>

            {/* Trainings */}
            <div className="main_center" id="trainings">
                <div className="section_wrap wrapper_trainings pad_top_88 pad_bottom_88">
                    <div className="sect_header">
                        <div>
                            <h2 className="sect_title">Trainings</h2>
                            <div className="sect_info">Growing the Talent</div>
                        </div>
                        <Link
                            href={`/${locale}/trainings`}
                            className="btn_item w_auto btn_more white"
                        >
                            <span className="btn_icon">All trainings</span>
                        </Link>
                    </div>
                    <div className="display_flex gap_16">
                        {trainings.map((item, index) => (
                            <div
                                className="col_item"
                                key={`${item.slug}-${index}`}
                            >
                                <TrainingCard
                                    title={item.title}
                                    subtitle={item.subtitle}
                                    description={item.description}
                                    image={item.image}
                                    slug={item.slug}
                                    locale={locale}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Trainings */}

            <div className="border_line"></div>

            {/* Testimonials */}
            <div className="main_center" id="testimonial">
                <div className="section_wrap pad_top_88 pad_bottom_88">
                    <div className="sect_header">
                        <div>
                            <div
                                className={styles.msh_pin}
                                style={{ marginBottom: "16px" }}
                            >
                                What teams say after the transition
                            </div>
                            <h2 className="sect_title">Testimonials:</h2>
                            <div className="sect_info">The Proof </div>
                        </div>
                    </div>
                    <div className="sect_body">
                        <SliderTestimonial />
                    </div>
                </div>
            </div>
            {/* Testimonials */}

            <div className="border_line"></div>

            {/* About Us */}
            <div className="main_center" id="about">
                <div className="section_wrap wrapper_services pad_top_88 pad_bottom_88">
                    <div className="sect_header">
                        <div>
                            <h2 className="sect_title">About Us</h2>
                            <div className="sect_info">The Team & Mission</div>
                        </div>
                    </div>
                    <div className="display_flex gap_32">
                        <div className={`${styles.about_item} ${styles.black}`}>
                            <div className={styles.about_item_icon}>
                                <Image
                                    src="/assets/images/about_1.png"
                                    alt="About"
                                    width={132}
                                    height={132}
                                    unoptimized
                                />
                            </div>
                            <div className={styles.about_item_content}>
                                <h6 className={styles.abt_item_title}>
                                    The Mission
                                </h6>
                                <p className={styles.abt_item_info}>
                                    From local dev to production-ready clusters.
                                </p>
                            </div>
                        </div>
                        <div className={`${styles.about_item} ${styles.green}`}>
                            <div className={styles.about_item_icon}>
                                <Image
                                    src="/assets/images/about_1.png"
                                    alt="About"
                                    width={132}
                                    height={132}
                                    unoptimized
                                />
                            </div>
                            <div className={styles.about_item_content}>
                                <h6 className={styles.abt_item_title}>
                                    The Mission
                                </h6>
                                <p className={styles.abt_item_info}>
                                    From local dev to production-ready clusters.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* About Us */}

            <div className="border_line"></div>

            {/* Our team */}
            <div className="main_center">
                <div className="section_wrap wrapper_services pad_top_88 pad_bottom_88">
                    <div className="sect_header">
                        <div>
                            <h2 className="sect_title">Our team</h2>
                            <div className="sect_info">is our business</div>
                        </div>
                    </div>
                    <div className="row_item gap_32">
                        {teams.map((item, index) => (
                            <div className="col_item" key={`${index}`}>
                                <TeamCard
                                    name={item.name}
                                    position={item.position}
                                    description={item.description}
                                    image={item.image}
                                    linkedinUrl={item.linkedinUrl}
                                    locale={locale}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            {/* Our team */}

            <div className="border_line"></div>

            {/* Partners */}
            <div className="main_center pad_top_88">
                <SliderPartner />
            </div>
            {/* Partners */}

            {/* Contact Form*/}
            <div className="main_center pad_top_88 pad_bottom_88" id="contact">
                <ContactForm />
            </div>
            {/* Contact Form*/}
        </>
    );
}
