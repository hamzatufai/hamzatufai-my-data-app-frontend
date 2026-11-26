import { Database, Rows3, Gauge, Sparkles } from "lucide-react";
import StatCard from "@/components/StatCard";
import TopBar from "@/components/TopBar";
import QualityTrend from "@/components/QualityTrend";
import DistributionDonut from "@/components/DistributionDonut";
import GaugeScore from "@/components/GaugeScore";
import TopColumns from "@/components/TopColumns";
import InsightRing from "@/components/InsightRing";
import CleaningChart from "@/components/CleaningChart";
import WeeklyBars from "@/components/WeeklyBars";
import RecentActivity from "@/components/RecentActivity";
import FeatureStrip from "@/components/FeatureStrip";
import ApiStatus from "@/components/ApiStatus";
import { dashboardData as d } from "@/lib/demo";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function DashboardPage() {
  const hasData = d.stats.datasets > 0;

  return (
    <div className="space-y-6">
      <TopBar title="Dashboard" alerts={d.insights.openIssues} />
      <ApiStatus />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Datasets"
          value={fmt(d.stats.datasets)}
          change={d.statChange.datasets}
          series={d.statSeries.datasets}
          icon={Database}
        />
        <StatCard
          label="Total Rows Processed"
          value={fmt(d.stats.rows)}
          change={d.statChange.rows}
          series={d.statSeries.rows}
          icon={Rows3}
        />
        <StatCard
          label="Data Quality Score"
          value={hasData ? `${d.stats.quality}` : "—"}
          change={d.statChange.quality}
          series={d.statSeries.quality}
          icon={Gauge}
        />
        <StatCard
          label="Cleaning Operations"
          value={fmt(d.stats.operations)}
          change={d.statChange.operations}
          series={d.statSeries.operations}
          icon={Sparkles}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <QualityTrend data={d.trend} />
        <div className="flex flex-col gap-6">
          <DistributionDonut data={d.distribution} />
          <GaugeScore value={d.stats.quality} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <TopColumns data={d.columns} />
        <InsightRing
          ring={d.insights.ring}
          openIssues={d.insights.openIssues}
          text={d.insights.text}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <CleaningChart data={d.cleaning} />
        <div className="flex flex-col gap-6">
          <WeeklyBars data={d.weekly} />
          <RecentActivity items={d.activity} />
        </div>
      </div>

      <FeatureStrip />
      {!hasData && <p className="sr-only">No datasets imported yet.</p>}
    </div>
  );
}
