import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import { notFound } from "next/navigation";
import Image from "next/image";
import styles from "./page.module.css";

// Services data
const servicesData: Record<
    string,
    {
        title: string;
        subtitle: string;
        image: string;
        sectionTitle: string;
        description: string[];
        deliverTitle: string;
        deliverItems: string[];
        footer: string;
    }
> = {
    "sre-infrastructure": {
        title: "SRE & Infrastructure",
        subtitle:
            "High-availability systems that wrap your legacy core in modern resilience.",
        image: "/assets/images/card_1.png",
        sectionTitle: "Services we offer:",
        description: [
            'Legacy systems don\'t fail loudly — they fail slowly: a queue starts backing up, latency creeps in, a "small" deploy turns into an incident. We step in before that happens. Strafig builds reliability as a living layer around your existing core — not a risky rewrite, but a calm, incremental upgrade that makes production predictable.',
            "Think of it like roots finding structure: we start with visibility (metrics ‣ logs ‣ traces), then turn signals into action (alerts ‣ runbooks ‣ automation), and finally shape resilience into the platform itself (redundancy ‣ failover ‣ scaling). The result is a system that can breathe under load, recover under pressure, and keep shipping without fear.",
        ],
        deliverTitle: "What we deliver (in practice):",
        deliverItems: [
            'Reliability baseline → map risks, bottlenecks, and the "unknown unknowns"',
            "Observability → dashboards, alerting, tracing, and actionable signals (not noise)",
            "SLOs / SLIs / Error Budgets → reliability targets teams can actually operate with",
            "Incident readiness → on-call playbooks, runbooks, postmortems, continuous improvement",
            "High availability → redundancy, failover patterns, capacity planning, performance tuning",
            "Infrastructure automation → IaC, safer deploys, rollbacks, and repeatable environments",
        ],
        footer: "✅ Fewer incidents. ⚡ Faster releases. 🔄 Clear operational confidence — one root at a time.",
    },
    "devops-transformation": {
        title: "DevOps Transformation",
        subtitle: 'Moving from manual to automated without the "Big Bang" risk',
        image: "/assets/images/card_2.png",
        sectionTitle: "Services we offer:",
        description: [
            "DevOps isn't just about tools — it's about changing how teams build, ship, and operate software. We help organizations move from fragmented, manual processes to streamlined, automated workflows without disrupting what already works.",
            "Our approach is incremental: we assess your current state, identify quick wins, and build momentum through small, visible improvements. CI/CD pipelines, infrastructure as code, automated testing — each piece connects to form a cohesive delivery system.",
        ],
        deliverTitle: "What we deliver (in practice):",
        deliverItems: [
            "CI/CD pipelines → automated builds, tests, and deployments",
            "Infrastructure as Code → reproducible, version-controlled environments",
            "Containerization → Docker, Kubernetes, orchestration strategies",
            "GitOps workflows → declarative deployments, audit trails, rollback capabilities",
            "Team enablement → training, documentation, and cultural transformation",
            "Metrics & feedback loops → deployment frequency, lead time, change failure rate",
        ],
        footer: "✅ Faster delivery. ⚡ Reduced manual work. 🔄 Teams that ship with confidence.",
    },
    "product-management": {
        title: "Product Management",
        subtitle:
            "Roadmaps that bridge the gap between technical debt and market-ready features.",
        image: "/assets/images/card_3.png",
        sectionTitle: "Services we offer:",
        description: [
            "Great products don't happen by accident. They emerge from clear vision, disciplined prioritization, and tight feedback loops between engineering and the market. We help teams build products that matter — balancing innovation with sustainability.",
            "Whether you're launching something new or evolving an existing product, we bring structure to chaos: discovery frameworks, roadmap alignment, stakeholder communication, and metrics that actually drive decisions.",
        ],
        deliverTitle: "What we deliver (in practice):",
        deliverItems: [
            "Product discovery → user research, problem validation, opportunity mapping",
            "Roadmap strategy → prioritization frameworks, OKRs, outcome-driven planning",
            "Technical debt management → balancing new features with platform health",
            "Stakeholder alignment → communication cadences, expectation management",
            "Launch planning → go-to-market coordination, feature flags, gradual rollouts",
            "Product analytics → metrics definition, instrumentation, insight generation",
        ],
        footer: "✅ Clear direction. ⚡ Aligned teams. 🔄 Products that solve real problems.",
    },
    development: {
        title: "Development",
        subtitle: "Building software that responds to your demand",
        image: "/assets/images/card_4.png",
        sectionTitle: "Services we offer:",
        description: [
            "Software development is more than writing code — it's about building systems that scale, adapt, and deliver value over time. We bring engineering excellence to every project, whether it's a greenfield application or modernizing legacy systems.",
            "Our teams work as extensions of yours: same standards, same goals, same commitment to quality. We focus on clean architecture, maintainable code, and practices that make future changes easier, not harder.",
        ],
        deliverTitle: "What we deliver (in practice):",
        deliverItems: [
            "Full-stack development → web applications, APIs, microservices",
            "Cloud-native architecture → scalable, resilient, cost-effective systems",
            "Legacy modernization → strangler fig pattern, incremental migration",
            "Code quality → testing strategies, code review, technical documentation",
            "Performance optimization → profiling, caching, database tuning",
            "Security practices → secure coding, vulnerability assessment, compliance",
        ],
        footer: "✅ Quality code. ⚡ Scalable systems. 🔄 Software that grows with your business.",
    },
};

export default async function ServiceDetailPage({
    params,
}: {
    params: Promise<{ locale: string; slug: string }>;
}) {
    const { locale, slug } = await params;

    // Check if service exists
    const service = servicesData[slug];
    if (!service) {
        notFound();
    }

    const dict = await getDictionary(locale as Locale);

    return (
        <div className="section_wrap">
            <div className="main_center">
                <div className={styles.service_detail_wrap}>
                    {/* Left - Image */}
                    <div className={styles.service_image_wrap}>
                        <Image
                            src={service.image}
                            alt={service.title}
                            width={500}
                            height={500}
                            className={styles.service_image}
                        />
                    </div>

                    {/* Right - Content */}
                    <div className={styles.service_content_wrap}>
                        <h1 className={styles.service_title}>
                            {service.title}
                        </h1>
                        <p className={styles.service_subtitle}>
                            {service.subtitle}
                        </p>

                        <div className={styles.service_content_text}>
                            <h2>{service.sectionTitle}</h2>

                            {service.description.map((paragraph, index) => (
                                <p key={index}>{paragraph}</p>
                            ))}

                            <h3>{service.deliverTitle}</h3>

                            <ul>
                                {service.deliverItems.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>

                            <p>{service.footer}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
