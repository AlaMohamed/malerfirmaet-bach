import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { CookieBanner } from "@/components/CookieBanner";
import { GA4Analytics } from "@/components/GA4Analytics";
import { company } from "@/content/site";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(company.url),
  title: {
    default: `${company.name} — Malerfirma i København og på Sjælland`,
    template: `%s · ${company.name}`,
  },
  description:
    "Erhvervs- og privatmaling i København og på Sjælland. Aftalt pris, aftalt tid, kvalitetsgaranti. Malerfirmaet bag Radisson, Scandic og Carlsberg Byen.",
  keywords: [
    "malerfirma København",
    "malerfirma Sjælland",
    "erhvervsmaling",
    "hotelrenovering",
    "Bach maler",
    "Malerfirmaet Bach",
    "totalrenovering",
  ],
  authors: [{ name: company.name, url: company.url }],
  creator: company.name,
  publisher: company.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "da_DK",
    url: company.url,
    siteName: company.name,
    title: `${company.name} — Malerfirma i København og på Sjælland`,
    description:
      "Malerfirmaet bag Radisson, Scandic og Carlsberg Byen. Aftalt pris, aftalt tid, kvalitetsgaranti.",
    images: [{ url: "/images/shared/hero-novo-kalundborg.jpg", width: 1080, height: 608, alt: company.name }],
  },
  icons: {
    icon: [{ url: "/favicon.png", type: "image/png" }],
    apple: "/favicon.png",
  },
  robots: { index: true, follow: true },
  // Google Search Console domain verification. The env var holds just the
  // content attribute value (the long token); Next.js renders the full
  // <meta name="google-site-verification"> tag automatically. When the var
  // is unset (preview/local builds) the tag is simply omitted.
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
};

export const viewport: Viewport = {
  themeColor: "#7a9e9a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="da" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-cream-200 text-charcoal antialiased">
        {children}
        <CookieBanner />
        {/* Vercel Analytics + Speed Insights — privacy-friendly, no cookies,
            GDPR-compliant by default (anonymous aggregate data only).
            Activated unconditionally; Vercel respects DNT and never sets
            tracking cookies. */}
        <Analytics />
        <SpeedInsights />
        {/* GA4 — gated by the cookie banner. Only loads after the user
            clicks "Accepter alle" (or has done so on a previous visit).
            See components/GA4Analytics.tsx for the consent wiring. */}
        <GA4Analytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: company.name,
              identifier: company.cvr,
              address: {
                "@type": "PostalAddress",
                streetAddress: company.address.street,
                postalCode: company.address.postal,
                addressLocality: company.address.city,
                addressCountry: "DK",
              },
              telephone: company.phoneE164,
              email: company.email,
              url: company.url,
              sameAs: [company.social.facebook, company.social.instagram],
              openingHoursSpecification: [
                {
                  "@type": "OpeningHoursSpecification",
                  dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                  opens: "06:00",
                  closes: "17:00",
                },
              ],
              areaServed: company.areas,
            }),
          }}
        />
      </body>
    </html>
  );
}
