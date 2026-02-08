import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "HomeWise AI – Your Family's Invisible Accountant",
  description:
    "Zero manual entry. Just snap a photo. Perfect for busy moms and helpers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.className} tracking-tight text-zinc-50 antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
