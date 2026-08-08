'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { adminApi, uploadImage } from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';
import { Field, Input, Textarea } from '@/components/ui/Input';

interface Option { id: string; name: string }
interface ImageRow { url: string; alt?: string; publicId?: string }
interface VariantRow { id?: string; name: string; price: number; stock?: number }
interface FaqRow { question: string; answer: string }

export interface ProductFormValues {
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  benefits: string[];
  directions: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNewArrival: boolean;
  videoUrl: string;
  concerns: string[];
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  categoryIds: string[];
  collectionIds: string[];
  ingredientIds: string[];
  relatedSlugs: string[];
  images: ImageRow[];
  variants: VariantRow[];
  faqs: FaqRow[];
}

const empty: ProductFormValues = {
  name: '', slug: '', shortDescription: '', description: '', benefits: [], directions: '',
  price: 0, stock: 100, isActive: true, isFeatured: false, isBestSeller: false, isNewArrival: false,
  videoUrl: '', concerns: [], tags: [], metaTitle: '', metaDescription: '',
  categoryIds: [], collectionIds: [], ingredientIds: [], relatedSlugs: [], images: [], variants: [], faqs: [],
};

export function ProductForm({ productId }: { productId?: string }) {
  const router = useRouter();
  const [values, setValues] = useState<ProductFormValues>(empty);
  const [categories, setCategories] = useState<Option[]>([]);
  const [collections, setCollections] = useState<Option[]>([]);
  const [ingredients, setIngredients] = useState<Option[]>([]);
  const [concernOptions, setConcernOptions] = useState<Array<{ slug: string; name: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [loaded, setLoaded] = useState(!productId);

  useEffect(() => {
    Promise.all([
      adminApi<Option[]>('/categories?all=true'),
      adminApi<Option[]>('/collections?all=true'),
      adminApi<Option[]>('/ingredients?all=true'),
      adminApi<Array<{ slug: string; name: string }>>('/advisor/admin/concerns'),
    ])
      .then(([c, col, ing, con]) => {
        setCategories(c);
        setCollections(col);
        setIngredients(ing);
        setConcernOptions(con);
      })
      .catch(() => undefined);

    if (productId) {
      adminApi<Record<string, unknown>>(`/products/admin/${productId}`)
        .then((p) => {
          setValues({
            ...empty,
            name: String(p.name ?? ''),
            slug: String(p.slug ?? ''),
            shortDescription: String(p.shortDescription ?? ''),
            description: String(p.description ?? ''),
            benefits: (p.benefits as string[]) ?? [],
            directions: String(p.directions ?? ''),
            price: Number(p.price ?? 0),
            compareAtPrice: p.compareAtPrice ? Number(p.compareAtPrice) : undefined,
            stock: Number(p.stock ?? 100),
            isActive: Boolean(p.isActive),
            isFeatured: Boolean(p.isFeatured),
            isBestSeller: Boolean(p.isBestSeller),
            isNewArrival: Boolean(p.isNewArrival),
            videoUrl: String(p.videoUrl ?? ''),
            concerns: (p.concerns as string[]) ?? [],
            tags: (p.tags as string[]) ?? [],
            metaTitle: String(p.metaTitle ?? ''),
            metaDescription: String(p.metaDescription ?? ''),
            categoryIds: ((p.categories as Array<{ categoryId: string }>) ?? []).map((x) => x.categoryId),
            collectionIds: ((p.collections as Array<{ collectionId: string }>) ?? []).map((x) => x.collectionId),
            ingredientIds: ((p.ingredients as Array<{ ingredientId: string }>) ?? []).map((x) => x.ingredientId),
            relatedSlugs: ((p.relatedFrom as Array<{ related: { slug: string } }>) ?? []).map((x) => x.related.slug),
            images: ((p.images as Array<{ url: string; alt?: string; publicId?: string }>) ?? []).map((im) => ({ url: im.url, alt: im.alt ?? '', publicId: im.publicId ?? undefined })),
            variants: ((p.variants as Array<{ id: string; name: string; price: number; stock: number }>) ?? []).map((v) => ({ id: v.id, name: v.name, price: v.price, stock: v.stock })),
            faqs: ((p.faqs as Array<{ question: string; answer: string }>) ?? []).map((f) => ({ question: f.question, answer: f.answer })),
          });
          setLoaded(true);
        })
        .catch((e) => setError(e.message));
    }
  }, [productId]);

  const set = <K extends keyof ProductFormValues>(key: K, val: ProductFormValues[K]) =>
    setValues((v) => ({ ...v, [key]: val }));

  const toggleId = (key: 'categoryIds' | 'collectionIds' | 'ingredientIds', id: string) =>
    set(key, values[key].includes(id) ? values[key].filter((x) => x !== id) : [...values[key], id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const body = {
        ...values,
        slug: values.slug || undefined,
        compareAtPrice: values.compareAtPrice || undefined,
        videoUrl: values.videoUrl || undefined,
        directions: values.directions || undefined,
        shortDescription: values.shortDescription || undefined,
        metaTitle: values.metaTitle || undefined,
        metaDescription: values.metaDescription || undefined,
      };
      if (productId) {
        await adminApi(`/products/${productId}`, { method: 'PUT', body });
      } else {
        await adminApi('/products', { method: 'POST', body });
      }
      router.push('/admin/products');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
      window.scrollTo({ top: 0 });
    } finally {
      setSaving(false);
    }
  };

  if (!loaded) return <p className="py-10 text-center text-ink-faint">Loading product…</p>;

  return (
    <form onSubmit={submit} className="max-w-4xl space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-3xl">{productId ? `Edit: ${values.name}` : 'New Product'}</h1>
        <Button type="submit" size="sm" disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</Button>
      </header>
      {error && <p className="rounded-lg bg-clay-500/10 p-4 text-sm text-clay-700">{error}</p>}

      <Section title="Basics">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Product name"><Input required value={values.name} onChange={(e) => set('name', e.target.value)} /></Field>
          <Field label="Slug (URL)" hint="Leave blank to auto-generate"><Input value={values.slug} onChange={(e) => set('slug', e.target.value)} /></Field>
          <div className="sm:col-span-2">
            <Field label="Short description" hint="Shown on cards and in search results">
              <Input maxLength={300} value={values.shortDescription} onChange={(e) => set('shortDescription', e.target.value)} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Full description"><Textarea required value={values.description} onChange={(e) => set('description', e.target.value)} /></Field>
          </div>
          <Field label="Base price (Rs.)"><Input type="number" required min={0} value={values.price} onChange={(e) => set('price', Number(e.target.value))} /></Field>
          <Field label="Compare-at price (Rs.)" hint="Optional — shows a strikethrough sale price">
            <Input type="number" min={0} value={values.compareAtPrice ?? ''} onChange={(e) => set('compareAtPrice', e.target.value ? Number(e.target.value) : undefined)} />
          </Field>
          <Field label="Stock"><Input type="number" min={0} value={values.stock} onChange={(e) => set('stock', Number(e.target.value))} /></Field>
          <Field label="Video URL (optional)"><Input value={values.videoUrl} onChange={(e) => set('videoUrl', e.target.value)} placeholder="https://…mp4" /></Field>
        </div>
        <div className="mt-5 flex flex-wrap gap-6">
          {([['isActive', 'Visible on site'], ['isFeatured', 'Featured'], ['isBestSeller', 'Best seller'], ['isNewArrival', 'New arrival']] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-forest-700" checked={values[key]} onChange={(e) => set(key, e.target.checked)} />
              {label}
            </label>
          ))}
        </div>
      </Section>

      <Section title="Images" subtitle="First image is the main one. Unlimited images supported.">
        <div className="flex flex-wrap gap-4">
          {values.images.map((im, i) => (
            <div key={i} className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={im.url} alt="" className="h-28 w-24 rounded-xl object-cover" />
              <div className="absolute -right-2 -top-2 flex gap-1">
                {i > 0 && (
                  <button type="button" title="Move first" onClick={() => set('images', [im, ...values.images.filter((_, x) => x !== i)])} className="rounded-full bg-forest-700 px-1.5 text-xs text-white">↑</button>
                )}
                <button type="button" title="Remove" onClick={() => set('images', values.images.filter((_, x) => x !== i))} className="rounded-full bg-clay-500 px-1.5 text-xs text-white">×</button>
              </div>
            </div>
          ))}
          <label className="flex h-28 w-24 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-cream-400 text-xs text-ink-faint hover:border-forest-500">
            {uploading ? '…' : '+ Upload'}
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={async (e) => {
                const files = Array.from(e.target.files ?? []);
                if (!files.length) return;
                setUploading(true);
                try {
                  for (const file of files) {
                    const res = await uploadImage(file, 'products');
                    setValues((v) => ({ ...v, images: [...v.images, { url: res.url, alt: v.name, publicId: res.publicId }] }));
                  }
                } catch (err) {
                  alert(err instanceof Error ? err.message : 'Upload failed');
                } finally {
                  setUploading(false);
                }
              }}
            />
          </label>
        </div>
        <Field label="Or paste an image URL">
          <Input
            placeholder="https://… (press Enter to add)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                const url = (e.target as HTMLInputElement).value.trim();
                if (url) {
                  set('images', [...values.images, { url, alt: values.name }]);
                  (e.target as HTMLInputElement).value = '';
                }
              }
            }}
          />
        </Field>
      </Section>

      <Section title="Variants" subtitle="Sizes or options (e.g. 100ml / 250ml). Leave empty for a single-price product.">
        <div className="space-y-3">
          {values.variants.map((v, i) => (
            <div key={i} className="flex flex-wrap items-end gap-3">
              <Field label="Name"><Input value={v.name} onChange={(e) => set('variants', values.variants.map((x, xi) => (xi === i ? { ...x, name: e.target.value } : x)))} /></Field>
              <Field label="Price (Rs.)"><Input type="number" min={0} value={v.price} onChange={(e) => set('variants', values.variants.map((x, xi) => (xi === i ? { ...x, price: Number(e.target.value) } : x)))} /></Field>
              <Field label="Stock"><Input type="number" min={0} value={v.stock ?? 100} onChange={(e) => set('variants', values.variants.map((x, xi) => (xi === i ? { ...x, stock: Number(e.target.value) } : x)))} /></Field>
              <button type="button" onClick={() => set('variants', values.variants.filter((_, x) => x !== i))} className="mb-2.5 text-clay-600 hover:underline">Remove</button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('variants', [...values.variants, { name: '', price: values.price }])}>+ Add variant</Button>
        </div>
      </Section>

      <Section title="Story & Guidance">
        <div className="space-y-5">
          <Field label="Benefits" hint="One per line">
            <Textarea value={values.benefits.join('\n')} onChange={(e) => set('benefits', e.target.value.split('\n').map((s) => s.trim()).filter(Boolean))} />
          </Field>
          <Field label="How to use (directions)">
            <Textarea value={values.directions} onChange={(e) => set('directions', e.target.value)} />
          </Field>
        </div>
      </Section>

      <Section title="Organisation">
        <div className="grid gap-6 sm:grid-cols-3">
          <CheckGroup label="Categories" options={categories} selected={values.categoryIds} onToggle={(id) => toggleId('categoryIds', id)} />
          <CheckGroup label="Collections" options={collections} selected={values.collectionIds} onToggle={(id) => toggleId('collectionIds', id)} />
          <CheckGroup label="Ingredients" options={ingredients} selected={values.ingredientIds} onToggle={(id) => toggleId('ingredientIds', id)} />
        </div>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">Concerns (used by advisor & filters)</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {concernOptions.map((c) => {
                const on = values.concerns.includes(c.slug);
                return (
                  <button key={c.slug} type="button" onClick={() => set('concerns', on ? values.concerns.filter((x) => x !== c.slug) : [...values.concerns, c.slug])}
                    className={`rounded-full border px-3.5 py-1.5 text-xs ${on ? 'border-forest-700 bg-forest-700 text-cream-100' : 'border-cream-400 bg-white'}`}>
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>
          <Field label="Tags" hint="Comma separated — helps search">
            <Input value={values.tags.join(', ')} onChange={(e) => set('tags', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
          </Field>
          <Field label="Related product slugs" hint="Comma separated, e.g. rose-water, neem-soap">
            <Input value={values.relatedSlugs.join(', ')} onChange={(e) => set('relatedSlugs', e.target.value.split(',').map((s) => s.trim()).filter(Boolean))} />
          </Field>
        </div>
      </Section>

      <Section title="Product FAQs">
        <div className="space-y-4">
          {values.faqs.map((f, i) => (
            <div key={i} className="rounded-xl bg-cream-100 p-4">
              <Field label={`Question ${i + 1}`}><Input value={f.question} onChange={(e) => set('faqs', values.faqs.map((x, xi) => (xi === i ? { ...x, question: e.target.value } : x)))} /></Field>
              <div className="mt-3">
                <Field label="Answer"><Textarea value={f.answer} onChange={(e) => set('faqs', values.faqs.map((x, xi) => (xi === i ? { ...x, answer: e.target.value } : x)))} /></Field>
              </div>
              <button type="button" onClick={() => set('faqs', values.faqs.filter((_, x) => x !== i))} className="mt-2 text-xs text-clay-600 hover:underline">Remove</button>
            </div>
          ))}
          <Button type="button" variant="outline" size="sm" onClick={() => set('faqs', [...values.faqs, { question: '', answer: '' }])}>+ Add FAQ</Button>
        </div>
      </Section>

      <Section title="SEO">
        <div className="space-y-5">
          <Field label="Meta title"><Input value={values.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} /></Field>
          <Field label="Meta description"><Textarea value={values.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} /></Field>
        </div>
      </Section>

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save Product'}</Button>
        <Button type="button" variant="outline" onClick={() => router.push('/admin/products')}>Cancel</Button>
      </div>
    </form>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-organic bg-white p-7 shadow-soft">
      <h2 className="font-display text-xl">{title}</h2>
      {subtitle && <p className="mt-1 text-xs text-ink-faint">{subtitle}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function CheckGroup({ label, options, selected, onToggle }: { label: string; options: Option[]; selected: string[]; onToggle: (id: string) => void }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-luxe text-ink-soft">{label}</p>
      <div className="mt-2 max-h-44 space-y-1.5 overflow-y-auto rounded-xl border border-cream-300 p-3">
        {options.map((o) => (
          <label key={o.id} className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="h-4 w-4 accent-forest-700" checked={selected.includes(o.id)} onChange={() => onToggle(o.id)} />
            {o.name}
          </label>
        ))}
        {options.length === 0 && <p className="text-xs text-ink-faint">None yet</p>}
      </div>
    </div>
  );
}
