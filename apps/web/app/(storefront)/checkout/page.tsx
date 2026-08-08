import { buildMetadata } from '@/lib/seo';
import { CheckoutClient } from '@/components/checkout/CheckoutClient';

export const metadata = buildMetadata({
  title: 'Checkout',
  description: 'Complete your BeYoutiful Organics order — cash on delivery, confirmed on WhatsApp.',
  path: '/checkout',
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <div className="container-luxe py-16 lg:py-24">
      <CheckoutClient />
    </div>
  );
}
