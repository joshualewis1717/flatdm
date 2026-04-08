import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '30mb',// max file size that we want to upload in next.js's server
    },
  },
};

export default nextConfig;
