import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://code.wohotech.in";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/code", "/problems"],
      disallow: ["/api/", "/auth/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
