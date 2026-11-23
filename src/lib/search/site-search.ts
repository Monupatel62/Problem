// Search stub — WohoCode only uses problems search
// Full site search is handled by WohoSearch

export type SearchResult = {
  title: string;
  href: string;
  type: string;
  meta: string;
  description?: string;
};

export function getDirectMatchResult(_query: string): SearchResult | null {
  return null;
}

export function getSiteSearchResults(_query: string): SearchResult[] {
  return [];
}

export function getSiteSearchSuggestions(_query: string): string[] {
  return [];
}

export function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    note: "Note", coding: "Problem", tool: "Tool", page: "Page",
    feature: "Feature", course: "Course", video: "Video",
    reel: "Reel", post: "Post", image: "Image",
  };
  return labels[type] ?? type;
}

export function isQuestionLikeQuery(query: string): boolean {
  return /^(what|how|why|when|where|who|which|is|are|can|does|do)\b/i.test(query.trim());
}
