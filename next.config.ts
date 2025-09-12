import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        // lh3.googleusercontent.com
        protocol: "https",
        hostname: "lh3.googleusercontent.com"
      }
    ]
  },
  experimental: {
    authInterrupts: true
  }
};

export default nextConfig;
