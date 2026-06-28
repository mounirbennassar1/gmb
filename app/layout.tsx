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

// Absolute base for og:image / icons. Vercel sets these automatically; falls
// back to a configurable URL, then localhost for dev.
const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
const siteUrl = vercelUrl
  ? `https://${vercelUrl}`
  : process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const TITLE = "عيادات د. مها دحلان للجلدية والتجميل بجدة";
const DESC = "شاركنا رأيك في تجربتك مع عيادات د. مها دحلان، وأضف تقييمك على Google.";

// Favicon / app icons come from app/icon.png and app/apple-icon.png, and the
// link-preview image from app/opengraph-image.tsx (all from public/logo.png).
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "قيّم تجربتك | عيادات د. مها دحلان",
  description: DESC,
  openGraph: {
    type: "website",
    locale: "ar_SA",
    siteName: "عيادات د. مها دحلان",
    title: TITLE,
    description: DESC,
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESC,
  },
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
