import type { MetadataRoute } from "next";
import { projects } from "@/content/projects";
import { company } from "@/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = company.url;
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/projekter`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/book-besigtigelse`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/kontakt`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/om-os`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/privatlivspolitik`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${base}/cookiepolitik`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  const projectRoutes: MetadataRoute.Sitemap = projects.map((p) => ({
    url: `${base}/projekter/${p.slug}`,
    lastModified: now,
    changeFrequency: "yearly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...projectRoutes];
}
