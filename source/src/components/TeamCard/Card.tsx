"use client";

import Image from "next/image";
import Link from "next/link";
import type { ElementType } from "react";
import styles from "./card.module.css";

/* ================= TYPES ================= */

type TeamCardProps = {
    name: string;
    position: string;
    description?: string;
    image: string;
    linkedinUrl?: string;
    locale?: string;
    nameAs?: ElementType;
};

/* ================= COMPONENT ================= */

export default function TeamCard({
    name,
    position,
    description,
    image,
    linkedinUrl,
    locale = "az",
    nameAs: NameTag = "h3",
}: TeamCardProps) {
    return (
        <div className={styles.team_card}>
            {/* IMAGE */}
            <div className={styles.team_card_image}>
                <Image
                    src={image}
                    alt={name || "Team member"}
                    width={316}
                    height={398}
                />
                {/* LinkedIn Button */}
                {linkedinUrl && (
                    <Link
                        href={linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.linkedin_button}
                    >
                        <span className={styles.linkedin_icon}>
                            <img
                                src="assets/icons/icon_linkedin.svg"
                                alt="Linkedin"
                                width={20}
                                height={20}
                            />
                        </span>
                        <span className={styles.linkedin_text}>
                            Linkedin profile
                        </span>
                        <span className={styles.linkedin_arrow}>
                            <img
                                src="/assets/icons/arrow_team.svg"
                                alt="Arrow"
                                width={12}
                                height={12}
                            />
                        </span>
                    </Link>
                )}
            </div>

            {/* CONTENT */}
            <div className={styles.team_card_content}>
                {/* POSITION */}
                {position && (
                    <span className={styles.team_card_position}>
                        {position}
                    </span>
                )}

                {/* NAME */}
                {name && (
                    <NameTag className={styles.team_card_name}>{name}</NameTag>
                )}

                {/* DESCRIPTION */}
                {description && (
                    <p className={styles.team_card_description}>
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
