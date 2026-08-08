import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex flex-1 items-center justify-center pt-[104px]">
        <div className="container-luxe py-24 text-center">
          <p className="font-display text-8xl text-forest-200">404</p>
          <h1 className="heading-lg mt-4">This page has wilted away</h1>
          <p className="prose-organic mx-auto mt-4 max-w-md">
            The page you're looking for doesn't exist or has been moved. Let's get you back to something beautiful.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="rounded-full bg-forest-700 px-8 py-4 text-sm font-semibold uppercase tracking-luxe text-cream-100 transition-colors hover:bg-forest-800"
            >
              Back Home
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-forest-700/30 px-8 py-4 text-sm font-semibold uppercase tracking-luxe text-forest-800 transition-colors hover:border-forest-700"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
