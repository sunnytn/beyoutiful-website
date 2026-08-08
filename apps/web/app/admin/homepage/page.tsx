'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

interface Section {
  id: string;
  key: string;
  title: string | null;
  subtitle: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function HomepageAdminPage() {
  const [sections, setSections] = useState<Section[]>([]);
  const [saved, setSaved] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setSections(await adminApi<Section[]>('/homepage/admin/sections'));
    } catch {
      setSections([]);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const save = async (s: Section) => {
    await adminApi(`/homepage/admin/sections/${s.key}`, {
      method: 'PUT',
      body: { title: s.title, subtitle: s.subtitle, isActive: s.isActive, sortOrder: s.sortOrder },
    });
    setSaved(s.key);
    setTimeout(() => setSaved(null), 1500);
  };

  const set = (key: string, patch: Partial<Section>) =>
    setSections((all) => all.map((s) => (s.key === key ? { ...s, ...patch } : s)));

  return (
    <div>
      <h1 className="font-display text-3xl">Homepage Sections</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Edit headings, reorder or hide any section of the homepage. Content (products, posts…) updates automatically.
      </p>

      <div className="mt-6 space-y-4">
        {sections.map((s) => (
          <div key={s.key} className="rounded-organic bg-white p-6 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="rounded bg-cream-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-luxe text-forest-800">{s.key}</span>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="h-4 w-4 accent-forest-700" checked={s.isActive} onChange={(e) => set(s.key, { isActive: e.target.checked })} />
                  Visible
                </label>
                <div className="w-20">
                  <Input type="number" aria-label="Sort order" value={s.sortOrder} onChange={(e) => set(s.key, { sortOrder: Number(e.target.value) })} />
                </div>
                <Button size="sm" onClick={() => save(s)}>{saved === s.key ? '✓ Saved' : 'Save'}</Button>
              </div>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Title"><Input value={s.title ?? ''} onChange={(e) => set(s.key, { title: e.target.value })} /></Field>
              <Field label="Subtitle"><Input value={s.subtitle ?? ''} onChange={(e) => set(s.key, { subtitle: e.target.value })} /></Field>
            </div>
          </div>
        ))}
        {sections.length === 0 && <p className="py-10 text-center text-ink-faint">Loading sections…</p>}
      </div>
    </div>
  );
}
