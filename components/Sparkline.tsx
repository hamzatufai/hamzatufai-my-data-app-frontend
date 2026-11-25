"use client";

import { Line, LineChart, ResponsiveContainer } from "recharts";

export default function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (data.length === 0) return <div className="h-10" aria-hidden="true" />;
  const points = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full" aria-hidden="true">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points}>
          <Line type="monotone" dataKey="v" stroke={color} strokeWidth={1.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
