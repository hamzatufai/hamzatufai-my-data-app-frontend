"use client";

import { useMemo, useState } from "react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card, { EmptyState } from "./Card";

const RANGES = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "1Y", days: 365 },
];

export default function QualityTrend({ data }: { data: { day: number; score: number }[] }) {
  const [range, setRange] = useState(1);
  const sliced = useMemo(() => data.slice(-RANGES[range].days), [data, range]);

  return (
    <Card
      title="Data Quality Performance"
      className="xl:col-span-2 min-h-[340px]"
      right={
        <div className="flex gap-1 rounded-lg bg-white/5 p-1 text-xs">
          {RANGES.map((r, i) => (
            <button
              key={r.label}
              type="button"
              onClick={() => setRange(i)}
              aria-pressed={range === i}
              className={`rounded-md px-2.5 py-1 transition ${
                range === i ? "bg-accent/15 text-accent" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      }
    >
      {sliced.length === 0 ? (
        <EmptyState text="Quality trend appears after your first profiled dataset." />
      ) : (
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sliced} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="qFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2ee6a6" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#2ee6a6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="rgba(120,255,220,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} domain={["dataMin - 5", "dataMax + 5"]} />
              <Tooltip
                contentStyle={{ background: "#0a1222", border: "1px solid rgba(120,255,220,0.15)", borderRadius: 8 }}
                labelFormatter={(d) => `Day ${d}`}
                formatter={(v) => [`${v}`, "Quality score"]}
              />
              <Area type="monotone" dataKey="score" stroke="#2ee6a6" strokeWidth={2} fill="url(#qFill)" isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
