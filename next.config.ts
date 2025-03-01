import { NextConfig } from "next/dist/server/config-shared";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};

export default nextConfig;
