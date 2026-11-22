import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  // Empty turbopack config silences the webpack config warning
  turbopack: {},
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@monaco-editor/react"],
  },
};

export default nextConfig;
