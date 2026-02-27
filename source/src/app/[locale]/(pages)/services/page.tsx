import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import ServiceCard from "@/components/ServiceCard/Card";
import styles from "./page.module.css";

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

export default async function ServicesPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);

    return (
        <div className={`section_wrap margin_bottom_24`}>
            {/* Services */}
            <div className="main_center">
                <div className="section_wrap wrapper_services pad_top_48 pad_bottom_88">
                    <div className="sect_header">
                        <div>
                            <h2 className="sect_title">Services</h2>
                            <div className="sect_info">Core Foundations</div>
                        </div>
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
        </div>
    );
}
