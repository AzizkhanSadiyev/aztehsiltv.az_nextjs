"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface PaginationProps {
    totalItems: number;
    itemsPerPage: number;
    currentPage: number;
    basePath: string;
}

export default function Pagination({
    totalItems,
    itemsPerPage,
    currentPage,
    basePath,
}: PaginationProps) {
    const searchParams = useSearchParams();
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    if (totalPages <= 1) {
        return null;
    }

    // Create URL with existing search params and new page
    const createPageUrl = (page: number) => {
        const params = new URLSearchParams(searchParams.toString());
        if (page === 1) {
            params.delete("page");
        } else {
            params.set("page", page.toString());
        }
        const queryString = params.toString();
        return queryString ? `${basePath}?${queryString}` : basePath;
    };

    // Calculate which page numbers to show
    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const maxVisiblePages = 5;

        if (totalPages <= maxVisiblePages + 2) {
            // Show all pages if total is small
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage > 3) {
                pages.push("...");
            }

            // Show pages around current page
            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 2) {
                pages.push("...");
            }

            // Always show last page
            pages.push(totalPages);
        }

        return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
        <div className="sect_footer">
            <div className="pagination">
                <ul className="pagination_list">
                    {/* Previous button */}
                    <li
                        className={`first-a ${currentPage === 1 ? "disabled" : ""}`}
                    >
                        {currentPage > 1 ? (
                            <Link href={createPageUrl(currentPage - 1)}></Link>
                        ) : (
                            <span></span>
                        )}
                    </li>

                    {/* Page numbers */}
                    {pageNumbers.map((page, index) => {
                        if (page === "...") {
                            return (
                                <li
                                    key={`ellipsis-${index}`}
                                    className="ellipsis"
                                >
                                    <span>...</span>
                                </li>
                            );
                        }

                        const pageNum = page as number;
                        return (
                            <li
                                key={pageNum}
                                className={
                                    currentPage === pageNum ? "active" : ""
                                }
                            >
                                <Link href={createPageUrl(pageNum)}>
                                    {pageNum}
                                </Link>
                            </li>
                        );
                    })}

                    {/* Next button */}
                    <li
                        className={`last-a ${currentPage === totalPages ? "disabled" : ""}`}
                    >
                        {currentPage < totalPages ? (
                            <Link href={createPageUrl(currentPage + 1)}></Link>
                        ) : (
                            <span></span>
                        )}
                    </li>
                </ul>
            </div>
        </div>
    );
}
