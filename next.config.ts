import type { NextConfig } from "next";

const firebaseProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

const nextConfig: NextConfig = {
  experimental: {
    // Shared hosting limits memory and background processes during the
    // build, so use a single build worker.
    cpus: 1,
  },
  async rewrites() {
    if (!firebaseProject) return [];
    // Serve Firebase's sign-in helper pages from our own domain, so Google
    // shows our web address on its sign-in screen and sign-in keeps working
    // in browsers that block third-party storage.
    const firebaseHost = `https://${firebaseProject}.firebaseapp.com`;
    return [
      { source: "/__/auth/:path*", destination: `${firebaseHost}/__/auth/:path*` },
      { source: "/__/firebase/:path*", destination: `${firebaseHost}/__/firebase/:path*` },
    ];
  },
};

export default nextConfig;
