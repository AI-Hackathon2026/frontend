import { api } from "../api/client";
import { BASE_URL } from "../api/baseUrl";
import { isStandalonePwa } from "./pwa";

const FIRST_PARTY_COOKIE_PROBE = "heaith_cookie_probe";

/** API origin differs from the page — session cookies are cross-site. */
export function isCrossOriginApi(): boolean {
  try {
    return new URL(BASE_URL).origin !== window.location.origin;
  } catch {
    return false;
  }
}

export function canUseFirstPartyCookies(): boolean {
  try {
    document.cookie = `${FIRST_PARTY_COOKIE_PROBE}=1; SameSite=Lax; path=/`;
    const enabled = document.cookie.includes(`${FIRST_PARTY_COOKIE_PROBE}=1`);
    document.cookie = `${FIRST_PARTY_COOKIE_PROBE}=; Max-Age=0; path=/`;
    return enabled;
  } catch {
    return false;
  }
}

/** Confirms the server accepted the session cookie after sign-in. */
export async function verifyAuthSession(): Promise<boolean> {
  try {
    await api.listChats();
    return true;
  } catch {
    return false;
  }
}

export function shouldWarnAboutCookiesInPwa(): boolean {
  return isStandalonePwa() && (isCrossOriginApi() || !canUseFirstPartyCookies());
}
