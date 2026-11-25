import { Gauge, BrainCircuit, ShieldCheck, Layers3, Lock } from "lucide-react";

const ITEMS = [
  { icon: Gauge, title: "Real-time", sub: "Quality metrics" },
  { icon: BrainCircuit, title: "AI-assisted", sub: "Suggestions, you approve" },
  { icon: ShieldCheck, title: "Safe cleaning", sub: "Source is never changed" },
  { icon: Layers3, title: "Multi-format", sub: "CSV, Excel, JSON and more" },
  { icon: Lock, title: "Secure & private", sub: "Files stay on your device" },
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
