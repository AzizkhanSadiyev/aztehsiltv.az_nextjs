import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { notFound } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

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
        </div>
    );
}
