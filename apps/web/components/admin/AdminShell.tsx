'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FormEvent, useEffect, useState } from 'react';
import { useAdminAuth } from '@/lib/stores';
import { adminLogin } from '@/lib/adminApi';
import { Button } from '@/components/ui/Button';
import { Field, Input } from '@/components/ui/Input';

const nav: Array<{ group: string; items: Array<{ label: string; href: string; icon: string }> }> = [
  {
    group: 'Overview',
    items: [{ label: 'Dashboard', href: '/admin', icon: '📊' }],
  },
  {
    group: 'Catalog',
    items: [
      { label: 'Products', href: '/admin/products', icon: '🧴' },
      { label: 'Categories', href: '/admin/categories', icon: '🗂' },
      { label: 'Collections', href: '/admin/collections', icon: '🎁' },
      { label: 'Ingredients', href: '/admin/ingredients', icon: '🌿' },
    ],
  },
  {
    group: 'Sales',
    items: [
      { label: 'Orders', href: '/admin/orders', icon: '🛍' },
      { label: 'Reviews', href: '/admin/reviews', icon: '⭐' },
      { label: 'Messages', href: '/admin/messages', icon: '📩' },
      { label: 'Newsletter', href: '/admin/newsletter', icon: '✉️' },
    ],
  },
  {
    group: 'Content',
    items: [
      { label: 'Blog', href: '/admin/blog', icon: '📝' },
      { label: 'FAQs', href: '/admin/faqs', icon: '❓' },
      { label: 'Testimonials', href: '/admin/testimonials', icon: '💬' },
      { label: 'Before / After', href: '/admin/gallery', icon: '🖼' },
      { label: 'Homepage', href: '/admin/homepage', icon: '🏠' },
    ],
  },
  {
    group: 'Intelligence',
    items: [
      { label: 'Advisor Rules', href: '/admin/advisor', icon: '🧠' },
      { label: 'Search Synonyms', href: '/admin/synonyms', icon: '🔍' },
      { label: 'SEO', href: '/admin/seo', icon: '📈' },
    ],
  },
  {
    group: 'System',
    items: [
      { label: 'Users', href: '/admin/users', icon: '👥' },
      { label: 'Settings', href: '/admin/settings', icon: '⚙️' },
      { label: 'Audit Log', href: '/admin/audit', icon: '🧾' },
    ],
  },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, accessToken, logout } = useAdminAuth();
  const pathname = usePathname();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  if (!hydrated) return null;
  if (!accessToken || !user || (user.role !== 'ADMIN' && user.role !== 'STAFF')) {
    return <LoginScreen />;
  }

  return (
    <div className="flex min-h-screen bg-cream-100">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 flex-col overflow-y-auto bg-forest-900 px-4 py-6 lg:flex">
        <Link href="/admin" className="px-3">
          <span className="font-display text-lg tracking-[0.2em] text-cream-100">BEYOUTIFUL</span>
          <span className="ml-2 rounded bg-clay-500 px-1.5 py-0.5 text-[9px] font-bold uppercase text-white">Admin</span>
        </Link>
        <nav className="mt-8 flex-1 space-y-6">
          {nav.map((g) => (
            <div key={g.group}>
              <p className="px-3 text-[10px] font-semibold uppercase tracking-luxe text-cream-200/40">{g.group}</p>
              <ul className="mt-2 space-y-0.5">
                {g.items.map((item) => {
                  const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors ${
                          active ? 'bg-forest-700 text-cream-100' : 'text-cream-200/70 hover:bg-forest-800 hover:text-cream-100'
                        }`}
                      >
                        <span aria-hidden>{item.icon}</span>
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
        <div className="border-t border-forest-800 pt-4">
          <p className="px-3 text-xs text-cream-200/60">{user.fullName}</p>
          <div className="mt-2 flex gap-2 px-3">
            <Link href="/" className="text-xs text-cream-200/60 hover:text-cream-100">View site</Link>
            <span className="text-cream-200/30">·</span>
            <button onClick={logout} className="text-xs text-clay-300 hover:text-clay-200">Sign out</button>
          </div>
        </div>
      </aside>

      <div className="flex-1 lg:pl-60">
        {/* mobile top bar */}
        <div className="sticky top-0 z-20 flex items-center justify-between bg-forest-900 px-4 py-3 lg:hidden">
          <Link href="/admin" className="font-display text-sm tracking-[0.2em] text-cream-100">BEYOUTIFUL ADMIN</Link>
          <MobileNav pathname={pathname} onLogout={logout} />
        </div>
        <main className="p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

function MobileNav({ pathname, onLogout }: { pathname: string; onLogout: () => void }) {
  const [open, setOpen] = useState(false);
  useEffect(() => setOpen(false), [pathname]);
  return (
    <div>
      <button onClick={() => setOpen((v) => !v)} className="text-cream-100" aria-label="Menu">☰</button>
      {open && (
        <div className="absolute inset-x-0 top-full max-h-[80vh] overflow-y-auto bg-forest-900 p-4 shadow-lift">
          {nav.flatMap((g) => g.items).map((item) => (
            <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2.5 text-sm text-cream-200/80 hover:bg-forest-800">
              {item.icon} {item.label}
            </Link>
          ))}
          <button onClick={onLogout} className="mt-2 w-full rounded-lg px-3 py-2.5 text-left text-sm text-clay-300">Sign out</button>
        </div>
      )}
    </div>
  );
}

function LoginScreen() {
  const setAuth = useAdminAuth((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = await adminLogin(email, password);
      if (data.user.role !== 'ADMIN' && data.user.role !== 'STAFF') {
        throw new Error('This account does not have admin access.');
      }
      setAuth({ accessToken: data.accessToken, refreshToken: data.refreshToken, user: data.user });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest-900 px-4">
      <div className="w-full max-w-sm rounded-organic bg-cream-50 p-10 shadow-lift">
        <div className="text-center">
          <p className="font-display text-xl tracking-[0.25em] text-forest-800">BEYOUTIFUL</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.4em] text-clay-600">Admin Panel</p>
        </div>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <Field label="Email">
            <Input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" />
          </Field>
          <Field label="Password">
            <Input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          </Field>
          {error && <p className="text-sm text-clay-700">{error}</p>}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>
      </div>
    </div>
  );
}
