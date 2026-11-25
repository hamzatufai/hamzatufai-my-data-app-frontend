import {
  LayoutDashboard, Database, Upload, Activity, Sparkles, Wand2, LineChart,
  ShieldCheck, Terminal, Download, Plug, History, Settings, LifeBuoy,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Pages without a real implementation stay disabled, never fake success. */
  implemented: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard, implemented: true },
  { label: "My Datasets", href: "/datasets", icon: Database, implemented: false },
  { label: "Import Data", href: "/import", icon: Upload, implemented: false },
  { label: "Data Profiling", href: "/profiling", icon: Activity, implemented: false },
  { label: "Cleaning Studio", href: "/cleaning", icon: Sparkles, implemented: false },
  { label: "Data Transformation", href: "/transform", icon: Wand2, implemented: false },
  { label: "Statistical Analysis", href: "/statistics", icon: LineChart, implemented: false },
  { label: "Data Validation", href: "/validation", icon: ShieldCheck, implemented: false },
  { label: "SQL Workspace", href: "/sql", icon: Terminal, implemented: false },
  { label: "Export Center", href: "/export", icon: Download, implemented: false },
  { label: "Integrations", href: "/integrations", icon: Plug, implemented: false },
  { label: "Cleaning History", href: "/history", icon: History, implemented: false },
  { label: "Settings", href: "/settings", icon: Settings, implemented: false },
  { label: "Help & Support", href: "/help", icon: LifeBuoy, implemented: false },
];
