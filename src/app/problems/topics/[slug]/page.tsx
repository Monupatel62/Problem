import type { Metadata } from "next";
import { TOPICS } from "@/lib/problems/topics";
import { TopicDetail } from "./topic-detail";

// Runtime rendering - prevents build-time OOM on Vercel
export const dynamic = "force-dynamic";
export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const topic = TOPICS.find((t) => t.slug === slug);
  const name = topic?.name ?? "Topic";
  return {
    title: `${name} Problems | Problem`,
    description: topic?.description ?? `Practice ${name} problems on Problem.`,
  };
}

export default async function TopicDetailPage({ params }: Props) {
  const { slug } = await params;
  return <TopicDetail slug={slug} />;
}
