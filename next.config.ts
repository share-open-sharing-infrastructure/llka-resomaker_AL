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
  },
};

export default nextConfig;
