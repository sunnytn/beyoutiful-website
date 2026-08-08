import { Suspense } from 'react';
import { buildMetadata } from '@/lib/seo';
import { SearchClient } from '@/components/search/SearchClient';

export const metadata = buildMetadata({
  title: 'Search',
  description: 'Search products, ingredients, concerns, articles and FAQs across BeYoutiful Organics.',
  path: '/search',
});

export default function SearchPage() {
  return (
    <div className="container-luxe py-16 lg:py-24">
      <Suspense>
        <SearchClient />
      </Suspense>
    </div>
  );
}
