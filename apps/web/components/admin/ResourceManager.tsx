'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi, uploadImage } from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';

/**
 * Config-driven CRUD screen. Powers categories, collections, ingredients,
 * FAQs, testimonials, gallery, synonyms, SEO entries, users and advisor
 * concerns without duplicating UI code. Business users never touch code —
 * every field is a form input.
 */
export interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'textarea' | 'number' | 'boolean' | 'select' | 'image' | 'tags';
  options?: Array<{ value: string; label: string }>;
  required?: boolean;
  hint?: string;
  showInTable?: boolean;
}

export interface ResourceConfig<Row extends { id: string }> {
  title: string;
  description?: string;
  listPath: string; // GET
  createPath: string; // POST
  updatePath: (id: string) => string; // PUT
  deletePath: (id: string) => string; // DELETE
  updateMethod?: 'PUT' | 'POST' | 'PATCH';
  /** unwraps list responses shaped as {rows}, arrays, etc. */
  extractRows?: (data: unknown) => Row[];
  fields: FieldDef[];
  tableColumns: Array<{ key: string; label: string; render?: (row: Row) => React.ReactNode }>;
  uploadFolder?: string;
  /** for updates that send id inside body via single upsert endpoint */
  upsertViaCreate?: boolean;
}

export function ResourceManager<Row extends { id: string }>({ config }: { config: ResourceConfig<Row> }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await adminApi<unknown>(config.listPath);
      const extracted = config.extractRows
        ? config.extractRows(data)
        : Array.isArray(data)
          ? (data as Row[])
          : ((data as { rows: Row[] }).rows ?? []);
      setRows(extracted);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    void load();
  }, [load]);

  const remove = async (id: string) => {
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    try {
      await adminApi(config.deletePath(id), { method: 'DELETE' });
      await load();
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Delete failed');
    }
  };

  const save = async (values: Record<string, unknown>, id?: string) => {
    if (id && config.upsertViaCreate) {
      await adminApi(config.createPath, { method: 'POST', body: { ...values, id } });
    } else if (id) {
      await adminApi(config.updatePath(id), { method: config.updateMethod ?? 'PUT', body: values });
    } else {
      await adminApi(config.createPath, { method: 'POST', body: values });
    }
    setEditing(null);
    setCreating(false);
    await load();
  };

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">{config.title}</h1>
          {config.description && <p className="mt-1 text-sm text-ink-soft">{config.description}</p>}
        </div>
        <Button size="sm" onClick={() => { setCreating(true); setEditing(null); }}>
          + Add New
        </Button>
      </header>

      {error && <p className="mb-6 rounded-lg bg-clay-500/10 p-4 text-sm text-clay-700">{error}</p>}

      {(creating || editing) && (
        <ResourceForm
          key={editing?.id ?? 'new'}
          config={config}
          initial={editing ?? undefined}
          onCancel={() => { setCreating(false); setEditing(null); }}
          onSave={save}
        />
      )}

      <div className="overflow-x-auto rounded-organic bg-white shadow-soft">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="border-b border-cream-300 text-left">
              {config.tableColumns.map((c) => (
                <th key={c.key} className="px-5 py-3.5 text-xs font-semibold uppercase tracking-luxe text-ink-soft">{c.label}</th>
              ))}
              <th className="px-5 py-3.5 text-right text-xs font-semibold uppercase tracking-luxe text-ink-soft">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={config.tableColumns.length + 1} className="px-5 py-10 text-center text-ink-faint">Loading…</td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={config.tableColumns.length + 1} className="px-5 py-10 text-center text-ink-faint">No items yet — add your first one.</td></tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-b border-cream-200 last:border-0 hover:bg-cream-50">
                  {config.tableColumns.map((c) => (
                    <td key={c.key} className="px-5 py-3.5">
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                    </td>
                  ))}
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => { setEditing(row); setCreating(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="mr-3 text-forest-700 hover:underline">Edit</button>
                    <button onClick={() => remove(row.id)} className="text-clay-600 hover:underline">Delete</button>
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

function ResourceForm<Row extends { id: string }>({
  config,
  initial,
  onCancel,
  onSave,
}: {
  config: ResourceConfig<Row>;
  initial?: Row;
  onCancel: () => void;
  onSave: (values: Record<string, unknown>, id?: string) => Promise<void>;
}) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const v: Record<string, unknown> = {};
    for (const f of config.fields) {
      const existing = initial ? (initial as Record<string, unknown>)[f.key] : undefined;
      v[f.key] = existing ?? (f.type === 'boolean' ? true : f.type === 'tags' ? [] : f.type === 'number' ? 0 : '');
    }
    return v;
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const cleaned: Record<string, unknown> = {};
      for (const f of config.fields) {
        const val = values[f.key];
        if (val === '' && !f.required) continue;
        cleaned[f.key] = f.type === 'number' ? Number(val) : val;
      }
      await onSave(cleaned, initial?.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, val: unknown) => setValues((v) => ({ ...v, [key]: val }));

  return (
    <form onSubmit={submit} className="mb-8 rounded-organic bg-white p-7 shadow-soft">
      <h2 className="font-display text-xl">{initial ? 'Edit item' : 'New item'}</h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        {config.fields.map((f) => (
          <div key={f.key} className={f.type === 'textarea' || f.type === 'tags' ? 'sm:col-span-2' : ''}>
            {f.type === 'boolean' ? (
              <label className="flex items-center gap-3 pt-6 text-sm">
                <input
                  type="checkbox"
                  checked={Boolean(values[f.key])}
                  onChange={(e) => set(f.key, e.target.checked)}
                  className="h-4 w-4 accent-forest-700"
                />
                {f.label}
              </label>
            ) : (
              <Field label={f.label} hint={f.hint}>
                {f.type === 'text' && (
                  <Input required={f.required} value={String(values[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)} />
                )}
                {f.type === 'number' && (
                  <Input type="number" required={f.required} value={String(values[f.key] ?? 0)} onChange={(e) => set(f.key, e.target.value)} />
                )}
                {f.type === 'textarea' && (
                  <Textarea required={f.required} value={String(values[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)} />
                )}
                {f.type === 'select' && (
                  <Select required={f.required} value={String(values[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)}>
                    <option value="">— select —</option>
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </Select>
                )}
                {f.type === 'tags' && (
                  <Input
                    value={Array.isArray(values[f.key]) ? (values[f.key] as string[]).join(', ') : ''}
                    onChange={(e) => set(f.key, e.target.value.split(',').map((s) => s.trim()).filter(Boolean))}
                    placeholder="comma, separated, values"
                  />
                )}
                {f.type === 'image' && (
                  <div className="space-y-2">
                    <Input value={String(values[f.key] ?? '')} onChange={(e) => set(f.key, e.target.value)} placeholder="https://… or upload below" />
                    <input
                      type="file"
                      accept="image/*"
                      className="block text-xs"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploading(f.key);
                        try {
                          const res = await uploadImage(file, config.uploadFolder ?? 'general');
                          set(f.key, res.url);
                        } catch (err) {
                          alert(err instanceof Error ? err.message : 'Upload failed');
                        } finally {
                          setUploading(null);
                        }
                      }}
                    />
                    {uploading === f.key && <p className="text-xs text-ink-faint">Uploading…</p>}
                    {typeof values[f.key] === 'string' && values[f.key] !== '' && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={String(values[f.key])} alt="" className="h-20 rounded-lg object-cover" />
                    )}
                  </div>
                )}
              </Field>
            )}
          </div>
        ))}
      </div>
      {error && <p className="mt-4 text-sm text-clay-700">{error}</p>}
      <div className="mt-6 flex gap-3">
        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
