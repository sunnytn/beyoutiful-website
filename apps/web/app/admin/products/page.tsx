'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

interface Row {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  images: Array<{ url: string }>;
  categories: Array<{ category: { name: string } }>;
}

export default function ProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '60', includeInactive: 'true' });
      if (q) params.set('q', q);
      const res = await adminApi<{ rows: Row[] }>(`/products/admin/all?${params.toString()}`);
      setRows(res.rows);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(() => void load(), 300);
    return () => clearTimeout(t);
  }, [load]);

  const remove = async (id: string, name: string) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await adminApi(`/products/${id}`, { method: 'DELETE' });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Products</h1>
          <p className="mt-1 text-sm text-ink-soft">{rows.length} products in catalog</p>
        </div>
        <Button href="/admin/products/new" size="sm">+ Add Product</Button>
      </header>

      <div className="w-80">
        <Input placeholder="Search products…" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search products" />
      </div>

      <div className="mt-6 overflow-x-auto rounded-organic bg-white shadow-soft">
        <table className="w-full min-w-[680px] text-sm">
          <thead>
            <tr className="border-b border-cream-300 text-left text-xs font-semibold uppercase tracking-luxe text-ink-soft">
              <th className="px-5 py-3.5">Product</th>
              <th className="px-5 py-3.5">Categories</th>
              <th className="px-5 py-3.5">Price</th>
              <th className="px-5 py-3.5">Stock</th>
              <th className="px-5 py-3.5">Flags</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-ink-faint">Loading…</td></tr>
            ) : (
              rows.map((p) => (
                <tr key={p.id} className="border-b border-cream-200 last:border-0 hover:bg-cream-50">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      {p.images[0] ? <img src={p.images[0].url} alt="" className="h-11 w-9 rounded-lg object-cover" /> : <span className="flex h-11 w-9 items-center justify-center rounded-lg bg-cream-200">🌿</span>}
                      <div>
                        <p className="font-semibold">{p.name}</p>
                        <p className="text-xs text-ink-faint">/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-xs">{p.categories.map((c) => c.category.name).join(', ')}</td>
                  <td className="px-5 py-3 font-semibold">{formatPrice(p.price)}</td>
                  <td className="px-5 py-3">{p.stock}</td>
                  <td className="px-5 py-3 text-xs">
                    {!p.isActive && <span className="mr-1 rounded bg-ink/10 px-1.5 py-0.5">hidden</span>}
                    {p.isFeatured && <span className="mr-1 rounded bg-clay-500/15 px-1.5 py-0.5 text-clay-700">featured</span>}
                    {p.isBestSeller && <span className="rounded bg-forest-100 px-1.5 py-0.5 text-forest-800">bestseller</span>}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <Link href={`/admin/products/${p.id}`} className="mr-3 text-forest-700 hover:underline">Edit</Link>
                    <button onClick={() => remove(p.id, p.name)} className="text-clay-600 hover:underline">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
