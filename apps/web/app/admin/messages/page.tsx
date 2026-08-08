'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { formatDate } from '@/lib/format';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function MessagesPage() {
  const [rows, setRows] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminApi<{ rows: Message[] }>('/contact/admin/messages?limit=50');
      setRows(res.rows);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <h1 className="font-display text-3xl">Contact Messages</h1>
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-10 text-center text-ink-faint">Loading…</p>
        ) : rows.length === 0 ? (
          <p className="py-10 text-center text-ink-faint">No messages yet.</p>
        ) : (
          rows.map((m) => (
            <div key={m.id} className={`rounded-organic p-6 shadow-soft ${m.isRead ? 'bg-white' : 'bg-clay-500/5 ring-1 ring-clay-500/20'}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm">
                  <strong>{m.name}</strong> · <a href={`mailto:${m.email}`} className="text-forest-700 hover:underline">{m.email}</a>
                  {m.phone && <span> · {m.phone}</span>}
                  <span className="ml-2 text-xs text-ink-faint">{formatDate(m.createdAt)}</span>
                </p>
                <div className="flex gap-2 text-xs font-semibold">
                  {!m.isRead && (
                    <button
                      onClick={async () => { await adminApi(`/contact/admin/messages/${m.id}/read`, { method: 'PATCH' }); void load(); }}
                      className="rounded-full bg-forest-700 px-4 py-2 text-cream-100"
                    >
                      Mark read
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this message?')) return;
                      await adminApi(`/contact/admin/messages/${m.id}`, { method: 'DELETE' });
                      void load();
                    }}
                    className="rounded-full border border-cream-400 px-4 py-2 text-ink-soft hover:bg-cream-200"
                  >
                    Delete
                  </button>
                </div>
              </div>
              {m.subject && <h3 className="mt-3 font-display text-lg">{m.subject}</h3>}
              <p className="mt-1 whitespace-pre-wrap text-sm text-ink-soft">{m.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
