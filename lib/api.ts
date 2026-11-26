const BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function apiGet<T>(path: string): Promise<T> {
  if (!BASE) throw new Error("NEXT_PUBLIC_API_URL is not set");
  const res = await fetch(`${BASE}/api${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return res.json() as Promise<T>;
}
