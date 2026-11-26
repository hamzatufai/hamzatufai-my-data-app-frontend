import type { ReactNode } from "react";

export default function TopBar({
  title,
  alerts,
  action,
}: {
  title: string;
  alerts: number;
  action?: ReactNode;
}) {
  return (
    <header className="glass flex items-center justify-between px-5 py-3">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <span className="hidden text-xs text-slate-400 sm:inline" aria-live="polite">
          {alerts.toLocaleString()} open issues
        </span>
        {action}
      </div>
    </header>
  );
}
