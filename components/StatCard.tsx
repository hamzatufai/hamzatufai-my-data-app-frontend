import type { LucideIcon } from "lucide-react";
import Sparkline from "./Sparkline";

type Props = {
  label: string;
  value: string;
  change: number;
  series: number[];
  icon: LucideIcon;
};

export default function StatCard({ label, value, change, series, icon: Icon }: Props) {
  const hasValue = series.length > 0;
  const up = change >= 0;
  return (
    <div className="glass flex flex-col p-5">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-slate-500">
        <Icon className="h-4 w-4 text-accent" />
        {label}
      </div>
      <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
      <div className="mt-2">
        <Sparkline data={series} color={up ? "#2ee6a6" : "#f87171"} />
      </div>
      {hasValue && (
        <p className={`mt-1 text-right text-sm font-medium ${up ? "text-accent" : "text-danger"}`}>
          {up ? "+" : ""}
          {change.toFixed(2)}%
        </p>
      )}
    </div>
  );
}
