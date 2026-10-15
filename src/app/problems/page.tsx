import type { Metadata } from "next";
import { ProblemsWorkspace } from "./problems-workspace";
import { getProblems } from "@/lib/problems/service";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://problem.wohotech.in";

export const metadata: Metadata = {
  title: "Coding Problems — Practice DSA, Arrays, Trees, Graphs | Problem",
  description: "Practice structured coding problems with an online judge. Topics include arrays, strings, linked lists, trees, graphs, dynamic programming, sorting, and searching.",
  alternates: { canonical: `${siteUrl}/problems` },
  openGraph: {
    title: "Coding Problems | Problem",
    description: "Structured DSA problems with an online judge — arrays, trees, graphs, DP, and more.",
    url: `${siteUrl}/problems`,
  },
};

export default async function ProblemsPage() {
  const { problems, source } = await getProblems();

  const problemsSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Problem Coding Practice",
    description: "Coding practice with an online judge covering arrays, strings, trees, graphs, dynamic programming, and more.",
    url: `${siteUrl}/problems`,
    about: {
      "@type": "Thing",
      name: "Data Structures and Algorithms",
    },
    provider: {
      "@type": "Organization",
      name: "Problem",
      url: siteUrl,
    },
    hasPart: [
      { "@type": "LearningResource", name: "Array Problems", url: `${siteUrl}/problems/topics/array` },
      { "@type": "LearningResource", name: "String Problems", url: `${siteUrl}/problems/topics/string` },
      { "@type": "LearningResource", name: "Linked List Problems", url: `${siteUrl}/problems/topics/linked-list` },
      { "@type": "LearningResource", name: "Tree Problems", url: `${siteUrl}/problems/topics/tree` },
      { "@type": "LearningResource", name: "Graph Problems", url: `${siteUrl}/problems/topics/graph` },
      { "@type": "LearningResource", name: "Dynamic Programming", url: `${siteUrl}/problems/topics/dynamic-programming` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(problemsSchema) }} />
      <ProblemsWorkspace initialProblems={problems} dataSource={source} />
    </>
  );
}
