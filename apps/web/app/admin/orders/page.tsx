'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { adminApi } from '@/lib/adminApi';
import { formatPrice, formatDate } from '@/lib/format';
import { Input, Select } from '@/components/ui/Input';

const STATUSES = ['PENDING', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] as const;

interface OrderRow {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  address: string;
  city: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{ productName: string; variantName?: string | null; quantity: number; unitPrice?: number; lineTotal?: number }>;
}

export default function OrdersPage() {
  return (
    <Suspense>
      <OrdersInner />
    </Suspense>
  );
}

function OrdersInner() {
  const params = useSearchParams();
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [q, setQ] = useState(params.get('q') ?? '');
  const [status, setStatus] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ limit: '40' });
      if (q) query.set('q', q);
      if (status) query.set('status', status);
      const res = await adminApi<{ rows: OrderRow[] }>(`/orders?${query.toString()}`);
      setOrders(res.rows);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [q, status]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await adminApi(`/orders/${id}/status`, { method: 'PATCH', body: { status: newStatus } });
      setOrders((os) => os.map((o) => (o.id === id ? { ...o, status: newStatus } : o)));
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Orders</h1>
      <div className="mt-6 flex flex-wrap gap-3">
        <div className="w-72">
          <Input placeholder="Search order #, name, phone…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search orders" />
        </div>
        <div className="w-48">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <p className="py-10 text-center text-ink-faint">Loading…</p>
        ) : orders.length === 0 ? (
          <p className="py-10 text-center text-ink-faint">No orders found.</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className="rounded-organic bg-white shadow-soft">
              <button
                className="flex w-full flex-wrap items-center justify-between gap-3 px-6 py-4 text-left"
                onClick={() => setExpanded(expanded === o.id ? null : o.id)}
                aria-expanded={expanded === o.id}
              >
                <div>
                  <span className="font-semibold text-forest-700">{o.orderNumber}</span>
                  <span className="ml-3 text-sm">{o.customerName}</span>
                  <span className="ml-3 text-xs text-ink-faint">{formatDate(o.createdAt)}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-lg">{formatPrice(o.total)}</span>
                  <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${o.status === 'PENDING' ? 'bg-clay-500/15 text-clay-700' : o.status === 'CANCELLED' ? 'bg-ink/10 text-ink-soft' : 'bg-forest-100 text-forest-800'}`}>
                    {o.status}
                  </span>
                </div>
              </button>

              {expanded === o.id && (
                <div className="border-t border-cream-200 px-6 py-5">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">Customer</h3>
                      <p className="mt-2 text-sm leading-relaxed">
                        {o.customerName}<br />
                        📞 <a href={`https://wa.me/${o.customerPhone.replace(/[^0-9]/g, '').replace(/^0/, '92')}`} target="_blank" rel="noopener noreferrer" className="text-forest-700 hover:underline">{o.customerPhone}</a><br />
                        ✉️ {o.customerEmail}<br />
                        📍 {o.address}, {o.city}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">Items</h3>
                      <ul className="mt-2 space-y-1 text-sm">
                        {o.items.map((i, idx) => (
                          <li key={idx}>
                            {i.productName}{i.variantName ? ` (${i.variantName})` : ''} × {i.quantity}
                            {i.lineTotal != null && <span className="text-ink-faint"> — {formatPrice(i.lineTotal)}</span>}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-cream-200 pt-5">
                    <span className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">Move to:</span>
                    {STATUSES.filter((s) => s !== o.status).map((s) => (
                      <button
                        key={s}
                        onClick={() => updateStatus(o.id, s)}
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                          s === 'CANCELLED'
                            ? 'border-clay-500/40 text-clay-700 hover:bg-clay-500/10'
                            : 'border-forest-300 text-forest-800 hover:bg-forest-50'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
