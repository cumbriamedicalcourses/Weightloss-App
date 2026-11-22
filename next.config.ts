import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Shared hosting limits memory and background processes during the
    // build, so use a single build worker.
    cpus: 1,
  },
};

export default nextConfig;
