import { Gauge, Activity, Sparkles, Database, Layers3 } from "lucide-react";

const ITEMS = [
  { icon: Gauge, title: "Dashboard", sub: "Overview and empty states" },
  { icon: Activity, title: "API health", sub: "Backend connection status" },
  { icon: Sparkles, title: "Demo preview", sub: "Opt-in sample data" },
  { icon: Database, title: "Data storage", sub: "Not connected yet" },
  { icon: Layers3, title: "More tools", sub: "Coming soon" },
];

export default function FeatureStrip() {
  return (
    <div className="glass grid grid-cols-2 gap-4 p-5 md:grid-cols-5">
      {ITEMS.map(({ icon: Icon, title, sub }) => (
        <div key={title} className="flex items-center gap-3">
          <Icon className="h-7 w-7 shrink-0 text-accent" strokeWidth={1.5} />
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="text-xs text-slate-500">{sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
