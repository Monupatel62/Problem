import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const withMDX = createMDX({ options: { remarkPlugins: [], rehypePlugins: [] } });
const nextConfig: NextConfig = {
  output: "standalone",
  pageExtensions: ["ts", "tsx", "md", "mdx"],
  outputFileTracingIncludes: {
    "/api/problems/*": ["./src/content/problems/**/*"],
    "/problems/*": ["./src/content/problems/**/*"],
  },
  experimental: { optimizePackageImports: ["lucide-react"], cpus: 1 },
};
export default withMDX(nextConfig);
