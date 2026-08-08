import { buildMetadata } from '@/lib/seo';
import { PolicyPage } from '@/components/layout/PolicyPage';

export const metadata = buildMetadata({
  title: 'Shipping Policy',
  description: 'Delivery times, charges and coverage for BeYoutiful Organics orders across Pakistan.',
  path: '/shipping-policy',
});

const content = `
## Coverage

We deliver **nationwide across Pakistan** — from Karachi to Khyber. Orders are shipped from Karachi via trusted courier partners.

## Delivery charges

- Flat **Rs. 200** on all orders.
- **FREE delivery** on orders above **Rs. 3,000**.

## Timelines

- **Dispatch:** orders are packed and dispatched within 1–2 working days. You'll receive confirmation on WhatsApp once your order ships.
- **Major cities** (Karachi, Lahore, Islamabad, Rawalpindi, Faisalabad, Multan): 2–4 working days after dispatch.
- **Other cities and towns:** 4–7 working days after dispatch.

Working days exclude Sundays and public holidays. During sale periods or courier disruptions, delivery may take a little longer — we'll keep you posted on WhatsApp.

## Payment

We currently offer **Cash on Delivery (COD)**. You pay the courier when your order arrives. Please have the exact amount ready if possible.

## Order tracking

Once dispatched, we share your courier tracking details on WhatsApp. You can also reach us any time at **0300-0527443** for a status update.

## Damaged or incorrect deliveries

Please inspect your parcel on arrival. If anything arrives damaged, leaking or incorrect, send us a photo on WhatsApp within **48 hours** of delivery and we'll make it right — replacement or refund, your choice. See our Refund Policy for details.

## Address changes

Need to change your address after ordering? Message us on WhatsApp **before dispatch** and we'll update it, no problem.
`;

export default function ShippingPolicyPage() {
  return <PolicyPage eyebrow="From our door to yours" title="Shipping Policy" updated="July 2026" content={content} />;
}
