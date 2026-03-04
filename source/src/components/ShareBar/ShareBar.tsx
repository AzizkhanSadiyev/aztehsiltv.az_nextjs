"use client";

import Image from "next/image";

export type ShareItem = {
    id: string;
    label: string;
    name: string;
    icon: string;
    href: string;
    copy?: boolean;
};

export default function ShareBar({
    items,
    shareLabel,
}: {
    items: ShareItem[];
    shareLabel: string;
}) {
    const handleCopy = async (href: string) => {
        if (!href || href === "#") return;
        try {
            await navigator.clipboard.writeText(href);
        } catch {
            window.prompt("Copy link", href);
        }
    };

    return (
        <section className="share-section margin_top_18 margin_bottom_18">
            <div className="share-title">{`${shareLabel}:`}</div>

            <div className="share-list">
                {items.map((item) =>
                    item.copy ? (
                        <button
                            key={item.id}
                            type="button"
                            className="share-item"
                            aria-label={item.label}
                            onClick={() => handleCopy(item.href)}
                        >
                            <span className="share-icon">
                                <Image
                                    src={item.icon}
                                    alt={item.name}
                                    width={24}
                                    height={24}
                                />
                            </span>
                        </button>
                    ) : (
                        <a
                            key={item.id}
                            className="share-item"
                            href={item.href || "#"}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={item.label}
                        >
                            <span className="share-icon">
                                <Image
                                    src={item.icon}
                                    alt={item.name}
                                    width={24}
                                    height={24}
                                />
                            </span>
                        </a>
                    ),
                )}
            </div>
        </section>
    );
}
