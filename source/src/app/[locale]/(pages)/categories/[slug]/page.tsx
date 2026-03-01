import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { notFound } from "next/navigation";
import styles from "./page.module.css";

import PageTopItems from "@/components/PageTopItems/PageTopItems";
import NewsCard from "@/components/NewsCard/Card";

type NewsItem = {
    id: number;
    title: string;
    image: string;
    views: string;
    date: string;
    category: string;
    duration: string;
    slug: string;
    type: "video" | "list";
};

const similarItems: NewsItem[] = [
    {
        id: 1,
        title: "Konqres kend mektebleri ucun Fondu yeniden berpa etdi",
        image: "/assets/images/card_3.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Imtahan",
        duration: "00:35",
        slug: "konqres-kend-mektebleri-fond",
        type: "video",
    },
    {
        id: 2,
        title: "STEAM laboratoriyalari ucun yeni tecrube setleri paylandi",
        image: "/assets/images/card_4.png",
        views: "540 K baxis",
        date: "25 Dek 2026",
        category: "Tehsil",
        duration: "00:42",
        slug: "steam-laboratoriyalari-tecrube-setleri",
        type: "video",
    },
    {
        id: 3,
        title: '"Silikon Sehrasi"nda bir mekteb sagirdleri yarimkecirici buna qosulmaga hazirlayir',
        image: "/assets/images/card_1.png",
        views: "1.2 M baxis",
        date: "28 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "silikon-sehrasi-mekteb-sagirdleri",
        type: "video",
    },
    {
        id: 4,
        title: "Tramp mekteb naharlarina tam sud qaytaran qanun imzaladi",
        image: "/assets/images/card_2.png",
        views: "960 K baxis",
        date: "27 Dek 2026",
        category: "Verilis",
        duration: "00:35",
        slug: "tramp-mekteb-naharlari-sud-qanun",
        type: "video",
    },
];
const trainingsData: Record<
    string,
    {
        title: string;
        subtitle: string;
        image: string;
        duration: string;
        level: string;
        sectionTitle: string;
        description: string[];
        topicsTitle: string;
        topics: string[];
        footer: string;
    }
