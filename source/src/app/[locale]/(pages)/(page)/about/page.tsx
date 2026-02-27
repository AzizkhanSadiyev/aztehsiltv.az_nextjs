import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import styles from "../page.module.css";

export default async function AboutPage({
    params,
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const dict = await getDictionary(locale as Locale);

    return (
        <div className={`${styles.staticPage} section_wrap margin_bottom_24`}>
            <div className="main_center">
                <div className={styles.content}>
                    <div className="sect_header">
                        <h1 className="sect_title">About Us</h1>
                    </div>

                    <p>
                        We help teams ship reliable software faster by combining
                        modern DevOps practices with hands-on, outcome-driven
                        training. Our programs cover Kubernetes, SRE, and
                        cloud-native workflows, with clear roadmaps that turn
                        technical debt into market-ready features.
                    </p>

                    <p>
                        From fundamentals to production-ready systems, we focus
                        on practical skills: automation, observability,
                        scalability, and resilient delivery. Whether you’re an
                        individual leveling up or a company building stronger
                        engineering culture, we provide the guidance, labs, and
                        support to make progress measurable and sustainable.
                    </p>
                </div>
            </div>
        </div>
    );
}
