import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Yindee Frame Customizer | เครื่องมือออกแบบกรอบรูปออนไลน์ขนาด 4x6 นิ้ว",
  description: "ออกแบบและปรับแต่งกรอบรูปสำหรับสั่งทำออนไลน์ขนาด 10x15 ซม. (4x6 นิ้ว) ของร้าน Yindee Frame ได้อย่างสะดวกรวดเร็วตามต้องการ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
