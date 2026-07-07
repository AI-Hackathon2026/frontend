const DEFAULT_BASE_URL = "http://localhost:4000";

/** Same-origin proxy path — session cookies work in PWA. */
export const API_PROXY_PATH = "/api";

function resolveBaseUrl(): string {
  const directUrl = import.meta.env.VITE_EXPRESS_SERVER_URL?.trim();
  const useProxy =
    import.meta.env.PROD || import.meta.env.VITE_USE_API_PROXY === "true";

  if (useProxy) {
    return API_PROXY_PATH;
  }

  return (directUrl || DEFAULT_BASE_URL).replace(/\/$/, "");
}

/** API origin (no trailing slash). Relative `/api` in production. */
export const BASE_URL = resolveBaseUrl();

export function apiUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_URL}${normalized}`;
}

export function isUsingApiProxy(): boolean {
  return BASE_URL === API_PROXY_PATH || BASE_URL.endsWith(API_PROXY_PATH);
}
