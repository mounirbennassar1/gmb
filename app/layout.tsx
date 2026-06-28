import type { Metadata } from "next";
import { Cormorant_Garamond, El_Messiri, IBM_Plex_Sans_Arabic } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const messiri = El_Messiri({
  variable: "--font-messiri",
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
  display: "swap",
});

const plexArabic = IBM_Plex_Sans_Arabic({
  variable: "--font-plex-arabic",
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

// Favicon / app icons come from app/icon.png and app/apple-icon.png
// (Next.js metadata file conventions) — both copies of public/logo.png.
export const metadata: Metadata = {
  title: "قيّم تجربتك | عيادات د. مها دحلان",
  description: "شاركنا رأيك في تجربتك مع عيادات د. مها دحلان للجلدية والتجميل بجدة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${plexArabic.variable} ${messiri.variable} ${cormorant.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
