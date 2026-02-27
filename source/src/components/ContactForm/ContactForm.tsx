"use client";

import React, { useState } from "react";
import Image from "next/image";
import styles from "./contact.module.css";

type InterestOption = "All" | "Service" | "Training" | "Recruiting";

export default function ContactForm() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        message: "",
    });
    const [selectedInterest, setSelectedInterest] =
        useState<InterestOption>("All");

    const interestOptions: InterestOption[] = [
        "All",
        "Service",
        "Training",
        "Recruiting",
    ];

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Form submitted:", {
            ...formData,
            interest: selectedInterest,
        });
        // Handle form submission here
    };

    return (
        <div className={styles.contactSection}>
            <div className={styles.contactContainer}>
                {/* Left Side */}
                <div className={styles.contactLeft}>
                    <div className={styles.contactLabel}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M15.1231 1.00005C13.6733 0.999368 12.6658 0.999373 11.7442 1.38091C10.8224 1.76275 10.1091 2.47596 9.08406 3.50201L5.25398 7.33209C4.27012 8.31592 3.47593 9.10865 2.90632 9.8106C2.31815 10.5354 1.89592 11.2501 1.74031 12.0938C1.62986 12.693 1.62986 13.3071 1.74031 13.9063C1.89592 14.75 2.31815 15.4647 2.90632 16.1895C3.47593 16.8914 4.27015 17.6842 5.25398 18.668L5.3321 18.7462C6.31595 19.73 7.10866 20.5242 7.81062 21.0938C8.53544 21.682 9.25011 22.1042 10.0938 22.2598C10.693 22.3703 11.3071 22.3703 11.9063 22.2598C12.75 22.1042 13.4647 21.682 14.1895 21.0938C14.8914 20.5242 15.6843 19.7299 16.668 18.7462L20.4981 14.9161C21.5242 13.891 22.2374 13.1778 22.6192 12.2559C23.0008 11.3343 23.0008 10.3268 23.0001 8.87701V7.92974C23.0001 6.57562 22.9998 5.45803 22.8809 4.57427C22.7561 3.64677 22.4841 2.82785 21.8282 2.17193C21.1723 1.51602 20.3533 1.24399 19.4259 1.1192C18.5421 1.00038 17.4245 1.00001 16.0704 1.00005H15.1231ZM15.6993 6.00006C16.6379 6.00006 17.4 6.76077 17.4005 7.69927C17.4005 8.63816 16.6382 9.40045 15.6993 9.40045C14.7607 9.40005 14.0001 8.63792 14.0001 7.69927C14.0005 6.76102 14.761 6.00045 15.6993 6.00006Z"
                                fill="#BFD2A6"
                            />
                        </svg>
                        <span>Contact us</span>
                    </div>
                    <h2 className={styles.contactTitle}>
                        Get in touch with us!
                    </h2>
                    <div className={styles.contactIllustration}>
                        <Image
                            src="/assets/images/contact_bg.png"
                            alt="Contact Form"
                            width={240}
                            height={240}
                        />
                    </div>
                </div>

                {/* Right Side - Form */}
                <div className={styles.contactRight}>
                    <form
                        onSubmit={handleSubmit}
                        className={styles.contactForm}
                    >
                        <div className={styles.formRow}>
                            <div className={styles.formGroup}>
                                <label
                                    htmlFor="name"
                                    className={styles.formLabel}
                                >
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Enter your name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>
                            <div className={styles.formGroup}>
                                <label
                                    htmlFor="email"
                                    className={styles.formLabel}
                                >
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="Enter your e-mail"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className={styles.formInput}
                                />
                            </div>
                        </div>

                        <div className={styles.formGroup}>
                            <label
                                htmlFor="message"
                                className={styles.formLabel}
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                placeholder="Enter your message"
                                value={formData.message}
                                onChange={handleInputChange}
                                className={styles.formTextarea}
                                rows={4}
                            />
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.formLabel}>Interest</label>
                            <div className={styles.interestOptions}>
                                {interestOptions.map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        className={`${styles.interestButton} ${
                                            selectedInterest === option
                                                ? styles.interestActive
                                                : ""
                                        }`}
                                        onClick={() =>
                                            setSelectedInterest(option)
                                        }
                                    >
                                        {option}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className={styles.formFooter}>
                            <p className={styles.privacyText}>
                                By clicking "Send Message", you agree that
                                <br />
                                Strafig may contact you about your request.
                            </p>
                            <button
                                type="submit"
                                className={styles.submitButton}
                            >
                                Send message
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
