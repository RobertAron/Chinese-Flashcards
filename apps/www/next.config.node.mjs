/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  distDir: ".next-node",
  pageExtensions: ["dev.tsx", "dev.ts", "tsx", "ts"],
  experimental: {
    turbopackFileSystemCacheForDev: false,
  },
  async redirects() {
    return [{ source: "/", destination: "/courses", permanent: false }];
  },
};

export default nextConfig;
