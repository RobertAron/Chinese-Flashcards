import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  reactCompiler: true,
  cacheComponents: true,
  partialPrefetching: true,
  pageExtensions: process.env.NODE_ENV === "development" ? ["dev.tsx", "dev.ts", "tsx", "ts"] : undefined,
  experimental: {
    agentUpgrade: "latest",
  },
};

export default nextConfig;
