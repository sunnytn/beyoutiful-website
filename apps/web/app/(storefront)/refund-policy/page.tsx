import { buildMetadata } from '@/lib/seo';
import { PolicyPage } from '@/components/layout/PolicyPage';

export const metadata = buildMetadata({
  title: 'Refund & Return Policy',
  description: 'Our fair, simple return and refund policy for BeYoutiful Organics orders.',
  path: '/refund-policy',
});

const content = `
## Our promise

We stand behind every jar, bottle and bar we make. If something isn't right, we'll fix it — quickly and without fuss.

## Damaged, defective or incorrect items

If your order arrives **damaged, leaking, expired or incorrect**:

1. Take a photo of the item and packaging.
2. Send it to us on WhatsApp (**0300-0527443**) within **48 hours** of delivery.
3. Choose a **free replacement** or a **full refund** — your call.

We'll arrange pickup where needed; you won't pay return shipping for our mistakes.

## Changed your mind?

Because our products are personal-care items made in small batches, we can only accept change-of-mind returns if the product is **unopened, unused and in its original sealed packaging**, requested within **7 days** of delivery. Return shipping for change-of-mind returns is paid by the customer. Once we receive and inspect the item, we'll refund the product price.

## What can't be returned

For hygiene and safety reasons, we can't accept returns of **opened or used** skincare, haircare or food items — unless they arrived damaged or defective.

## Refund method

Refunds are issued within **5–7 working days** of approval via bank transfer, JazzCash or EasyPaisa — whichever suits you.

## Order cancellation

You can cancel any order **free of charge before it is dispatched** — just message us on WhatsApp. Once dispatched, the delivery-refusal or return process above applies.

## Questions

We're happy to help: **0300-0527443** · beyoutiful.organics@gmail.com
`;

export default function RefundPolicyPage() {
  return <PolicyPage eyebrow="Fair and simple" title="Refund & Return Policy" updated="July 2026" content={content} />;
}
