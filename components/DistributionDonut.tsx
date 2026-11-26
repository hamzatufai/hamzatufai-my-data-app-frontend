"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import Card, { EmptyState } from "./Card";

type Slice = { name: string; value: number; color: string };

export default function DistributionDonut({ data }: { data: Slice[] }) {
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <Card title="Column Type Distribution">
      {data.length === 0 ? (
        <EmptyState text="Column types appear after import." />
      ) : (
        <div className="flex items-center gap-4">
          <div className="relative h-40 w-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} dataKey="value" innerRadius="68%" outerRadius="100%" stroke="none" isAnimationActive={false}>
                  {data.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xs text-slate-500">Type share</span>
              <span className="text-lg font-semibold text-white">{total}%</span>
            </div>
          </div>
          <ul className="flex-1 space-y-2 text-sm">
            {data.map((d) => (
              <li key={d.name} className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="text-slate-400">{d.value}%</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
