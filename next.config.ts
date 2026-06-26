import type { NextConfig } from "next";

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Derive allowed image hostnames from the configured API base URL
const remotePatterns: NonNullable<NonNullable<NextConfig["images"]>["remotePatterns"]> = [];

if (apiBase) {
  try {
    const url = new URL(apiBase);
    remotePatterns.push({
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
    });
  } catch {
    // Invalid URL — skip
  }
}

// Allow localhost images in development
if (process.env.NODE_ENV === "development") {
  remotePatterns.push(
    { protocol: "http", hostname: "localhost" },
    { protocol: "https", hostname: "localhost" },
  );
}

const nextConfig: NextConfig = {
  output: "standalone",
  ...(basePath ? { basePath } : {}),
  images: {
    remotePatterns,
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
