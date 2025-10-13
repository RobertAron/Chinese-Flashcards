import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  pageExtensions: process.env.NODE_ENV === "development" ? ["dev.tsx", "dev.ts", "tsx", "ts"] : undefined,
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
