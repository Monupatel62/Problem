import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { problemBank } from "@/lib/problems/bank";
import { loadStructuredProblemContent } from "@/lib/problems/content-loader";
import { PROBLEM_CATALOG } from "@/lib/problems/catalog";
import { isIndexableProblem } from "@/lib/problems/seo";
import { getProblem } from "@/lib/problems/service";
import { ProblemPracticeWorkspace } from "./problem-practice-workspace";
import { ProblemComingSoon } from "./problem-coming-soon";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://problem.wohotech.in";

// Dynamic rendering - pages generated on first request, then cached
// Prevents build-time OOM (was generating 347 static pages)
export const dynamic = "force-dynamic";
export const revalidate = 86400; // Re-validate cache every 24 hours

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { problem } = await getProblem(slug);

  if (!problem) {
    return {
      title: "Problem Not Found | Problem",
      robots: { index: false, follow: false },
    };
  }

  const canonical = `${siteUrl}/problems/${slug}`;
  const indexable = isIndexableProblem(problem);

  return {
    title: `${problem.id}. ${problem.title} | Problem`,
    description: problem.description,
    alternates: { canonical },
    // A runnable exercise still needs complete original learning material before
    // it is eligible for organic search. This matches the XML sitemap policy.
    robots: indexable ? { index: true, follow: true } : { index: false, follow: true },
  };
}

export default async function ProblemPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { problem } = await getProblem(slug);

  if (!problem) { 
    notFound();
  }

  // If problem exists in catalog but has no judge support (placeholder), show coming-soon
  if (problem.judgeReady !== true) {
    return <ProblemComingSoon problem={problem} />;
  }

  const pageUrl = `${siteUrl}/problems/${slug}`;
  const problemSchema = {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: `${problem.id}. ${problem.title}`,
    description: problem.description ?? `Solve ${problem.title} — a ${problem.difficulty} level coding problem on Problem.`,
    url: pageUrl,
    learningResourceType: "Coding Problem",
    educationalLevel: problem.difficulty,
    inLanguage: "en-IN",
    isPartOf: {
      "@type": "WebSite",
      name: "Problem",
      url: siteUrl,
    },
    provider: {
      "@type": "Organization",
      name: "Problem",
      url: siteUrl,
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
      { "@type": "ListItem", position: 2, name: "Problems", item: `${siteUrl}/problems` },
      { "@type": "ListItem", position: 3, name: problem.title, item: pageUrl },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(problemSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <ProblemPracticeWorkspace problem={problem} />
    </>
  );
}
