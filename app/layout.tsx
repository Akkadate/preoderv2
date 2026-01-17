import type { Metadata } from "next";
import { Prompt } from "next/font/google";
import "./globals.css";
import { CartController } from "@/components/cart-controller";
import { Providers } from "@/components/providers";

const prompt = Prompt({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin", "thai"],
  variable: "--font-prompt",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PreOrder24 - รับออเดอร์ได้ 24 ชั่วโมง",
  description: "ระบบจัดการออเดอร์สำหรับร้านรับหิ้ว ร้านขนม และร้านอาหาร ไม่พลาดทุกคำสั่งซื้อ แม้คุณหลับไปแล้ว",
  keywords: "pre-order, ระบบรับออเดอร์, ร้านรับหิ้ว, ร้านขนม, ร้านอาหาร, SaaS",
  openGraph: {
    title: "PreOrder24 - รับออเดอร์ได้ 24 ชั่วโมง",
    description: "ระบบจัดการออเดอร์สำหรับร้านรับหิ้ว ร้านขนม และร้านอาหาร",
    type: "website",
  },
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
        <Providers>
          <div className="fixed top-4 right-4 z-50">
            <CartController />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}

