import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@monaco-editor/react"],
  },
  // Explicitly use webpack (not turbopack) to avoid build issues
  turbopack: {},
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

export default nextConfig;
