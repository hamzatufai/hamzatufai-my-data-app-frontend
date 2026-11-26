"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

const RETRY_INTERVAL_MS = 30_000;

export default function ApiStatus() {
  const [state, setState] = useState<"checking" | "ok" | "down">("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let checking = false;
    let firstCheck = true;

    const checkApi = async () => {
      if (checking) return;
      checking = true;
      if (firstCheck && active) setState("checking");

      try {
        const health = await apiGet<{ status: string }>("/health");
        if (health.status !== "ok") {
          throw new Error(`Unexpected health response: ${health.status || "missing status"}`);
        }

        const stats = await apiGet<{
          datasets: number;
          rows: number;
          quality: number | null;
          operations: number;
        }>("/dashboard/stats");
        const validStats =
          Number.isFinite(stats.datasets) &&
          Number.isFinite(stats.rows) &&
          (stats.quality === null || Number.isFinite(stats.quality)) &&
          Number.isFinite(stats.operations);
        if (!validStats) throw new Error("Dashboard stats response is invalid");

        if (active) {
          setState("ok");
          setError(null);
        }
      } catch (cause: unknown) {
        if (active) {
          setState("down");
          setError(cause instanceof Error ? cause.message : "Unknown connection error");
        }
      } finally {
        firstCheck = false;
        checking = false;
      }
    };

    const retryWhenOnline = () => void checkApi();
    const retryWhenVisible = () => {
      if (document.visibilityState === "visible") void checkApi();
    };

    void checkApi();
    const interval = window.setInterval(() => void checkApi(), RETRY_INTERVAL_MS);
    window.addEventListener("online", retryWhenOnline);
    document.addEventListener("visibilitychange", retryWhenVisible);

    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("online", retryWhenOnline);
      document.removeEventListener("visibilitychange", retryWhenVisible);
    };
  }, []);

  const color =
    state === "ok"
      ? "text-accent"
      : state === "down"
        ? "text-danger"
        : "text-slate-500";
  const label =
    state === "ok"
      ? "API connected"
      : state === "down"
        ? "API unreachable"
        : "Checking API...";

  return (
    <span className={`inline-flex items-center gap-2 text-xs ${color}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      <span title={error ?? undefined} aria-live="polite">
        {label}{error ? `: ${error}` : ""}
      </span>
    </span>
  );
}
