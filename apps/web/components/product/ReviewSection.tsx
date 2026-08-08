'use client';

import { FormEvent, useState } from 'react';
import { api, ProductDetail } from '@/lib/api';
import { formatDate } from '@/lib/format';
import { Rating } from '@/components/ui/Rating';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';

type Review = ProductDetail['reviews'][number];

export function ReviewSection({
  productSlug,
  reviews,
  avgRating,
  reviewCount,
}: {
  productSlug: string;
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
}) {
  const [showForm, setShowForm] = useState(false);
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ name: '', email: '', rating: 5, title: '', body: '' });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setState('loading');
    try {
      const res = await api<{ message: string }>('/reviews', { method: 'POST', body: { productSlug, ...form } });
      setMessage(res.message);
      setState('done');
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Could not submit review.');
      setState('error');
    }
  };

  return (
    <section className="mt-20" aria-labelledby="reviews-heading">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 id="reviews-heading" className="heading-md">Customer Reviews</h2>
          {reviewCount > 0 ? (
            <div className="mt-2 flex items-center gap-3">
              <span className="font-display text-3xl text-forest-800">{avgRating.toFixed(1)}</span>
              <Rating value={avgRating} count={reviewCount} size={18} />
            </div>
          ) : (
            <p className="prose-organic mt-2 text-sm">Be the first to share your experience.</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Close' : 'Write a Review'}
        </Button>
      </div>

      {showForm && (
        <div className="mt-8 rounded-organic bg-white p-8 shadow-soft">
          {state === 'done' ? (
            <p className="text-center text-forest-700">{message}</p>
          ) : (
            <form onSubmit={submit} className="grid gap-5 sm:grid-cols-2">
              <Field label="Your name">
                <Input required maxLength={80} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </Field>
              <Field label="Email (optional)">
                <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </Field>
              <div className="sm:col-span-2">
                <span className="text-xs font-sans font-semibold uppercase tracking-luxe text-ink-soft">Rating</span>
                <div className="mt-2 flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n} star${n > 1 ? 's' : ''}`}
                      onClick={() => setForm({ ...form, rating: n })}
                      className={`text-2xl transition-transform hover:scale-110 ${n <= form.rating ? 'text-clay-500' : 'text-cream-400'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <Field label="Review title (optional)">
                  <Input maxLength={140} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Your review">
                  <Textarea required maxLength={2000} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
                </Field>
              </div>
              {state === 'error' && <p className="text-sm text-clay-700 sm:col-span-2">{message}</p>}
              <div className="sm:col-span-2">
                <Button type="submit" disabled={state === 'loading'}>
                  {state === 'loading' ? 'Submitting…' : 'Submit Review'}
                </Button>
              </div>
            </form>
          )}
        </div>
      )}

      {reviews.length > 0 && (
        <ul className="mt-10 grid gap-6 md:grid-cols-2">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-organic bg-white p-7 shadow-soft">
              <div className="flex items-center justify-between">
                <Rating value={r.rating} />
                <span className="text-xs text-ink-faint">{formatDate(r.createdAt)}</span>
              </div>
              {r.title && <h3 className="mt-3 font-display text-lg">{r.title}</h3>}
              <p className="prose-organic mt-2 text-sm">{r.body}</p>
              <p className="mt-4 text-xs font-semibold uppercase tracking-luxe text-ink-soft">— {r.name}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
