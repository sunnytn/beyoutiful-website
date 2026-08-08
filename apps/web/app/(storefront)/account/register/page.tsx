'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, FormEvent } from 'react';
import { api, ApiError } from '@/lib/api';
import { useCustomerAuth } from '@/lib/stores';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useCustomerAuth((s) => s.setAuth);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
      }>('/auth/register', {
        method: 'POST',
        body: { fullName, email, phone, password },
      });
      setAuth(res);
      router.push('/account');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-luxe flex min-h-[75vh] items-center justify-center py-12">
      <div className="w-full max-w-md rounded-organic bg-white p-8 shadow-soft">
        <div className="text-center">
          <h1 className="font-display text-3xl text-forest-800">Create Account</h1>
          <p className="mt-2 text-sm text-ink-soft">Join BeYoutiful Organics to track all your orders seamlessly.</p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-3 text-xs font-medium text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-luxe text-ink-soft">
              Full Name
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-cream-300 bg-cream-100/50 px-4 py-2.5 text-sm text-ink focus:border-forest-700 focus:outline-none"
              placeholder="e.g. Ayesha Khan"
            />
          </div>

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
              Phone Number (Optional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-cream-300 bg-cream-100/50 px-4 py-2.5 text-sm text-ink focus:border-forest-700 focus:outline-none"
              placeholder="0300 1234567"
            />
          </div>

          <div>
            <label className="block text-xs font-sans font-semibold uppercase tracking-luxe text-ink-soft">
              Password
            </label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-cream-300 bg-cream-100/50 px-4 py-2.5 text-sm text-ink focus:border-forest-700 focus:outline-none"
              placeholder="Min. 6 characters"
            />
          </div>

          <Button type="submit" size="lg" className="w-full mt-2" disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center text-xs text-ink-soft">
          Already have an account?{' '}
          <Link href="/account/login" className="font-semibold text-forest-700 hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
