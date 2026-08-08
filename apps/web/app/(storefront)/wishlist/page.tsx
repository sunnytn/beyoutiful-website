import { buildMetadata } from '@/lib/seo';
import { WishlistClient } from '@/components/shop/WishlistClient';

export const metadata = buildMetadata({
  title: 'Your Wishlist',
  description: 'Products you have saved for later at BeYoutiful Organics.',
  path: '/wishlist',
  noIndex: true,
});

export default function WishlistPage() {
  return (
    <div className="container-luxe py-16 lg:py-24">
      <WishlistClient />
    </div>
  );
}
