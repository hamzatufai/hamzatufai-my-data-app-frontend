"use client";

import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import Card, { EmptyState } from "./Card";

export default function CleaningChart({ data }: { data: { day: number; cleaned: number; rejected: number }[] }) {
  return (
    <Card title="Cleaning Activity" className="xl:col-span-2 min-h-[300px]">
      {data.length === 0 ? (
        <EmptyState text="Cleaning runs appear here once you apply a transformation." />
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid stroke="rgba(120,255,220,0.06)" vertical={false} />
              <XAxis dataKey="day" tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: "#64748b", fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "#0a1222", border: "1px solid rgba(120,255,220,0.15)", borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 12, color: "#94a3b8" }} />
              <Bar dataKey="cleaned" name="Rows cleaned" fill="#2ee6a6" radius={[3, 3, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="rejected" name="Rows rejected" fill="#f87171" radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
