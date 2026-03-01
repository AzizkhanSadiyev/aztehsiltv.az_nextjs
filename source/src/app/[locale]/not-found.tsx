import Link from "next/link";
import Image from "next/image";

export default function NotFound() {
    return (
        <div className="section_wrap wrap_error_page pad_bottom_40 pad_top_40">
            <div className="main_center">
                <div className="sect_body">
                    <div className="error_page">
                        <div className="error_content">
                            <div className="error_img">
                                <Image
                                    src="/assets/icons/404.svg"
                                    alt="404 - Page Not Found"
                                    width={160}
                                    height={190}
                                    priority
                                />
                            </div>
                            <div className="error_title">
                                Oops! Page not found
                            </div>
                            <div className="error_info">
                                Sorry, but the page you are looking for is not
                                found. Please, make sure you have typed the
                                current URL.
                            </div>
                        </div>
                        <Link href="/" className="back_home_btn">
                            <span>Back to Home</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
