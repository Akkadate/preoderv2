import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { CartController } from "@/components/cart-controller";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Merchant SaaS Platform",
  description: "ระบบ Pre-order และ Daily Menu สำหรับร้านค้า",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body
        className={`${prompt.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <div className="fixed top-4 right-4 z-50">
          <CartController />
        </div>
        {children}
      </body>
    </html>
  );
}
