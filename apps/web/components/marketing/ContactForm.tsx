'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';

export function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await api<{ message: string }>('/contact', { method: 'POST', body: form });
      setMessage(res.message);
      setState('done');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not send message — please try WhatsApp instead.');
      setState('error');
    }
  };

  if (state === 'done') {
    return (
      <div className="rounded-xl bg-forest-50 p-6 text-center">
        <p className="text-2xl" aria-hidden>🌿</p>
        <p className="mt-2 font-display text-xl text-forest-800">Message received!</p>
        <p className="mt-1 text-sm text-ink-soft">{message}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
      <Field label="Your name">
        <Input required maxLength={120} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
      </Field>
      <Field label="Email">
        <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </Field>
      <Field label="Phone (optional)">
        <Input maxLength={20} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
      </Field>
      <Field label="Subject (optional)">
        <Input maxLength={160} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
      </Field>
      <div className="sm:col-span-2">
        <Field label="Message">
          <Textarea required maxLength={3000} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />
        </Field>
      </div>
      {state === 'error' && <p className="text-sm text-clay-700 sm:col-span-2">{message}</p>}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={state === 'loading'} className="w-full sm:w-auto">
          {state === 'loading' ? 'Sending…' : 'Send Message'}
        </Button>
      </div>
    </form>
  );
}
