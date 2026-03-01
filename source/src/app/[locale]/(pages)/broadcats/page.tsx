
import Link from "next/link";
import Image from "next/image";
import { type Locale } from "@/i18n/config";
import { getDictionary } from "@/i18n/getDictionary";
import BroadcastCard from "@/components/BroadcastCard/Card";
import styles from "./page.module.css";
import { BroadcastItem } from "@/components/SliderBroadcast/slider";
    const broadcastItems: BroadcastItem[] = [
        {
            id: 1,
            title: "Metodik korpu",
            count: "364 video",
            image: "/assets/images/board_1.png",
            slug: "#",
        },
        {
            id: 2,
            title: "Usaqlar ve biz",
            count: "128 video",
            image: "/assets/images/board_2.png",
            slug: "#",
        },
        {
            id: 3,
            title: "Podkast",
            count: "92 video",
            image: "/assets/images/board_3.png",
            slug: "#",
        },
        {
            id: 4,
            title: "Tehsil saati",
            count: "56 video",
            image: "/assets/images/board_4.png",
            slug: "#",
        },
        {
            id: 5,
            title: "Tehsil saati",
            count: "56 video",
            image: "/assets/images/board_5.png",
            slug: "#",
        },
        {
            id: 6,
            title: "Podkast",
            count: "92 video",
            image: "/assets/images/board_3.png",
            slug: "#",
        },
        {
            id: 7,
            title: "Tehsil saati",
            count: "56 video",
            image: "/assets/images/board_4.png",
            slug: "#",
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
                <div className="section_wrap">
                    <div className="sect_header">
                        <div>
                            <h1 className="sect_title">Verilişlər</h1>
                        </div>
                    </div>
                    <div className="row_item gap_20">
                        {broadcastItems.map((item, index) => (
                            <div
                                key={`${item.slug}-${index}`}
                            >
                                <BroadcastCard
                                    title={item.title}
                                    count={item.count}
                                    image={item.image}
                                    slug={item.slug}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="sect_footer">
                        <Link
                            href="#"
                            title="AztehsilTv"
                            className="more load_more_btn"
                        >
                            Daha çox
                        </Link>
                    </div>
                </div>
            </div>
            {/* Trainings */}
        </div>
    );
}
