'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { formatDate } from '@/lib/format';
import { Select } from '@/components/ui/Input';
import { Rating } from '@/components/ui/Rating';

interface Review {
  id: string;
  name: string;
  rating: number;
  title: string | null;
  body: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  product: { name: string; slug: string };
}

export default function ReviewsPage() {
  const [rows, setRows] = useState<Review[]>([]);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = status ? `?status=${status}&limit=50` : '?limit=50';
      const res = await adminApi<{ rows: Review[] }>(`/reviews${params}`);
      setRows(res.rows);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { void load(); }, [load]);

  const moderate = async (id: string, newStatus: string) => {
    await adminApi(`/reviews/${id}`, { method: 'PATCH', body: { status: newStatus } });
    void load();
  };

  const remove = async (id: string) => {
    if (!window.confirm('Delete this review?')) return;
    await adminApi(`/reviews/${id}`, { method: 'DELETE' });
    void load();
  };

  return (
    <div>
      <h1 className="font-display text-3xl">Reviews</h1>
      <div className="mt-6 w-52">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter reviews">
          <option value="PENDING">Awaiting approval</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="">All</option>
        </Select>
      </div>

      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-10 text-center text-ink-faint">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-ink-faint">No reviews here.</p>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="rounded-organic bg-white p-6 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Rating value={r.rating} />
                  <p className="mt-1 text-sm">
                    <strong>{r.name}</strong> on <span className="text-forest-700">{r.product.name}</span>
                    <span className="ml-2 text-xs text-ink-faint">{formatDate(r.createdAt)}</span>
                  </p>
                </div>
                <div className="flex gap-2 text-xs font-semibold">
                  {r.status !== 'APPROVED' && (
                    <button onClick={() => moderate(r.id, 'APPROVED')} className="rounded-full bg-forest-700 px-4 py-2 text-cream-100 hover:bg-forest-800">Approve</button>
                  )}
                  {r.status !== 'REJECTED' && (
                    <button onClick={() => moderate(r.id, 'REJECTED')} className="rounded-full border border-clay-500/40 px-4 py-2 text-clay-700 hover:bg-clay-500/10">Reject</button>
                  )}
                  <button onClick={() => remove(r.id)} className="rounded-full border border-cream-400 px-4 py-2 text-ink-soft hover:bg-cream-200">Delete</button>
                </div>
              </div>
              {r.title && <h3 className="mt-3 font-display text-lg">{r.title}</h3>}
              <p className="mt-1 text-sm text-ink-soft">{r.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
