import Card, { EmptyState } from "./Card";
import Sparkline from "./Sparkline";

type Col = { name: string; type: string; nullPct: number; quality: number; series: number[] };

export default function TopColumns({ data }: { data: Col[] }) {
  return (
    <Card title="Column Quality" className="xl:col-span-2">
      {data.length === 0 ? (
        <EmptyState text="Column profiles appear after a dataset is profiled." />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[520px] text-sm">
            <thead className="text-left text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="pb-3 font-medium">Column</th>
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 text-right font-medium">Nulls</th>
                <th className="pb-3 text-right font-medium">Quality</th>
                <th className="w-40 pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((c) => (
                <tr key={c.name} className="transition hover:bg-white/[0.02]">
                  <td className="py-3 font-medium text-slate-200">{c.name}</td>
                  <td className="py-3 text-slate-400">{c.type}</td>
                  <td className={`py-3 text-right ${c.nullPct > 5 ? "text-danger" : "text-slate-400"}`}>{c.nullPct.toFixed(1)}%</td>
                  <td className="py-3 text-right text-accent">{c.quality}</td>
                  <td className="py-3">
                    <Sparkline data={c.series} color={c.quality >= 80 ? "#2ee6a6" : "#f59e0b"} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
