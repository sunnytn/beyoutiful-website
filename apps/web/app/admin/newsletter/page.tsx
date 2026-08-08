'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { formatDate } from '@/lib/format';
import { Button } from '@/components/ui/Button';

interface Subscriber {
  id: string;
  email: string;
  isActive: boolean;
  subscribedAt: string;
}

export default function NewsletterPage() {
  const [rows, setRows] = useState<Subscriber[]>([]);
  const [active, setActive] = useState(0);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    adminApi<{ rows: Subscriber[]; total: number; active: number }>('/newsletter/admin/subscribers?limit=100')
      .then((res) => { setRows(res.rows); setTotal(res.total); setActive(res.active); })
      .catch(() => undefined);
  }, []);

  const exportEmails = async () => {
    const res = await adminApi<{ emails: string[] }>('/newsletter/admin/export');
    const blob = new Blob([res.emails.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'newsletter-subscribers.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Newsletter</h1>
          <p className="mt-1 text-sm text-ink-soft">{active} active subscribers · {total} total</p>
        </div>
        <Button size="sm" variant="outline" onClick={exportEmails}>Export active emails</Button>
      </header>

      <div className="mt-6 overflow-x-auto rounded-organic bg-white shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cream-300 text-left text-xs font-semibold uppercase tracking-luxe text-ink-soft">
              <th className="px-5 py-3.5">Email</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((s) => (
              <tr key={s.id} className="border-b border-cream-200 last:border-0">
                <td className="px-5 py-3">{s.email}</td>
                <td className="px-5 py-3">{s.isActive ? '✅ Active' : '— Unsubscribed'}</td>
                <td className="px-5 py-3 text-ink-faint">{formatDate(s.subscribedAt)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={3} className="px-5 py-10 text-center text-ink-faint">No subscribers yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
