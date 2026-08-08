'use client';

import { useEffect, useState } from 'react';
import { adminApi } from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

interface Setting {
  key: string;
  value: unknown;
  group: string;
}

const groupLabels: Record<string, string> = {
  general: 'General',
  contact: 'Contact Details',
  social: 'Social Links',
  shipping: 'Shipping & Delivery',
  seo: 'Default SEO',
  advisor: 'Advisor',
};

const fieldLabels: Record<string, string> = {
  'business.name': 'Business name',
  'business.email': 'Business email',
  'business.whatsapp': 'WhatsApp number (international, e.g. 923000527443)',
  'business.whatsappDisplay': 'WhatsApp display number',
  'business.city': 'Location',
  'social.facebook': 'Facebook URL',
  'social.instagram': 'Instagram URL',
  'social.whatsappCatalog': 'WhatsApp catalog URL',
  'shipping.flatFee': 'Delivery fee (Rs.)',
  'shipping.freeAbove': 'Free delivery above (Rs.)',
  'shipping.dispatchDays': 'Dispatch time',
  'shipping.deliveryDays': 'Delivery time',
  'seo.defaultTitle': 'Default meta title',
  'seo.defaultDescription': 'Default meta description',
  'advisor.strategy': 'Recommendation engine (rules | llm)',
};

export default function SettingsPage() {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    adminApi<Setting[]>('/settings').then(setSettings).catch(() => undefined);
  }, []);

  const set = (key: string, value: string) =>
    setSettings((all) =>
      all.map((s) => (s.key === key ? { ...s, value: /^\d+$/.test(value) && typeof s.value === 'number' ? Number(value) : value } : s)),
    );

  const save = async () => {
    setSaving(true);
    setMessage('');
    try {
      await adminApi('/settings', {
        method: 'PUT',
        body: { entries: settings.map(({ key, value, group }) => ({ key, value, group })) },
      });
      setMessage('✓ Settings saved');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(''), 2500);
    }
  };

  const groups = [...new Set(settings.map((s) => s.group))];

  return (
    <div className="max-w-3xl">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl">Settings</h1>
        <div className="flex items-center gap-3">
          {message && <span className="text-sm text-forest-700">{message}</span>}
          <Button size="sm" onClick={save} disabled={saving}>{saving ? 'Saving…' : 'Save All'}</Button>
        </div>
      </header>

      <div className="mt-6 space-y-6">
        {groups.map((g) => (
          <section key={g} className="rounded-organic bg-white p-7 shadow-soft">
            <h2 className="font-display text-xl">{groupLabels[g] ?? g}</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              {settings.filter((s) => s.group === g).map((s) => (
                <Field key={s.key} label={fieldLabels[s.key] ?? s.key}>
                  <Input value={String(s.value ?? '')} onChange={(e) => set(s.key, e.target.value)} />
                </Field>
              ))}
            </div>
          </section>
        ))}
        {settings.length === 0 && <p className="py-10 text-center text-ink-faint">Loading settings…</p>}
      </div>
    </div>
  );
}
