import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://code.wohotech.in";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/code`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/problems`, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/problems/daily`, changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/problems/topics`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/problems/study-plan`, changeFrequency: "weekly", priority: 0.7 },
  ];
}
