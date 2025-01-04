import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_PATH: process.env.NEXT_PUBLIC_API_PATH,
  },
};

export default nextConfig;
