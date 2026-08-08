import { buildMetadata } from '@/lib/seo';
import { CartClient } from '@/components/cart/CartClient';

export const metadata = buildMetadata({
  title: 'Shopping Cart',
  description: 'Review your BeYoutiful Organics cart before checkout.',
  path: '/cart',
  noIndex: true,
});

export default function CartPage() {
  return (
    <div className="container-luxe py-16 lg:py-24">
      <CartClient />
    </div>
  );
}
