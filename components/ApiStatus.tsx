"use client";

import { useEffect, useState } from "react";
import { apiGet } from "@/lib/api";

export default function ApiStatus() {
  const [state, setState] = useState<"checking" | "ok" | "down">("checking");

  useEffect(() => {
    apiGet<{ status: string }>("/health")
      .then((r) => setState(r.status === "ok" ? "ok" : "down"))
      .catch(() => setState("down"));
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
      {label}
    </span>
  );
}
