import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizeCss: true,
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  /* config options here */
  images: {
    domains: ["ktsorfxrxvoizmiazjsm.supabase.co"],
  },
};

export default nextConfig;
