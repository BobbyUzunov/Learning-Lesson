import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Barakova Luxury Travel | Бутикови луксозни пътувания",
  description:
    "Персонални travel консултации с Богдана Баракова за бутикови луксозни почивки по света.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bg" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
