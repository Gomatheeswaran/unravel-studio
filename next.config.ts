import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "cdna.artstation.com" },
      { hostname: "cdnb.artstation.com" },
      { hostname: "cdn.artstation.com" },
      { hostname: "www.artstation.com" },
    ],
  },
  serverExternalPackages: ["bcryptjs", "formidable", "better-sqlite3", "@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
