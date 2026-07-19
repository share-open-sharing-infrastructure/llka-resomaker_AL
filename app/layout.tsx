import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import { ConfigProvider } from "@/context/config-context";
import { OpeningHoursProvider } from "@/context/opening-hours-context";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CartSheet } from "@/components/cart/cart-sheet";
import { Toaster } from "@/components/ui/sonner";
import { config } from "@/lib/config";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: config.meta.title,
  description: config.meta.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
        style={{
          "--brand-accent": config.brand.accent,
          "--primary": config.brand.accent,
          "--ring": config.brand.accent,
        } as React.CSSProperties}
      >
        <ConfigProvider config={config}>
          <OpeningHoursProvider>
            <CartProvider>
              <Header />
              <main className="container flex-1 py-8">{children}</main>
              <Footer />
              <CartSheet />
              <Toaster />
            </CartProvider>
          </OpeningHoursProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}