> = {
    "kubernetes-mastery": {
        title: "Kubernetes Mastery",
        subtitle: "From local dev to production-ready clusters.",
        image: "/assets/icons/training_icon.svg",
        duration: "4 weeks",
        level: "Beginner to Intermediate",
        sectionTitle: "Course Overview:",
        description: [
            "This comprehensive training program introduces you to the core concepts and practices of DevOps. You'll learn how to bridge the gap between development and operations, enabling faster and more reliable software delivery.",
            "Through hands-on exercises and real-world scenarios, you'll gain practical experience with industry-standard tools and methodologies that are essential for modern software development teams.",
        ],
        topicsTitle: "What you'll learn:",
        topics: [
            "Introduction to DevOps culture and principles",
            "Version control with Git and collaborative workflows",
            "Continuous Integration (CI) pipeline setup and best practices",
            "Continuous Deployment (CD) strategies and automation",
            "Docker containerization fundamentals",
            "Kubernetes basics: pods, services, deployments",
            "Infrastructure as Code (IaC) introduction",
            "Monitoring and logging fundamentals",
        ],
        footer: "🎓 Certificate included | 💻 Hands-on labs | 👥 Group discussions",
    },

    "modern-devops-culture": {
        title: "Modern DevOps Culture",
        subtitle: "Shifting mindsets along with the tech stack.",
        image: "/assets/icons/training_icon.svg",
        duration: "6 weeks",
        level: "Intermediate",
        sectionTitle: "Course Overview:",
        description: [
            "Master the fundamentals of cloud computing across the three major platforms: AWS, Azure, and Google Cloud Platform. This training provides a vendor-neutral approach to understanding cloud architecture principles.",
            "You'll learn to design scalable, resilient, and cost-effective cloud solutions while understanding the trade-offs between different cloud services and deployment models.",
        ],
        topicsTitle: "What you'll learn:",
        topics: [
            "Cloud computing models: IaaS, PaaS, SaaS",
            "AWS core services: EC2, S3, RDS, Lambda",
            "Azure fundamentals: VMs, Blob Storage, Azure Functions",
            "GCP essentials: Compute Engine, Cloud Storage, Cloud Functions",
            "Multi-cloud and hybrid cloud strategies",
            "Cloud security best practices and compliance",
            "Cost optimization and resource management",
            "High availability and disaster recovery patterns",
        ],
        footer: "🎓 Certificate included | ☁️ Multi-cloud labs | 📊 Architecture workshops",
    },

    "sre-foundations": {
        title: "SRE Foundations",
        subtitle: "Reliability as a feature, not an afterthought.",
        image: "/assets/icons/training_icon.svg",
        duration: "5 weeks",
        level: "Intermediate to Advanced",
        sectionTitle: "Course Overview:",
        description: [
            "Site Reliability Engineering (SRE) combines software engineering with IT operations to build and maintain highly reliable systems. This training covers the principles and practices pioneered by Google and adopted by leading tech companies worldwide.",
            "You'll learn how to implement SRE practices in your organization, from defining service level objectives to managing incidents and building a culture of reliability.",
        ],
        topicsTitle: "What you'll learn:",
        topics: [
            "SRE principles and the role of an SRE",
            "Service Level Indicators (SLIs) and Service Level Objectives (SLOs)",
            "Error budgets and risk management",
            "Observability: metrics, logs, and traces",
            "Alerting strategies and reducing alert fatigue",
            "Incident management and on-call practices",
            "Post-incident reviews and blameless postmortems",
            "Capacity planning and performance optimization",
        ],
        footer: "🎓 Certificate included | 🔧 Real incident simulations | 📈 Monitoring workshops",
    },

    "devops-roadmapping": {
        title: "DevOps Roadmapping",
        subtitle: "From strategy to shipped outcomes.",
        image: "/assets/icons/training_icon.svg",
        duration: "3 weeks",
        level: "All levels",
        sectionTitle: "Course Overview:",
        description: [
            "Agile methodologies have transformed how teams deliver software. This training provides a deep dive into Agile principles and the Scrum framework, equipping you with the skills to lead or participate effectively in Agile teams.",
            "Whether you're a developer, project manager, or product owner, you'll learn practical techniques for improving team collaboration, delivering value incrementally, and adapting to change.",
        ],
        topicsTitle: "What you'll learn:",
        topics: [
            "Agile Manifesto and principles",
            "Scrum framework: roles, events, and artifacts",
            "Sprint planning and backlog management",
            "Daily standups and effective communication",
            "Sprint reviews and stakeholder engagement",
            "Retrospectives and continuous improvement",
            "User stories and acceptance criteria",
            "Agile metrics and team velocity",
        ],
        footer: "🎓 Certificate included | 🎮 Scrum simulations | 👥 Team exercises",
    },
    "silikon-sehrasi-mekteb-sagirdleri": {
        title: "Silikon Sehrasi mekteb sagirdleri",
        subtitle: "Student initiatives and semiconductor clubs.",
        image: "/assets/icons/training_icon.svg",
        duration: "Updated",
        level: "All levels",
        sectionTitle: "Overview:",
        description: [
            "Coverage of student projects and hands-on learning programs.",
            "Includes key takeaways and practical insights.",
        ],
        topicsTitle: "Highlights:",
        topics: [
            "Student-led projects",
            "STEM clubs and labs",
            "Mentorship programs",
            "Community impact",
        ],
        footer: "Updated regularly | Editorial coverage",
    },
    "tramp-mekteb-naharlari-sud-qanun": {
        title: "Mekteb naharlari ve sud qanunu",
        subtitle: "Policy updates and school nutrition impact.",
        image: "/assets/icons/training_icon.svg",
        duration: "Updated",
        level: "All levels",
        sectionTitle: "Overview:",
        description: [
            "Policy changes related to school meals and nutrition.",
            "Impact analysis and stakeholder responses.",
        ],
        topicsTitle: "Highlights:",
        topics: [
            "Policy timeline",
            "Nutrition standards",
            "School operations impact",
            "Community feedback",
        ],
        footer: "Updated regularly | Editorial coverage",
    },
    "konqres-kend-mektebleri-fond": {
        title: "Kend mektebleri fondunun berpa olunmasi",
        subtitle: "Funding updates and rural education.",
        image: "/assets/icons/training_icon.svg",
        duration: "Updated",
        level: "All levels",
        sectionTitle: "Overview:",
        description: [
            "Coverage of funding decisions affecting rural schools.",
            "Includes analysis, interviews, and data highlights.",
        ],
        topicsTitle: "Highlights:",
        topics: [
            "Funding decisions and timelines",
            "School infrastructure needs",
            "Community impact",
            "Next steps and follow-ups",
        ],
        footer: "Updated regularly | Editorial coverage",
    },
    "steam-laboratoriyalari-tecrube-setleri": {
        title: "STEAM laboratoriyalari tecrube setleri",
        subtitle: "New kits, methods, and classroom use.",
        image: "/assets/icons/training_icon.svg",
        duration: "Updated",
        level: "All levels",
        sectionTitle: "Overview:",
        description: [
            "Highlights of new STEAM lab kits and teaching methods.",
            "Guidance on classroom integration.",
        ],
        topicsTitle: "Highlights:",
        topics: [
            "Hands-on lab activities",
            "Teacher guides",
            "Equipment and safety",
            "Student outcomes",
        ],
        footer: "Updated regularly | Editorial coverage",
    },
    "silikon-sehrasi-mekteb-sagirdleri-2": {
        title: "Silikon Sehrasi mekteb sagirdleri",
        subtitle: "Student projects and technology clubs.",
        image: "/assets/icons/training_icon.svg",
        duration: "Updated",
        level: "All levels",
        sectionTitle: "Overview:",
        description: [
            "Student-led innovation and technology learning.",
            "Project showcases and mentorship highlights.",
        ],
        topicsTitle: "Highlights:",
        topics: [
            "Innovation showcases",
            "Mentorship and guidance",
            "Lab access and resources",
            "Community engagement",
        ],
        footer: "Updated regularly | Editorial coverage",
    },
    "tramp-mekteb-naharlari-sud-qanun-2": {
        title: "Mekteb naharlari ve sud qanunu",
        subtitle: "Nutrition policy updates for schools.",
        image: "/assets/icons/training_icon.svg",
        duration: "Updated",
        level: "All levels",
        sectionTitle: "Overview:",
        description: [
            "Updates on school meal policies and nutrition standards.",
            "Operational changes and implementation notes.",
        ],
        topicsTitle: "Highlights:",
        topics: [
            "Policy updates",
            "Implementation guidance",
            "School operations",
            "Feedback and outcomes",
        ],
        footer: "Updated regularly | Editorial coverage",
    },
    "konqres-kend-mektebleri-fond-2": {
        title: "Kend mektebleri fondunun berpa olunmasi",
        subtitle: "Rural education and funding initiatives.",
        image: "/assets/icons/training_icon.svg",
        duration: "Updated",
        level: "All levels",
        sectionTitle: "Overview:",
        description: [
            "Funding initiatives and their effects on rural schools.",
            "Follow-up coverage and analysis.",
        ],
        topicsTitle: "Highlights:",
        topics: [
            "Funding allocation",
            "School improvement plans",
            "Local stakeholder input",
            "Long-term impact",
        ],
        footer: "Updated regularly | Editorial coverage",
    },
    "steam-laboratoriyalari-tecrube-setleri-2": {
        title: "STEAM laboratoriyalari tecrube setleri",
        subtitle: "Hands-on learning and lab resources.",
        image: "/assets/icons/training_icon.svg",
        duration: "Updated",
        level: "All levels",
        sectionTitle: "Overview:",
        description: [
            "Practical lab resources and learning outcomes.",
            "Tips for teachers and students.",
        ],
        topicsTitle: "Highlights:",
        topics: [
            "Experiment kits",
            "Classroom setup",
            "Teaching tips",
            "Student engagement",
        ],
        footer: "Updated regularly | Editorial coverage",
    },
};

