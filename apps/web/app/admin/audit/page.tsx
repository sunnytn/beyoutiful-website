'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';

interface AuditRow {
  id: string;
  action: string;
  entity: string;
  entityId: string | null;
  createdAt: string;
  user: { email: string; fullName: string } | null;
  detail: unknown;
}

export default function AuditPage() {
  const [rows, setRows] = useState<AuditRow[]>([]);

  useEffect(() => {
    adminApi<{ rows: AuditRow[] }>('/admin/audit?limit=100')
      .then((res) => setRows(res.rows))
      .catch(() => undefined);
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">Audit Log</h1>
      <p className="mt-1 text-sm text-ink-soft">Every admin action, recorded automatically.</p>
      <div className="mt-6 overflow-x-auto rounded-organic bg-white shadow-soft">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-cream-300 text-left text-xs font-semibold uppercase tracking-luxe text-ink-soft">
              <th className="px-5 py-3.5">When</th>
              <th className="px-5 py-3.5">Who</th>
              <th className="px-5 py-3.5">Action</th>
              <th className="px-5 py-3.5">Entity</th>
              <th className="px-5 py-3.5">Detail</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-cream-200 last:border-0">
                <td className="px-5 py-3 text-xs text-ink-faint">{new Date(r.createdAt).toLocaleString('en-PK')}</td>
                <td className="px-5 py-3">{r.user?.fullName ?? 'System'}</td>
                <td className="px-5 py-3">
                  <span className={`rounded px-2 py-0.5 text-xs font-semibold ${r.action === 'DELETE' ? 'bg-clay-500/15 text-clay-700' : 'bg-forest-100 text-forest-800'}`}>{r.action}</span>
                </td>
                <td className="px-5 py-3">{r.entity}{r.entityId ? ` #${r.entityId.slice(-6)}` : ''}</td>
                <td className="px-5 py-3 text-xs text-ink-faint">{r.detail ? JSON.stringify(r.detail).slice(0, 60) : '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-faint">No activity yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
