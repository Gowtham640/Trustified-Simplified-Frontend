import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  // Explicitly enable environment variable loading
  env: {
    SUPABASE_URL: process.env.SUPABASE_URL,
    ANON_KEY: process.env.ANON_KEY,
  },
};

export default nextConfig;
