import Card, { EmptyState } from "./Card";

export default function GaugeScore({ value }: { value: number }) {
  if (value <= 0) {
    return (
      <Card title="Quality Sentiment">
        <EmptyState text="Quality score appears after profiling." />
      </Card>
    );
  }
  const clamped = Math.min(100, Math.max(0, value));
  const arc = 251.2; // half-circle circumference for r=80
  const offset = arc - (clamped / 100) * arc;
  const label = clamped >= 80 ? "Excellent" : clamped >= 60 ? "Good" : clamped >= 40 ? "Fair" : "Poor";
  return (
    <Card title="Quality Sentiment">
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 200 120" className="w-full max-w-[220px]" role="img" aria-label={`Quality score ${clamped} out of 100`}>
          <defs>
            <linearGradient id="gaugeGrad" x1="0" x2="1">
              <stop offset="0%" stopColor="#f87171" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#2ee6a6" />
            </linearGradient>
          </defs>
          <path d="M 20 100 A 80 80 0 0 1 180 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" strokeLinecap="round" />
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="url(#gaugeGrad)"
            strokeWidth="14"
            strokeLinecap="round"
            strokeDasharray={arc}
            strokeDashoffset={offset}
          />
          <text x="100" y="92" textAnchor="middle" className="fill-white text-3xl font-semibold" fontSize="34">
            {clamped}
          </text>
          <text x="100" y="112" textAnchor="middle" fill="#64748b" fontSize="11">
            {label}
          </text>
        </svg>
      </div>
    </Card>
  );
}
