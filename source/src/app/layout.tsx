import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Stafig",
    description: "Azərbaycanın ən etibarlı xəbər portalı",
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
