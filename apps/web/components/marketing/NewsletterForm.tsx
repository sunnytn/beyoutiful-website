'use client';

import { FormEvent, useState } from 'react';
import { api } from '@/lib/api';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await api<{ message: string }>('/newsletter/subscribe', { method: 'POST', body: { email } });
      setMessage(res.message);
      setState('done');
      setEmail('');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Something went wrong — please try again.');
      setState('error');
    }
  };

  if (state === 'done') {
    return <p className="rounded-full bg-forest-800 px-6 py-3 text-sm text-cream-100">{message}</p>;
  }

  return (
    <form onSubmit={submit} className="flex w-full max-w-md flex-col gap-2">
      <div className="flex overflow-hidden rounded-full bg-forest-800 p-1.5 ring-1 ring-forest-700 focus-within:ring-clay-400">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Your email address"
          aria-label="Email address"
          className="flex-1 bg-transparent px-4 text-sm text-cream-100 placeholder:text-cream-200/40 focus:outline-none"
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="rounded-full bg-clay-500 px-6 py-2.5 text-xs font-sans font-semibold uppercase tracking-luxe text-white transition-colors hover:bg-clay-600 disabled:opacity-60"
        >
          {state === 'loading' ? 'Joining…' : 'Subscribe'}
        </button>
      </div>
      {state === 'error' && <p className="px-4 text-xs text-clay-300">{message}</p>}
    </form>
  );
}
