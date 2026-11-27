"use client";

import AdminShell from "./AdminShell";

export default function AdminOverviewPage() {
  return (
    <AdminShell title="Admin overview" subtitle="Platform-wide access and activity.">
      <p className="text-sm text-slate-400">
        Live counts are shown on the <b>Overview</b> metrics cards as soon as users start signing
        up. From here you can review the users list, approve access requests, change branding and
        read the audit log.
      </p>
    </AdminShell>
  );
}
