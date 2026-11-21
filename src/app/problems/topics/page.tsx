import type { Metadata } from "next";
import { TopicsHub } from "./topics-hub";

export const metadata: Metadata = {
  title: "Topics | WoHoTech Problems",
  description: "Browse and master DSA topics with structured problem sets and progress tracking.",
};

export default function TopicsPage() {
  return <TopicsHub />;
}
