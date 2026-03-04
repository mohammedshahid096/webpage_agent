import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  reactStrictMode: false, // ← disables double-render in dev
};

export default nextConfig;
