/** @type {import('next').NextConfig} */

// Content Security Policy — explicit whitelist of every external origin the
// site genuinely loads from. Each entry is annotated so future contributors
// know which integration depends on what. Avoid blanket "https:" wildcards;
// they defeat the purpose of CSP.
const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    // Next.js + Tailwind inline runtime
    "'unsafe-inline'",
    // Cloudflare Turnstile widget
    "https://challenges.cloudflare.com",
    // Google Analytics 4 (only after cookie consent)
    "https://www.googletagmanager.com",
    "https://www.google-analytics.com",
    // Calendly embed
    "https://assets.calendly.com",
    // Vercel Analytics + Speed Insights
    "https://va.vercel-scripts.com",
  ],
  "style-src": [
    "'self'",
    // Tailwind generates inline style attributes
    "'unsafe-inline'",
    // Calendly embed CSS
    "https://assets.calendly.com",
    // Google Fonts stylesheet (next/font usually inlines, but kept as belt-and-braces)
    "https://fonts.googleapis.com",
  ],
  "img-src": [
    "'self'",
    "data:",
    "blob:",
    // Google Analytics pixel
    "https://www.google-analytics.com",
    "https://www.googletagmanager.com",
    // Calendly thumbnails
    "https://*.calendly.com",
  ],
  "font-src": [
    "'self'",
    "data:",
    // Next/font fetches fonts from Google
    "https://fonts.gstatic.com",
  ],
  "connect-src": [
    "'self'",
    // Cloudflare Turnstile verification
    "https://challenges.cloudflare.com",
    // Google Analytics beacons
    "https://www.google-analytics.com",
    "https://*.analytics.google.com",
    "https://*.g.doubleclick.net",
    // Calendly availability fetches
    "https://*.calendly.com",
    // Vercel Analytics + Speed Insights
    "https://vitals.vercel-insights.com",
    "https://vitals.vercel-analytics.com",
  ],
  "frame-src": [
    "'self'",
    // Cloudflare Turnstile widget (iframe)
    "https://challenges.cloudflare.com",
    // Calendly embed (iframe)
    "https://calendly.com",
    "https://*.calendly.com",
  ],
  // Forms can only post back to the site itself — blocks form hijacking.
  "form-action": ["'self'"],
  // Disallow embedding the site inside frames (clickjacking defense — also
  // covered by X-Frame-Options but CSP takes precedence in modern browsers).
  "frame-ancestors": ["'none'"],
  "base-uri": ["'self'"],
  // No plugins (Flash, Java applets) allowed at all.
  "object-src": ["'none'"],
  // Auto-upgrade any http:// reference to https://.
  "upgrade-insecure-requests": [],
};

const cspHeader = Object.entries(cspDirectives)
  .map(([key, values]) => (values.length > 0 ? `${key} ${values.join(" ")}` : key))
  .join("; ");

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion"],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        // Apply to every route — pages, API endpoints, static assets.
        // Browsers ignore headers they don't understand, so it's safe to
        // include both legacy and modern security headers.
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          // Legacy header — still respected by older browsers + scanners.
          { key: "X-Frame-Options", value: "DENY" },
          // Prevent MIME-type sniffing attacks.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Disable the (now-deprecated) IE/legacy XSS auditor — Chrome
          // and Firefox removed it but leaving the explicit "0" prevents
          // surprises from old scanners.
          { key: "X-XSS-Protection", value: "0" },
          // Don't leak full URLs to other sites.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Block dangerous browser features by default.
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=()",
              "geolocation=()",
              "interest-cohort=()",
              "browsing-topics=()",
              "payment=()",
              "usb=()",
              "magnetometer=()",
              "gyroscope=()",
            ].join(", "),
          },
          // 2-year HSTS with preload — strong production HTTPS lock-in.
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          // Isolate the document from cross-origin popups.
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          // Prevent other sites from embedding our resources.
          { key: "Cross-Origin-Resource-Policy", value: "same-site" },
        ],
      },
    ];
  },
};

export default nextConfig;
