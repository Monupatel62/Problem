import type { Metadata } from "next";
import { ProblemsWorkspace } from "./problems-workspace";
import { getProblems } from "@/lib/problems/service";

export const metadata: Metadata = {
  title: "Coding Problems — Practice DSA, Arrays, Trees, Graphs | WoHoTech",
  description: "Practice 800+ coding problems with an online judge on WoHoTech. Topics: arrays, strings, linked lists, trees, graphs, dynamic programming, sorting, searching. Ideal for FAANG, GATE, and placement preparation.",
  alternates: { canonical: "https://wohotech.in/problems" },
  openGraph: {
    title: "Coding Problems | WoHoTech",
    description: "800+ DSA problems with online judge — arrays, trees, graphs, DP, and more.",
    url: "https://wohotech.in/problems",
  },
};

export default async function ProblemsPage() {
  const { problems, source } = await getProblems();

  const problemsSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "WoHoTech Coding Problems",
    description: "800+ coding practice problems with online judge covering DSA topics — arrays, strings, trees, graphs, dynamic programming, and more.",
    url: "https://wohotech.in/problems",
    about: {
      "@type": "Thing",
      name: "Data Structures and Algorithms",
    },
    provider: {
      "@type": "Organization",
      name: "WoHoTech",
      url: "https://wohotech.in",
    },
    hasPart: [
      { "@type": "LearningResource", name: "Array Problems", url: "https://wohotech.in/problems/topics/array" },
      { "@type": "LearningResource", name: "String Problems", url: "https://wohotech.in/problems/topics/string" },
      { "@type": "LearningResource", name: "Linked List Problems", url: "https://wohotech.in/problems/topics/linked-list" },
      { "@type": "LearningResource", name: "Tree Problems", url: "https://wohotech.in/problems/topics/tree" },
      { "@type": "LearningResource", name: "Graph Problems", url: "https://wohotech.in/problems/topics/graph" },
      { "@type": "LearningResource", name: "Dynamic Programming", url: "https://wohotech.in/problems/topics/dynamic-programming" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(problemsSchema) }} />
      <ProblemsWorkspace initialProblems={problems} dataSource={source} />
    </>
  );
}
