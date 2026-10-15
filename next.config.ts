import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingIncludes: {
    "/api/problems/*": ["./src/content/problems/**/*"],
    "/problems/*": ["./src/content/problems/**/*"],
  },
  experimental: { optimizePackageImports: ["lucide-react"], cpus: 1 },
};
export default nextConfig;
