import Card, { EmptyState } from "./Card";

export default function InsightRing({ ring, openIssues, text }: { ring: number; openIssues: number; text: string }) {
  if (ring <= 0) {
    return (
      <Card title="AI Quality Signals">
        <EmptyState text="Signals appear after profiling. Suggestions are never applied without your approval." />
      </Card>
    );
  }
  const r = 58;
  const c = 2 * Math.PI * r;
  return (
    <Card title="AI Quality Signals">
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <div className="relative h-40 w-40">
          <svg viewBox="0 0 140 140" className="h-full w-full -rotate-90">
            <circle cx="70" cy="70" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
            <circle
              cx="70"
              cy="70"
              r={r}
              fill="none"
              stroke="#2ee6a6"
              strokeWidth="10"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c - (ring / 100) * c}
              className="drop-shadow-[0_0_6px_rgba(46,230,166,0.6)]"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-semibold text-white">{ring}%</span>
            <span className="text-xs text-slate-500">Confidence</span>
          </div>
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-300">{text}</p>
          <p className="mt-1 text-xs text-slate-500">Open issues: {openIssues}</p>
        </div>
      </div>
    </Card>
  );
}
