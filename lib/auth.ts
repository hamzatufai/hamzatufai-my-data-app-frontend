"use client";

/**
 * Frontend auth client. Mirrors PRD v2.0 flows:
 * sign-up → verify → access request → wait for approval → sign in.
 */

export type SessionInfo = {
  authenticated: boolean;
  expired?: boolean;
  role?: "user" | "admin";
  status?: string;
  user?: { id: string; name: string; email: string; role: string };
};

import { getApiBase } from "@/lib/api";

const SESSION_KEY = "cleancsv:session";

export function getSessionToken(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(SESSION_KEY) ?? "";
  } catch {
    return "";
  }
}

export function storeSessionToken(token: string): void {
  try {
    if (token) window.localStorage.setItem(SESSION_KEY, token);
    else window.localStorage.removeItem(SESSION_KEY);
  } catch {
    // private mode: session lives in memory only for this page
  }
}

export async function authRequest<T>(
  method: string,
  path: string,
  body?: unknown,
  admin = false,
): Promise<T> {
  const token = getSessionToken();
  void admin;
  // Cross-origin deployments get the backend base from lib/api.ts; same-origin
  // (or proxied via rewrites) deployments use the relative path.
  const base = getApiBase();
  let lastError: unknown = null;

  // One automatic retry absorbs a serverless cold start or a dropped keep-alive
  // connection; both appear as instant "Failed to fetch" otherwise.
  for (let attempt = 0; attempt < 3; attempt++) {
    // Attempt 0-1: configured path (proxy/override). Attempt 2: relative path
    // fallback so a stale env value can never brick sign-in.
    const target = attempt < 2 ? `${base}${path}` : path;
    try {
      const res = await fetch(target, {
        method,
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: body === undefined ? undefined : JSON.stringify(body),
        cache: "no-store",
        signal: AbortSignal.timeout(25_000),
      });
      const payload: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status >= 500 && attempt === 0) {
          lastError = new Error(`Server error (${res.status})`);
          await new Promise((resolve) => setTimeout(resolve, 800));
          continue;
        }
        const message =
          payload && typeof payload === "object" && "error" in (payload as Record<string, unknown>)
            ? String((payload as Record<string, unknown>).error)
            : `Request failed (HTTP ${res.status})`;
        throw new Error(message);
      }
      return payload as T;
    } catch (cause) {
      lastError = cause;
      if (cause instanceof TypeError && attempt === 0) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        continue;
      }
      if (cause instanceof Error && cause.message.startsWith("Request failed")) throw cause;
      break;
    }
  }

  if (lastError instanceof Error && lastError.message.startsWith("Request failed")) throw lastError;
  throw new Error(
    `Could not reach the server. Check that the backend URL is configured (build-time env, NEXT_PUBLIC_USE_API_PROXY, or the Settings page).`,
  );
}

export async function fetchSession(): Promise<SessionInfo> {
  try {
    return await authRequest<SessionInfo>("GET", "/api/auth/session");
  } catch {
    return { authenticated: false };
  }
}
