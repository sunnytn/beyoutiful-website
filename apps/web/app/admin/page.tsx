'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { formatPrice, formatDate } from '@/lib/format';

interface Stats {
  todayCount: number;
  monthCount: number;
  pending: number;
  monthRevenue: number;
  totalOrders: number;
  subscribers: number;
  pendingReviews: number;
  unreadMessages: number;
  recent: Array<{ id: string; orderNumber: string; customerName: string; total: number; status: string; createdAt: string }>;
}

const statusTones: Record<string, string> = {
  PENDING: 'bg-clay-500/15 text-clay-700',
  CONFIRMED: 'bg-forest-100 text-forest-800',
  PACKED: 'bg-forest-100 text-forest-800',
  SHIPPED: 'bg-forest-700 text-cream-100',
  DELIVERED: 'bg-forest-800 text-cream-100',
  CANCELLED: 'bg-ink/10 text-ink-soft',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi<Stats>('/orders/stats/dashboard').then(setStats).catch((e) => setError(e.message));
  }, []);

  return (
    <div>
      <h1 className="font-display text-3xl">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">Assalam-o-Alaikum! Here's how the shop is doing.</p>

      {error && <p className="mt-6 rounded-lg bg-clay-500/10 p-4 text-sm text-clay-700">{error}</p>}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Orders today" value={stats?.todayCount} accent />
        <StatCard label="Orders this month" value={stats?.monthCount} />
        <StatCard label="Revenue this month" value={stats ? formatPrice(stats.monthRevenue) : undefined} />
        <StatCard label="Pending orders" value={stats?.pending} warn={Boolean(stats?.pending)} />
        <StatCard label="Total orders" value={stats?.totalOrders} />
        <StatCard label="Newsletter subscribers" value={stats?.subscribers} />
        <StatCard label="Reviews awaiting approval" value={stats?.pendingReviews} warn={Boolean(stats?.pendingReviews)} href="/admin/reviews" />
        <StatCard label="Unread messages" value={stats?.unreadMessages} warn={Boolean(stats?.unreadMessages)} href="/admin/messages" />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl">Recent Orders</h2>
          <Link href="/admin/orders" className="text-xs uppercase tracking-luxe text-forest-700 hover:underline">View all →</Link>
        </div>
        <div className="mt-4 overflow-x-auto rounded-organic bg-white shadow-soft">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-cream-300 text-left text-xs font-semibold uppercase tracking-luxe text-ink-soft">
                <th className="px-5 py-3.5">Order</th>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Total</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recent ?? []).map((o) => (
                <tr key={o.id} className="border-b border-cream-200 last:border-0 hover:bg-cream-50">
                  <td className="px-5 py-3.5">
                    <Link href={`/admin/orders?q=${o.orderNumber}`} className="font-semibold text-forest-700 hover:underline">
                      {o.orderNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-3.5">{o.customerName}</td>
                  <td className="px-5 py-3.5 font-semibold">{formatPrice(o.total)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusTones[o.status] ?? ''}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3.5 text-ink-faint">{formatDate(o.createdAt)}</td>
                </tr>
              ))}
              {stats && stats.recent.length === 0 && (
                <tr><td colSpan={5} className="px-5 py-10 text-center text-ink-faint">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, accent, warn, href }: { label: string; value?: number | string; accent?: boolean; warn?: boolean; href?: string }) {
  const inner = (
    <div className={`rounded-organic p-6 shadow-soft transition-shadow hover:shadow-lift ${accent ? 'bg-forest-800 text-cream-100' : warn ? 'bg-clay-500/10' : 'bg-white'}`}>
      <p className={`text-xs font-semibold uppercase tracking-luxe ${accent ? 'text-cream-200/60' : 'text-ink-faint'}`}>{label}</p>
      <p className={`mt-2 font-display text-3xl ${warn ? 'text-clay-700' : ''}`}>{value ?? '—'}</p>
    </div>
  );
  return href ? <Link href={href}>{inner}</Link> : inner;
}
