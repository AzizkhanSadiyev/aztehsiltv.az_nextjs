import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import TrainingCard from "@/components/TrainingCard/Card";
import styles from "./page.module.css";
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
    {
        title: "DevOps Roadmapping",
        subtitle: "From strategy to shipped outcomes.",
        description:
            "Roadmaps that bridge the gap between technical debt and market-ready features.",
        image: "/assets/icons/training_icon.svg",
        slug: "devops-roadmapping",
    },
];

export default async function TrainingsPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);

    return (
        <div className={`section_wrap margin_bottom_24`}>
            {/* Trainings */}
            <div className="main_center">
                <div className="section_wrap wrapper_services pad_top_48 pad_bottom_88">
                    <div className="sect_header">
                        <div>
                            <h2 className="sect_title">Trainings</h2>
                            <div className="sect_info">Growing the Talent</div>
                        </div>
                    </div>
                    <div className={styles.trainings_list}>
                        {trainings.map((item, index) => (
                            <div
                                className={styles.trainings_list_item}
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
        </div>
    );
}
