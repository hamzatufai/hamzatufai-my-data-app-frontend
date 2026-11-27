"use client";

import { useEffect, useState } from "react";
import AdminShell from "./AdminShell";
import AdminUsersTable from "./AdminUsersTable";
import UserDetailDrawer, { type UserDetail } from "./UserDetailDrawer";
import { authRequest } from "@/lib/auth";

export default function AdminUsers() {
  const [openUserId, setOpenUserId] = useState<string | null>(null);
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!openUserId) return;
    setBusy(true);
    authRequest<UserDetail>("GET", `/api/admin/users/${openUserId}`)
      .then(setDetail)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : "Could not load user."),
      )
      .finally(() => setBusy(false));
  }, [openUserId, reloadKey]);

  async function applyAction(userId: string, action: string, reason?: string) {
    await authRequest("POST", `/api/admin/users/${userId}`, { action, ...(reason ? { reason } : {}) });
    setReloadKey((n) => n + 1);
  }

  return (
    <AdminShell title="All users" subtitle="Every registered person, their status, and full history.">
      {error && <p className="text-sm text-danger" role="alert">{error}</p>}
      <AdminUsersTable onOpenUser={setOpenUserId} />
      {openUserId && (
        <UserDetailDrawer
          detail={detail}
          busy={busy}
          onClose={() => { setOpenUserId(null); setDetail(null); }}
          onAction={applyAction}
        />
      )}
    </AdminShell>
  );
}