export default async function TrainingDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;

    // Check if training exists
    const training = trainingsData[slug];
    if (!training) {
        notFound();
    }

    const dict = await getDictionary(locale as Locale);

    return (
        <div className="section_wrap">

            {/* Page top items */}
            <div className="main_center">
                <PageTopItems />
            </div>
            {/* Page top items */}

            <div className="main_center">
                <div className={styles.service_detail_wrap}>
                    {/* Right - Content */}
                    <div className={styles.service_content_wrap}>
                        <h1 className={styles.service_title}>
                            {training.title}
                        </h1>
                        <p className={styles.service_subtitle}>
                            {training.subtitle}
                        </p>

                        <div className={styles.service_content_text}>
                            <h2>{training.sectionTitle}</h2>

                            {training.description.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}

                            <h3>{training.topicsTitle}</h3>

                            <ul>
                                {training.topics.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>

                            <p>{training.footer}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Similar Videos */}
            <div className="main_center pad_bottom_40">
                <section className="detail_similar">
                    <div className="section_wrap">
                        <div className="sect_header clearfix">
                            <div className="sect_title">Oxşar videolar</div>
                        </div>
                        <div className="sect_body">
                            <div className="row_item gap_20">
                                {similarItems.map((item) => (
                                    <NewsCard
                                        key={item.id}
                                        title={item.title}
                                        image={item.image}
                                        views={item.views}
                                        date={item.date}
                                        category={item.category}
                                        duration={item.duration}
                                        slug={item.slug}
                                        type={item.type}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            {/* Similar Videos */}

        </div>
    );
}
