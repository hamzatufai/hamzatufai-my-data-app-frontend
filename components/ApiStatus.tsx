"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export default function ApiStatus() {
  const [state, setState] = useState<"checking" | "ok" | "down">("checking");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiGet<{ status: string }>("/health")
      .then((r) => {
        if (r.status === "ok") {
          setState("ok");
          setError(null);
        } else {
          setState("down");
          setError(`Unexpected health response: ${r.status || "missing status"}`);
        }
      })
      .catch((cause: unknown) => {
        setState("down");
        setError(cause instanceof Error ? cause.message : "Unknown connection error");
      });
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
