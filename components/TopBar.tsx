import { Bell, UserCircle2 } from "lucide-react";

export default function TopBar({ title, alerts }: { title: string; alerts: number }) {
  return (
    <header className="glass flex items-center justify-between px-5 py-3">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      <div className="flex items-center gap-4">
        <div className="relative rounded-lg p-2 text-slate-400" aria-label={`${alerts} open alerts`}>
          <Bell className="h-5 w-5" />
          {alerts > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent shadow-glow" />}
        </div>
        <UserCircle2 className="h-8 w-8 text-slate-400" aria-label="Account" />
      </div>
    </header>
  );
}
