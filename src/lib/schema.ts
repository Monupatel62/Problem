const ORG_NAME  = "WoHoTech";
const ORG_URL   = "https://wohotech.in";
const ORG_LOGO  = "https://wohotech.in/android-chrome-512x512.png";
const OG_IMAGE  = "https://wohotech.in/og-image.png";

// ── Article (coding tutorials, notes pages) ──────────────────────────────────
type ArticleMeta = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  keywords: string[];
  category?: string;
};

export function createArticleSchema(input: { url: string; image?: string; frontmatter: ArticleMeta }) {
  const { url, image, frontmatter } = input;
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",           // more specific → better rich results
    headline: frontmatter.title,
    description: frontmatter.description,
    datePublished: frontmatter.publishedAt,
    dateModified: frontmatter.updatedAt,
    url,
    image: image ?? OG_IMAGE,
    keywords: Array.isArray(frontmatter.keywords) ? frontmatter.keywords.join(", ") : "",
    inLanguage: "en-IN",
    author: {
      "@type": "Organization",
      name: ORG_NAME,
      url: ORG_URL,
      logo: { "@type": "ImageObject", url: ORG_LOGO },
    },
    publisher: {
      "@type": "Organization",
      name: ORG_NAME,
      url: ORG_URL,
      logo: { "@type": "ImageObject", url: ORG_LOGO, width: 512, height: 512 },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    isPartOf: { "@type": "WebSite", name: ORG_NAME, url: ORG_URL },
  };
}

// ── Breadcrumb ────────────────────────────────────────────────────────────────
export function createBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: (Array.isArray(items) ? items : []).map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── FAQ ───────────────────────────────────────────────────────────────────────
export function createFaqSchema(items?: Array<{ question: string; answer: string }>) {
  const faqItems = (Array.isArray(items) ? items : []).filter(
    (item) => item?.question?.trim() && item?.answer?.trim(),
  );

  if (faqItems.length === 0) {
    return null;
  }

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

// ── Course schema (for notes pages) ──────────────────────────────────────────
export function createCourseSchema(input: {
  name: string;
  description: string;
  url: string;
  subject: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: input.url,
    provider: { "@type": "Organization", name: ORG_NAME, url: ORG_URL },
    educationalLevel: "UndergraduateOrAbove",
    inLanguage: "en-IN",
    about: { "@type": "Thing", name: input.subject },
    isAccessibleForFree: true,
  };
}

export function createCodingCourseSchema(input: {
  name: string;
  description: string;
  url: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Course",
    name: input.name,
    description: input.description,
    url: input.url,
    provider: { "@type": "Organization", name: ORG_NAME, url: ORG_URL },
    educationalLevel: "BeginnerToAdvanced",
    inLanguage: "en-IN",
    about: { "@type": "Thing", name: input.category },
    isAccessibleForFree: true,
    teaches: input.category,
  };
}

// ── SiteLinks Searchbox (home page) ──────────────────────────────────────────
export function createSiteLinksSearchboxSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: ORG_NAME,
    url: ORG_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${ORG_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

export function createOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: ORG_NAME,
    url: ORG_URL,
    logo: {
      "@type": "ImageObject",
      url: ORG_LOGO,
      width: 512,
      height: 512,
    },
    image: OG_IMAGE,
  };
}
