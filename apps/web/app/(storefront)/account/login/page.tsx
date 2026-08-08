'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { useCustomerAuth } from '@/lib/stores';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useCustomerAuth((s) => s.setAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await api<{
        accessToken: string;
        refreshToken: string;
        user: { id: string; email: string; fullName: string; role: string; phone?: string | null };
      }>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      setAuth(res);
      router.push('/account');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-luxe flex min-h-[70vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-organic bg-white p-8 shadow-soft">
        <div className="text-center">
          <h1 className="font-display text-3xl text-forest-800">Welcome Back</h1>
          <p className="mt-2 text-sm text-ink-soft">Sign in to view your orders and manage your account.</p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-luxe text-ink-soft">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-cream-300 bg-cream-100/50 px-4 py-2.5 text-sm text-ink focus:border-forest-700 focus:outline-none"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-luxe text-ink-soft">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-cream-300 bg-cream-100/50 px-4 py-2.5 text-sm text-ink focus:border-forest-700 focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-ink-soft">
          Don't have an account?{' '}
          <Link href="/account/register" className="font-semibold text-forest-700 hover:underline">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
}
