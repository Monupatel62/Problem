// Topic metadata for the DSA Topics system
// Maps to tags used in the problem bank (e.g., "Array", "Hash Table")

export type TopicMeta = {
  slug: string;
  name: string;
  emoji: string;
  color: string;
  description: string;
};

export const TOPICS: TopicMeta[] = [
  { slug: "array", name: "Array", emoji: "\u{1F4E6}", color: "#3b82f6", description: "Master array manipulation, traversal, and in-place operations." },
  { slug: "string", name: "String", emoji: "\u{1F524}", color: "#8b5cf6", description: "String processing, pattern matching, and manipulation." },
  { slug: "hash-table", name: "Hash Table", emoji: "#\uFE0F\u20E3", color: "#ec4899", description: "Key-value lookups, frequency counting, and deduplication." },
  { slug: "dynamic-programming", name: "Dynamic Programming", emoji: "\u{1F9E9}", color: "#f59e0b", description: "Break complex problems into overlapping subproblems." },
  { slug: "math", name: "Math", emoji: "\u{1F522}", color: "#10b981", description: "Number theory, geometry, and mathematical algorithms." },
  { slug: "sorting", name: "Sorting", emoji: "\u{1F4CA}", color: "#6366f1", description: "Comparison and non-comparison based sorting algorithms." },
  { slug: "greedy", name: "Greedy", emoji: "\u{1F3C3}", color: "#14b8a6", description: "Make locally optimal choices for global solutions." },
  { slug: "depth-first-search", name: "DFS", emoji: "\u{1F30A}", color: "#0ea5e9", description: "Explore paths deeply before backtracking." },
  { slug: "binary-search", name: "Binary Search", emoji: "\u{1F50D}", color: "#f97316", description: "Efficiently search sorted data in O(log n)." },
  { slug: "tree", name: "Tree", emoji: "\u{1F333}", color: "#22c55e", description: "Binary trees, BSTs, and tree traversals." },
  { slug: "breadth-first-search", name: "BFS", emoji: "\u{1F310}", color: "#06b6d4", description: "Level-order exploration for shortest paths." },
  { slug: "matrix", name: "Matrix", emoji: "\u{1F532}", color: "#a855f7", description: "2D grid traversal and manipulation." },
  { slug: "bit-manipulation", name: "Bit Manipulation", emoji: "\u{1F4A1}", color: "#eab308", description: "Binary operations for efficient computation." },
  { slug: "two-pointers", name: "Two Pointers", emoji: "\u{1F446}\u{1F446}", color: "#ef4444", description: "Use two indices to solve array/string problems." },
  { slug: "stack", name: "Stack", emoji: "\u{1F4DA}", color: "#78716c", description: "LIFO data structure for parsing and backtracking." },
  { slug: "heap", name: "Heap", emoji: "\u26F0\uFE0F", color: "#d946ef", description: "Priority queues for top-K and scheduling problems." },
  { slug: "graph", name: "Graph", emoji: "\u{1F578}\uFE0F", color: "#0891b2", description: "Vertices and edges \u2014 traversal, shortest path, cycles." },
  { slug: "linked-list", name: "Linked List", emoji: "\u{1F517}", color: "#65a30d", description: "Node-based data structure operations." },
  { slug: "recursion", name: "Recursion", emoji: "\u{1F501}", color: "#c026d3", description: "Solve problems by breaking into smaller subproblems." },
  { slug: "sliding-window", name: "Sliding Window", emoji: "\u{1FA9F}", color: "#0d9488", description: "Fixed/variable window over arrays/strings." },
  { slug: "divide-and-conquer", name: "Divide & Conquer", emoji: "\u2702\uFE0F", color: "#dc2626", description: "Split, solve, and merge subproblems." },
  { slug: "backtracking", name: "Backtracking", emoji: "\u21A9\uFE0F", color: "#7c3aed", description: "Explore all possibilities with pruning." },
  { slug: "union-find", name: "Union Find", emoji: "\u{1F517}", color: "#2563eb", description: "Disjoint sets for connectivity problems." },
  { slug: "trie", name: "Trie", emoji: "\u{1F332}", color: "#059669", description: "Prefix tree for efficient string operations." },
  { slug: "simulation", name: "Simulation", emoji: "\u{1F3AE}", color: "#ea580c", description: "Step-by-step process simulation." },
];

/** Look up a topic by its URL slug */
export function getTopicBySlug(slug: string): TopicMeta | undefined {
  return TOPICS.find((t) => t.slug === slug);
}

/** Look up a topic by its tag name (as used in problem bank) */
export function getTopicByTag(tag: string): TopicMeta | undefined {
  const normalized = tag.toLowerCase().replace(/\s+/g, "-");
  return TOPICS.find((t) => t.slug === normalized);
}

/** Convert a tag name to a topic slug */
export function tagToSlug(tag: string): string {
  return tag.toLowerCase().replace(/\s+/g, "-");
}

/** Convert a topic slug to the tag format used in the bank */
export function slugToTag(slug: string): string {
  // Find the topic and return its name (which matches the bank tag format)
  const topic = TOPICS.find((t) => t.slug === slug);
  return topic?.name ?? slug;
}
