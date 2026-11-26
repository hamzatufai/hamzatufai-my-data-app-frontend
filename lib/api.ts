const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/+$/, "");
const REQUEST_TIMEOUT_MS = 15_000;

export async function apiGet<T>(path: string): Promise<T> {
  if (!BASE) {
    throw new Error("NEXT_PUBLIC_API_URL is not set. Configure it in the frontend deployment and rebuild.");
  }

  const endpoint = `${BASE}/api${path.startsWith("/") ? path : `/${path}`}`;
  let res: Response;
  try {
    res = await fetch(endpoint, {
      cache: "no-store",
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch (cause) {
    const detail = cause instanceof Error ? cause.message : "Network request failed";
    throw new Error(`Could not reach ${endpoint}: ${detail}`);
  }

  if (!res.ok) throw new Error(`Request to ${endpoint} failed with HTTP ${res.status}`);
  return res.json() as Promise<T>;
}
