import { ApiError } from "@/lib/types/reservation";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

// Use proxy in browser to avoid CORS, direct on server
const getProxyUrl = (endpoint: string) => {
  if (typeof window === "undefined") {
    // Server-side: call API directly
    return `${API_BASE}${endpoint}`;
  }
  // Client-side: use proxy to avoid CORS (respects basePath)
  return `${BASE_PATH}/api/proxy${endpoint}`;
};

export class ApiClientError extends Error {
  code: number;
  data?: ApiError["data"];

  constructor(error: ApiError) {
    super(error.message);
    this.name = "ApiClientError";
    this.code = error.code;
    this.data = error.data;
  }
}

export async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = getProxyUrl(endpoint);

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw new ApiClientError(error);
  }

  return response.json();
}

export function getImageUrl(itemId: string, filename: string): string {
  return `${API_BASE}/api/files/item_public/${itemId}/${filename}`;
}

export function getThumbnailUrl(
  itemId: string,
  filename: string,
  size: string = "100x100"
): string {
  return `${API_BASE}/api/files/item_public/${itemId}/${filename}?thumb=${size}`;
}
