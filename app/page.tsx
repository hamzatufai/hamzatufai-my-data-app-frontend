"use client";

import Link from "next/link";
import { Database, Rows3, Gauge, Sparkles, Upload } from "lucide-react";
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
import { dashboardData as demoData, DEMO_MODE } from "@/lib/demo";
import { dashboardFromProfiles } from "@/lib/dashboard";
import { useProfiles } from "@/lib/useProfiles";

const fmt = (n: number) => n.toLocaleString("en-US");

export default function DashboardPage() {
  const profiles = useProfiles();
  const d = DEMO_MODE ? demoData : dashboardFromProfiles(profiles);
  const hasData = d.stats.datasets > 0;

  return (
    <div className="space-y-6">
      <TopBar
        title="Dashboard"
        alerts={d.insights.openIssues}
        action={
          <Link
            href="/import"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-base transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Link>
        }
      />
      <ApiStatus />

      {!hasData && (
        <section className="glass flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <span className="rounded-xl bg-accent/10 p-3 text-accent">
              <Upload className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-semibold text-white">Start with a CSV file</h2>
              <p className="mt-1 max-w-2xl text-sm text-slate-400">
                Import a CSV to fill in your dataset count, row totals, quality score, and column
                details. Your file is profiled in this browser; only its summary is saved here.
              </p>
            </div>
          </div>
          <Link
            href="/import"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-base transition hover:bg-accent/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            <Upload className="h-4 w-4" />
            Import CSV
          </Link>
        </section>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Datasets"
          value={fmt(d.stats.datasets)}
          change={d.statChange.datasets}
          series={d.statSeries.datasets}
          icon={Database}
        />
        <StatCard
          label="Rows Profiled"
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
