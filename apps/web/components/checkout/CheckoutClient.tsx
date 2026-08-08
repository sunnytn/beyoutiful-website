'use client';

import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { api } from '@/lib/api';
import { useCart, cartSubtotal } from '@/lib/stores';
import { formatPrice } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';
import { shippingFor } from '@/lib/shipping';

type Step = 'info' | 'review' | 'done';

interface OrderResponse {
  orderNumber: string;
  total: number;
  whatsappUrl: string;
}

export function CheckoutClient() {
  const { items, clear } = useCart();
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<Step>('info');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', address: '', city: '', postalCode: '', notes: '',
  });

  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="skeleton mx-auto h-64 max-w-3xl" />;

  const subtotal = cartSubtotal(items);
  const shipping = shippingFor(subtotal);
  const total = subtotal + shipping;

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="mx-auto max-w-md rounded-organic bg-white p-14 text-center shadow-soft">
        <h1 className="font-display text-2xl">Your cart is empty</h1>
        <Button href="/shop" className="mt-8">Browse Products</Button>
      </div>
    );
  }

  const submitInfo = (e: FormEvent) => {
    e.preventDefault();
    setStep('review');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const placeOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const res = await api<OrderResponse>('/orders', {
        method: 'POST',
        body: {
          items: items.map((i) => ({ productId: i.productId, variantId: i.variantId ?? undefined, quantity: i.quantity })),
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          postalCode: form.postalCode || undefined,
          notes: form.notes || undefined,
        },
      });
      setOrder(res);
      clear();
      setStep('done');
      window.scrollTo({ top: 0 });
      // Auto-open WhatsApp with the pre-filled order message — customer just presses Send.
      setTimeout(() => {
        window.open(res.whatsappUrl, '_blank', 'noopener');
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not place order — please try again or order via WhatsApp.');
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* stepper */}
      <ol className="mb-12 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-luxe" aria-label="Checkout steps">
        {(['Information', 'Review', 'Confirmed'] as const).map((label, i) => {
          const stepIndex = step === 'info' ? 0 : step === 'review' ? 1 : 2;
          const active = i <= stepIndex;
          return (
            <li key={label} className="flex items-center gap-3">
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] ${active ? 'bg-forest-700 text-cream-100' : 'bg-cream-300 text-ink-faint'}`}>
                {i + 1}
              </span>
              <span className={active ? 'text-forest-800' : 'text-ink-faint'}>{label}</span>
              {i < 2 && <span className="h-px w-8 bg-cream-400" aria-hidden />}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait">
        {step === 'info' && (
          <motion.div key="info" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
              <form onSubmit={submitInfo} className="rounded-organic bg-white p-8 shadow-soft sm:p-10">
                <h1 className="font-display text-2xl">Delivery Information</h1>
                <div className="mt-7 grid gap-5 sm:grid-cols-2">
                  <Field label="Full name">
                    <Input required maxLength={120} value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} autoComplete="name" />
                  </Field>
                  <Field label="Phone" hint="We confirm orders on WhatsApp">
                    <Input required type="tel" pattern="[0-9+\-\s()]{7,20}" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" placeholder="03XX-XXXXXXX" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Email" hint="Your order confirmation is sent here">
                      <Input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" />
                    </Field>
                  </div>
                  <div className="sm:col-span-2">
                    <Field label="Complete address">
                      <Textarea required maxLength={400} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} autoComplete="street-address" placeholder="House, street, area, nearest landmark" />
                    </Field>
                  </div>
                  <Field label="City">
                    <Input required maxLength={80} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} autoComplete="address-level2" />
                  </Field>
                  <Field label="Postal code (optional)">
                    <Input maxLength={12} value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} autoComplete="postal-code" />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="Order notes (optional)">
                      <Input maxLength={500} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Delivery instructions, gift note…" />
                    </Field>
                  </div>
                </div>
                <Button type="submit" size="lg" className="mt-8 w-full sm:w-auto">Continue to Review</Button>
              </form>
              <OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />
            </div>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div key="review" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}>
            <div className="grid gap-10 lg:grid-cols-[1fr_340px]">
              <div className="rounded-organic bg-white p-8 shadow-soft sm:p-10">
                <h1 className="font-display text-2xl">Review Your Order</h1>

                <section className="mt-7">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">Delivering to</h2>
                    <button onClick={() => setStep('info')} className="text-xs text-clay-600 hover:underline">Edit</button>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed">
                    <strong>{form.fullName}</strong><br />
                    {form.address}<br />
                    {form.city}{form.postalCode ? ` ${form.postalCode}` : ''}<br />
                    {form.phone} · {form.email}
                  </p>
                </section>

                <section className="mt-8">
                  <h2 className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">Items</h2>
                  <ul className="mt-3 divide-y divide-cream-200">
                    {items.map((i) => (
                      <li key={`${i.productId}-${i.variantId}`} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <span>
                          {i.name}
                          {i.variantName && <span className="text-ink-faint"> · {i.variantName}</span>}
                          <span className="text-ink-faint"> × {i.quantity}</span>
                        </span>
                        <span className="font-semibold">{formatPrice(i.unitPrice * i.quantity)}</span>
                      </li>
                    ))}
                  </ul>
                </section>

                <section className="mt-8 rounded-xl bg-cream-200/70 p-5 text-sm leading-relaxed text-ink-soft">
                  <strong className="text-ink">How confirmation works:</strong> when you press Place Order, we save your
                  order and email you a confirmation. WhatsApp then opens with your order details already written —
                  just press <strong className="text-forest-700">Send</strong> and we'll start packing. Payment is cash
                  on delivery.
                </section>

                {error && <p className="mt-5 rounded-lg bg-clay-500/10 p-4 text-sm text-clay-700">{error}</p>}

                <div className="mt-8 flex flex-wrap gap-4">
                  <Button variant="outline" onClick={() => setStep('info')}>Back</Button>
                  <Button size="lg" onClick={placeOrder} disabled={placing} className="flex-1 sm:flex-none sm:min-w-64">
                    {placing ? 'Placing Order…' : `Place Order · ${formatPrice(total)}`}
                  </Button>
                </div>
              </div>
              <OrderSummary items={items} subtotal={subtotal} shipping={shipping} total={total} />
            </div>
          </motion.div>
        )}

        {step === 'done' && order && (
          <motion.div key="done" initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} className="mx-auto max-w-xl">
            <div className="rounded-organic bg-white p-10 text-center shadow-soft sm:p-14">
              <motion.span
                className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-forest-700 text-4xl text-cream-100"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.15 }}
                aria-hidden
              >
                ✓
              </motion.span>
              <h1 className="heading-md mt-6">Order Placed!</h1>
              <p className="mt-3 text-sm text-ink-soft">
                Order number{' '}
                <strong className="font-display text-lg text-forest-800">{order.orderNumber}</strong>
              </p>
              <p className="prose-organic mx-auto mt-4 max-w-sm text-sm">
                A confirmation email is on its way. WhatsApp is opening with your order pre-written —{' '}
                <strong className="text-ink">just press Send</strong> to confirm with us.
              </p>
              <a
                href={order.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#25D366] px-8 py-4 text-sm font-semibold uppercase tracking-luxe text-white shadow-soft transition-transform hover:scale-[1.02]"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.9 2.2c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.7 1.6.3.2.5.1.7-.1l1.1-1.3c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.3.6.4 0 .1 0 .8-.6 1.4z" />
                </svg>
                Confirm on WhatsApp
              </a>
              <p className="mt-6 text-xs text-ink-faint">
                WhatsApp didn't open? Tap the button above, or message us at 0300-0527443 with your order number.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function OrderSummary({
  items, subtotal, shipping, total,
}: {
  items: ReturnType<typeof useCart.getState>['items'];
  subtotal: number;
  shipping: number;
  total: number;
}) {
  return (
    <aside className="h-fit rounded-organic bg-white p-8 shadow-soft" aria-label="Order summary">
      <h2 className="font-display text-xl">Summary</h2>
      <ul className="mt-5 space-y-3">
        {items.map((i) => (
          <li key={`${i.productId}-${i.variantId}`} className="flex items-center gap-3 text-sm">
            <div className="relative h-12 w-10 shrink-0 overflow-hidden rounded-lg bg-cream-200">
              {i.image && <Image src={i.image} alt="" fill sizes="40px" className="object-cover" />}
            </div>
            <span className="flex-1 leading-tight">
              {i.name} <span className="text-ink-faint">× {i.quantity}</span>
            </span>
            <span className="font-semibold">{formatPrice(i.unitPrice * i.quantity)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-6 space-y-2 border-t border-cream-300 pt-4 text-sm">
        <div className="flex justify-between"><dt className="text-ink-soft">Subtotal</dt><dd>{formatPrice(subtotal)}</dd></div>
        <div className="flex justify-between"><dt className="text-ink-soft">Delivery</dt><dd>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</dd></div>
        <div className="flex justify-between pt-2 text-base font-semibold">
          <dt>Total</dt>
          <dd className="font-display text-xl text-forest-800">{formatPrice(total)}</dd>
        </div>
      </dl>
      <p className="mt-4 text-xs text-ink-faint">💵 Cash on Delivery</p>
    </aside>
  );
}
