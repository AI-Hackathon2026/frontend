const DEFAULT_BASE_URL = "http://localhost:4000";

/** Absolute Express API origin (no trailing slash). */
export const BASE_URL = (
  import.meta.env.VITE_EXPRESS_SERVER_URL?.trim() || DEFAULT_BASE_URL
).replace(/\/$/, "");

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
}
