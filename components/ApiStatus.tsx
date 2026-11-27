"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

const RETRY_DOWN_MS = 8_000; // retry cadence while unhealthy
const RETRY_OK_MS = 60_000; // periodic re-verify while healthy

export default function ApiStatus() {
  const [state, setState] = useState<"checking" | "ok" | "stale" | "down">("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let checking = false;
    let lastError: string | null = null;
    let lastOk = false;

    const check = async () => {
      if (checking) return;
      checking = true;
      try {
        // Health first (cheap endpoint); only pull dashboard stats once health
        // is OK so a dead backend never blocks on a cold-started endpoint.
        const health = await apiGet<{ status: string }>("/health", {
          timeoutMs: 10_000,
          retries: 2,
        });
        if (health.status !== "ok") {
          throw new Error(`Unexpected health response: ${health.status || "missing status"}`);
        }

        const stats = await apiGet<{
          datasets: number;
          rows: number;
          quality: number | null;
          operations: number;
        }>("/dashboard/stats", { timeoutMs: 25_000, retries: 2 });

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
        lastOk = true;
      } catch (cause) {
        lastOk = false;
        const message =
          cause instanceof Error ? cause.message.split(" — ")[0] : "Unknown error";
        if (!active) return;
        setState((prev) =>
          prev === "checking" || prev === "ok" || prev === "stale" ? "down" : prev,
        );
        if (message !== lastError) {
          setError(message);
          lastError = message;
        }
      } finally {
        checking = false;
      }
    };

    const loop = async () => {
      while (active) {
        await check();
        await new Promise((r) => setTimeout(r, lastOk ? RETRY_OK_MS : RETRY_DOWN_MS));
      }
    };

    void loop();

    const retryWhenOnline = () => {
      lastError = null;
      void check();
    };
    const retryWhenVisible = () => {
      if (document.visibilityState === "visible") void check();
    };

    window.addEventListener("online", retryWhenOnline);
    document.addEventListener("visibilitychange", retryWhenVisible);

    return () => {
      active = false;
      window.removeEventListener("online", retryWhenOnline);
      document.removeEventListener("visibilitychange", retryWhenVisible);
    };
  }, []);

  const color =
    state === "ok"
      ? "text-accent"
      : state === "down"
        ? "text-danger"
        : state === "stale"
          ? "text-warning"
          : "text-slate-500";
  const label =
    state === "ok"
      ? "API connected"
      : state === "stale"
        ? "API reconnecting"
        : state === "down"
          ? "API unreachable — retrying"
          : "Checking API...";

  return (
    <span className={`inline-flex items-center gap-2 text-xs ${color}`}>
      <span className="h-2 w-2 rounded-full bg-current" aria-hidden />
      <span title={error ?? undefined} aria-live="polite">
        {label}
        {error ? `: ${error}` : ""}
      </span>
    </span>
  );
}
