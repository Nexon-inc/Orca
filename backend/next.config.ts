import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  serverExternalPackages: ['@langchain/core', 'js-tiktoken'],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
