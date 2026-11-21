import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@monaco-editor/react"],
  },
  webpack(config) {
    // Exclude monaco heavy workers from server bundle
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
};

export default nextConfig;
