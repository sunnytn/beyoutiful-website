'use client';

import { useCallback, useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';
import { Field, Input, Select, Textarea } from '@/components/ui/Input';

interface Concern { id: string; goal: 'HAIR' | 'SKIN'; name: string; slug: string; isActive: boolean }
interface ProductOpt { name: string; slug: string }
interface RuleProduct { slug: string; weight: number; reason?: string }
interface RoutineStep { order: number; title: string; description: string; productSlug?: string; frequency?: string }
interface Rule {
  id: string;
  name: string;
  description?: string | null;
  priority: number;
  conditions: { goal?: 'HAIR' | 'SKIN'; concerns?: string[]; profile?: Record<string, string[]> };
  productSlugs: RuleProduct[];
  routine?: RoutineStep[] | null;
  blogSlugs: string[];
  isActive: boolean;
}

export default function AdvisorAdminPage() {
  const [concerns, setConcerns] = useState<Concern[]>([]);
  const [rules, setRules] = useState<Rule[]>([]);
  const [products, setProducts] = useState<ProductOpt[]>([]);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [creatingRule, setCreatingRule] = useState(false);
  const [tab, setTab] = useState<'rules' | 'concerns'>('rules');

  const load = useCallback(async () => {
    try {
      const [c, r, p] = await Promise.all([
        adminApi<Concern[]>('/advisor/admin/concerns'),
        adminApi<Rule[]>('/advisor/admin/rules'),
        adminApi<{ rows: ProductOpt[] }>('/products/admin/all?limit=60&includeInactive=true'),
      ]);
      setConcerns(c);
      setRules(r);
      setProducts(p.rows);
    } catch {
      /* handled by empty states */
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  return (
    <div>
      <h1 className="font-display text-3xl">AI Advisor</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Recommendation rules run top-down by priority. No code required — every rule is a form.
      </p>

      <div className="mt-6 flex gap-2">
        {(['rules', 'concerns'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-luxe ${tab === t ? 'bg-forest-700 text-cream-100' : 'bg-white text-ink-soft shadow-soft'}`}
          >
            {t === 'rules' ? `Rules (${rules.length})` : `Concerns (${concerns.length})`}
          </button>
        ))}
      </div>

      {tab === 'concerns' && <ConcernsTab concerns={concerns} onChanged={load} />}

      {tab === 'rules' && (
        <div className="mt-6">
          <Button size="sm" onClick={() => { setCreatingRule(true); setEditingRule(null); }}>+ New Rule</Button>

          {(creatingRule || editingRule) && (
            <RuleForm
              key={editingRule?.id ?? 'new'}
              rule={editingRule}
              concerns={concerns}
              products={products}
              onDone={() => { setCreatingRule(false); setEditingRule(null); void load(); }}
              onCancel={() => { setCreatingRule(false); setEditingRule(null); }}
            />
          )}

          <div className="mt-6 space-y-3">
            {rules.map((r) => (
              <div key={r.id} className="rounded-organic bg-white p-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="font-display text-lg">
                      {r.name}
                      {!r.isActive && <span className="ml-2 rounded bg-ink/10 px-2 py-0.5 text-xs">disabled</span>}
                    </h2>
                    <p className="mt-1 text-xs text-ink-faint">
                      Priority {r.priority} · {r.conditions.goal ?? 'Any goal'} ·{' '}
                      {(r.conditions.concerns ?? []).join(', ') || 'any concern'} → {r.productSlugs.length} products
                      {r.routine?.length ? ` · ${r.routine.length}-step routine` : ''}
                    </p>
                  </div>
                  <div className="flex gap-3 text-sm">
                    <button onClick={() => { setEditingRule(r); setCreatingRule(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-forest-700 hover:underline">Edit</button>
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Delete rule "${r.name}"?`)) return;
                        await adminApi(`/advisor/admin/rules/${r.id}`, { method: 'DELETE' });
                        void load();
                      }}
                      className="text-clay-600 hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {rules.length === 0 && <p className="py-8 text-center text-ink-faint">No rules yet.</p>}
          </div>
        </div>
      )}
    </div>
  );
}

function ConcernsTab({ concerns, onChanged }: { concerns: Concern[]; onChanged: () => void }) {
  const [form, setForm] = useState<{ id?: string; goal: 'HAIR' | 'SKIN'; name: string; slug: string }>({ goal: 'HAIR', name: '', slug: '' });

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    await adminApi('/advisor/admin/concerns', {
      method: 'POST',
      body: { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') },
    });
    setForm({ goal: form.goal, name: '', slug: '' });
    onChanged();
  };

  return (
    <div className="mt-6">
      <form onSubmit={save} className="flex flex-wrap items-end gap-3 rounded-organic bg-white p-6 shadow-soft">
        <Field label="Goal">
          <Select value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value as 'HAIR' | 'SKIN' })}>
            <option value="HAIR">Hair</option>
            <option value="SKIN">Skin</option>
          </Select>
        </Field>
        <Field label="Concern name"><Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Slug" hint="Optional"><Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} /></Field>
        <Button type="submit" size="sm" className="mb-1">{form.id ? 'Update' : 'Add'}</Button>
      </form>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {(['HAIR', 'SKIN'] as const).map((goal) => (
          <div key={goal} className="rounded-organic bg-white p-6 shadow-soft">
            <h3 className="text-xs font-semibold uppercase tracking-luxe text-clay-600">{goal === 'HAIR' ? 'Hair concerns' : 'Skin concerns'}</h3>
            <ul className="mt-3 space-y-2">
              {concerns.filter((c) => c.goal === goal).map((c) => (
                <li key={c.id} className="flex items-center justify-between text-sm">
                  <span>{c.name} <span className="text-xs text-ink-faint">({c.slug})</span></span>
                  <span className="flex gap-2">
                    <button onClick={() => setForm({ id: c.id, goal: c.goal, name: c.name, slug: c.slug })} className="text-xs text-forest-700 hover:underline">Edit</button>
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Delete "${c.name}"?`)) return;
                        await adminApi(`/advisor/admin/concerns/${c.id}`, { method: 'DELETE' });
                        onChanged();
                      }}
                      className="text-xs text-clay-600 hover:underline"
                    >
                      Delete
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function RuleForm({
  rule, concerns, products, onDone, onCancel,
}: {
  rule: Rule | null;
  concerns: Concern[];
  products: ProductOpt[];
  onDone: () => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(rule?.name ?? '');
  const [priority, setPriority] = useState(rule?.priority ?? 50);
  const [goal, setGoal] = useState<'HAIR' | 'SKIN' | ''>(rule?.conditions.goal ?? '');
  const [ruleConcerns, setRuleConcerns] = useState<string[]>(rule?.conditions.concerns ?? []);
  const [ruleProducts, setRuleProducts] = useState<RuleProduct[]>(rule?.productSlugs ?? []);
  const [routine, setRoutine] = useState<RoutineStep[]>(rule?.routine ?? []);
  const [blogSlugs, setBlogSlugs] = useState(rule?.blogSlugs.join(', ') ?? '');
  const [isActive, setIsActive] = useState(rule?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const availableConcerns = goal ? concerns.filter((c) => c.goal === goal) : concerns;

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await adminApi('/advisor/admin/rules', {
        method: 'POST',
        body: {
          id: rule?.id,
          name,
          priority,
          conditions: { ...(goal ? { goal } : {}), ...(ruleConcerns.length ? { concerns: ruleConcerns } : {}) },
          productSlugs: ruleProducts.filter((p) => p.slug),
          routine: routine.map((r, i) => ({ ...r, order: i + 1 })).filter((r) => r.title),
          blogSlugs: blogSlugs.split(',').map((s) => s.trim()).filter(Boolean),
          isActive,
        },
      });
      onDone();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="mt-6 rounded-organic bg-white p-7 shadow-soft">
      <h2 className="font-display text-xl">{rule ? 'Edit rule' : 'New rule'}</h2>
      {error && <p className="mt-3 text-sm text-clay-700">{error}</p>}

      <div className="mt-5 grid gap-5 sm:grid-cols-3">
        <Field label="Rule name"><Input required value={name} onChange={(e) => setName(e.target.value)} /></Field>
        <Field label="Priority" hint="Higher = matched first"><Input type="number" value={priority} onChange={(e) => setPriority(Number(e.target.value))} /></Field>
        <Field label="Applies to">
          <Select value={goal} onChange={(e) => { setGoal(e.target.value as 'HAIR' | 'SKIN' | ''); setRuleConcerns([]); }}>
            <option value="">Any goal</option>
            <option value="HAIR">Hair Care</option>
            <option value="SKIN">Skin Care</option>
          </Select>
        </Field>
      </div>

      <div className="mt-5">
        <p className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">When the customer's concern is…</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {availableConcerns.map((c) => {
            const on = ruleConcerns.includes(c.slug);
            return (
              <button key={c.slug} type="button" onClick={() => setRuleConcerns(on ? ruleConcerns.filter((x) => x !== c.slug) : [...ruleConcerns, c.slug])}
                className={`rounded-full border px-3.5 py-1.5 text-xs ${on ? 'border-forest-700 bg-forest-700 text-cream-100' : 'border-cream-400 bg-white'}`}>
                {c.name}
              </button>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-ink-faint">Leave all unselected to match any concern.</p>
      </div>

      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">Recommend these products</p>
        <div className="mt-3 space-y-3">
          {ruleProducts.map((p, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3">
              <Field label="Product">
                <Select value={p.slug} onChange={(e) => setRuleProducts(ruleProducts.map((x, xi) => (xi === i ? { ...x, slug: e.target.value } : x)))}>
                  <option value="">— choose —</option>
                  {products.map((prod) => <option key={prod.slug} value={prod.slug}>{prod.name}</option>)}
                </Select>
              </Field>
              <Field label="Weight" hint="Higher ranks first">
                <Input type="number" value={p.weight} onChange={(e) => setRuleProducts(ruleProducts.map((x, xi) => (xi === i ? { ...x, weight: Number(e.target.value) } : x)))} />
              </Field>
              <div className="min-w-56 flex-1">
                <Field label="Why (shown to customer)">
                  <Input value={p.reason ?? ''} onChange={(e) => setRuleProducts(ruleProducts.map((x, xi) => (xi === i ? { ...x, reason: e.target.value } : x)))} />
                </Field>
              </div>
              <button type="button" onClick={() => setRuleProducts(ruleProducts.filter((_, x) => x !== i))} className="mb-2.5 text-sm text-clay-600 hover:underline">Remove</button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setRuleProducts([...ruleProducts, { slug: '', weight: 5 }])}>+ Add product</Button>
        </div>
      </div>

      <div className="mt-7">
        <p className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">Routine steps (optional)</p>
        <div className="mt-3 space-y-3">
          {routine.map((s, i) => (
            <div key={i} className="rounded-xl bg-cream-100 p-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <Field label={`Step ${i + 1} title`}><Input value={s.title} onChange={(e) => setRoutine(routine.map((x, xi) => (xi === i ? { ...x, title: e.target.value } : x)))} /></Field>
                <Field label="Product (optional)">
                  <Select value={s.productSlug ?? ''} onChange={(e) => setRoutine(routine.map((x, xi) => (xi === i ? { ...x, productSlug: e.target.value || undefined } : x)))}>
                    <option value="">— none —</option>
                    {products.map((prod) => <option key={prod.slug} value={prod.slug}>{prod.name}</option>)}
                  </Select>
                </Field>
                <Field label="Frequency" hint='e.g. "3× / week"'><Input value={s.frequency ?? ''} onChange={(e) => setRoutine(routine.map((x, xi) => (xi === i ? { ...x, frequency: e.target.value } : x)))} /></Field>
              </div>
              <div className="mt-3">
                <Field label="Instructions"><Textarea value={s.description} onChange={(e) => setRoutine(routine.map((x, xi) => (xi === i ? { ...x, description: e.target.value } : x)))} /></Field>
              </div>
              <button type="button" onClick={() => setRoutine(routine.filter((_, x) => x !== i))} className="mt-2 text-xs text-clay-600 hover:underline">Remove step</button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => setRoutine([...routine, { order: routine.length + 1, title: '', description: '' }])}>+ Add step</Button>
        </div>
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Field label="Related blog slugs" hint="Comma separated"><Input value={blogSlugs} onChange={(e) => setBlogSlugs(e.target.value)} /></Field>
        <label className="flex items-center gap-2 pt-7 text-sm">
          <input type="checkbox" className="h-4 w-4 accent-forest-700" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Rule enabled
        </label>
      </div>

      <div className="mt-7 flex gap-3">
        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save Rule'}</Button>
        <Button type="button" variant="outline" size="sm" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
