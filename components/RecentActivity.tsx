import { CheckCircle2, AlertTriangle } from "lucide-react";
import Card, { EmptyState } from "./Card";

export default function RecentActivity({ items }: { items: { name: string; action: string; status: "ok" | "warn" }[] }) {
  return (
    <Card title="Recent Activity">
      {items.length === 0 ? (
        <EmptyState text="Imports, cleaning runs and exports are logged here." />
      ) : (
        <ul className="space-y-3">
          {items.map((i, index) => (
            <li key={`${i.name}-${i.action}-${index}`} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                {i.status === "ok" ? (
                  <CheckCircle2 className="h-4 w-4 text-accent" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-danger" />
                )}
                <span className="text-slate-200">{i.name}</span>
              </span>
              <span className={i.status === "ok" ? "text-accent" : "text-danger"}>{i.action}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
