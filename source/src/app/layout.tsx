import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "AztəhsilTv.az - Azərbaycanın ən etibarlı video portalı",
    description: "Azərbaycanın ən etibarlı video portalı. Təhsil, metodik korpus, podkast və daha çox mövzularda geniş video kolleksiyası.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html>
            <body>{children}</body>
        </html>
    );
}
