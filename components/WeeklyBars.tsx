"use client";

import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card, { EmptyState } from "./Card";

export default function WeeklyBars({ data }: { data: { day: string; thisWeek: number; lastWeek: number }[] }) {
  return (
    <Card title="Rows Processed">
      {data.length === 0 ? (
        <EmptyState text="Weekly processing totals appear after your first run." />
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0a1222", border: "1px solid rgba(120,255,220,0.15)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11, color: "#94a3b8" }} />
              <Bar dataKey="thisWeek" name="This week" fill="#2ee6a6" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="lastWeek" name="Last week" fill="#334155" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
