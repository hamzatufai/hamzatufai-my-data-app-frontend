/**
 * Resilient browser API client for the separately deployed CleanCSV backend.
 *
 * Key behaviours:
 * - Base URL resolution order: build-time env var > optional runtime override in
 *   localStorage (cleancsv:api-url) > same-origin relative "/api".
 * - Retries transient failures with exponential backoff so Vercel serverless
 *   cold starts and momentary network blips no longer show as hard outages.
 * - Last known-good responses can be cached and served stale while the
 *   connection recovers (stale-while-error).
 */

export function proxyEnabled(): boolean {
  return process.env.NEXT_PUBLIC_USE_API_PROXY === "true";
}

/**
 * Last-resort backend origin, used when the build-time env vars are absent
 * (e.g. a Vercel Preview deployment whose env vars only have Production
 * ticked). The URL is public browser knowledge anyway, so embedding it creates
 * no new exposure; the backend still decides which origins may call it.
 */
const FALLBACK_API_BASE = "https://hamzatufai-my-data-app-backend.vercel.app";

const OVERRIDE_KEY = "cleancsv:api-url";
const REQUEST_TIMEOUT_MS = 25_000;
const HEALTH_TIMEOUT_MS = 10_000;
const RETRY_ATTEMPTS = 3;
const RETRY_BASE_MS = 800;

const staleCache = new Map<string, unknown>();

export function getApiBase(): string {
  let base = process.env.NEXT_PUBLIC_API_URL ?? "";
  if (!base) base = FALLBACK_API_BASE;

  // A localhost/blank base can only come from developer settings or a
  // misconfigured production build where NEXT_PUBLIC_API_URL was never set in
  // the Vercel project environment. Never ship a localhost URL to end users;
  // fall back to the runtime override or same-origin /api instead.
  const isDev = process.env.NODE_ENV !== "production";
  if (!isDev && (!base || /localhost|127\.0\.0\.1/.test(base))) {
    base = "";
  }

  // When the same-origin proxy is active, relative /api is the strongest path:
  // the browser never leaves our origin, so CORS and cross-origin failures
  // cannot happen. The proxy is created by next.config.mjs rewrites.
  if (proxyEnabled()) {
    return "";
  }

  // Respect the build-time value, but allow a runtime override (Settings page)
  // so deployments can be pointed at the correct backend without a rebuild.
  if (typeof window !== "undefined") {
    try {
      const override = window.localStorage.getItem(OVERRIDE_KEY);
      const envIsLocal =
        !base ||
        base.includes("localhost") ||
        base.includes("127.0.0.1") ||
        base.startsWith("/");
      if (override && envIsLocal) base = override;
    } catch {
      // localStorage unavailable (privacy mode); fall back to build value.
    }
  }

  return base.replace(/\/+$/, "");
}

export function setApiBaseOverride(url: string): void {
  if (typeof window === "undefined") return;
  if (url.trim()) window.localStorage.setItem(OVERRIDE_KEY, url.trim());
  else window.localStorage.removeItem(OVERRIDE_KEY);
}

export function getApiBaseOverride(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(OVERRIDE_KEY) ?? "";
  } catch {
    return "";
  }
}

function apiUrl(path: string): string {
  return `${getApiBase()}/api${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Candidate URLs in priority order. The RELATIVE same-origin path comes first:
 * when next.config rewrites proxy /api to the backend, the browser never makes
 * a cross-origin request — the strongest and fastest configuration, and it
 * works whether or not NEXT_PUBLIC_* env flags were set at build time.
 */
export function apiCandidates(path: string): string[] {
  const p = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBase();
  const relative = `/api${p.replace(/^\/api/, "")}`;
  // Direct backend origin first (works on production AND preview builds thanks
  // to the baked-in fallback); same-origin proxy as the faster fallback when
  // the build enabled it.
  const direct = `${base}/api${p.replace(/^\/api/, "")}`;
  const list = [direct];
  if (base && direct !== relative) list.push(relative);
  return list;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryable(error: unknown, status?: number): boolean {
  if (error instanceof DOMException && error.name === "AbortError") return true; // timeout
  if (error instanceof TypeError) return true; // network failure / connection reset
  if (status && (status >= 502 || status === 408 || status === 429 || status === 503 || status === 504)) return true;
  return false;
}

export async function apiGet<T>(
  path: string,
  options: { timeoutMs?: number; retries?: number } = {},
): Promise<T> {
  const endpoint = apiUrl(path);
  const timeoutMs = options.timeoutMs ?? REQUEST_TIMEOUT_MS;
  const attempts = options.retries ?? RETRY_ATTEMPTS;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < attempts; attempt++) {
    if (attempt > 0) {
      // Exponential backoff: 0.8s, 1.6s, 3.2s... absorbs serverless cold starts.
      await delay(RETRY_BASE_MS * 2 ** (attempt - 1));
    }

    try {
      const res: Response = await fetch(endpoint, {
        cache: "no-store",
        signal: AbortSignal.timeout(timeoutMs),
        credentials: "omit",
      });

      if (!res.ok) {
        if (isRetryable(null, res.status) && attempt < attempts - 1) {
          lastError = new Error(`HTTP ${res.status}`);
          continue;
        }
        throw new Error(`Request to ${endpoint} failed with HTTP ${res.status}`);
      }

      const data = (await res.json()) as T;
      staleCache.set(path, data);
      return data;
    } catch (cause) {
      lastError = cause instanceof Error ? cause : new Error("Network request failed");
      if (!isRetryable(cause)) break;
    }
  }

  // Serve last known-good data while the backend is unreachable, so the
  // dashboard degrades gracefully instead of flashing an error.
  if (staleCache.has(path)) return staleCache.get(path) as T;

  throw new Error(
    `${lastError?.message ?? "Network request failed"} — could not reach ${endpoint} after ${attempts} attempts`,
  );
}

export function clearStaleCache(): void {
  staleCache.clear();
}
