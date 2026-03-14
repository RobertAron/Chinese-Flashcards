import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  distDir: process.env.NEXT_DIST_OVERRIDE || ".next",
  // reactCompiler: true,
  pageExtensions: process.env.NODE_ENV === "development" ? ["dev.tsx", "dev.ts", "tsx", "ts"] : undefined,
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/courses",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
