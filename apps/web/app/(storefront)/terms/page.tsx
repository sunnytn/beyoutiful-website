import { buildMetadata } from '@/lib/seo';
import { PolicyPage } from '@/components/layout/PolicyPage';

export const metadata = buildMetadata({
  title: 'Terms of Service',
  description: 'The terms that govern your use of the BeYoutiful Organics website and services.',
  path: '/terms',
});

const content = `
## Agreement

By using this website and placing orders, you agree to these terms. They exist to keep things fair for everyone — please read them.

## About us

Beyoutiful Organics is a small-batch organic products business operating from Karachi, Pakistan. Contact: beyoutiful.organics@gmail.com · WhatsApp 0300-0527443.

## Orders

- All orders are subject to availability and confirmation. We confirm every order via WhatsApp and email.
- Prices are displayed in Pakistani Rupees (PKR) and may change without notice; the price at the time of your order is the price you pay.
- We reserve the right to refuse or cancel orders in cases of suspected fraud, pricing errors, or stock issues — with a full explanation and immediate refund of anything paid.

## Product information

We describe our products as accurately and honestly as we can. Natural products vary slightly from batch to batch in colour, texture and scent — that's the nature of nature. Product images are illustrative.

**Important:** our products are cosmetic and wellness items, not medicines. They are not intended to diagnose, treat or cure any condition. Always patch test new products and consult a doctor for medical concerns, during pregnancy, or for children.

## Your account

If you create an account, keep your password secure. You're responsible for activity under your account. We may suspend accounts used fraudulently or abusively.

## Reviews and content you submit

By submitting reviews or messages, you grant us permission to display them on our website and marketing (first name and city only). We may decline to publish content that is offensive, false or spammy. Don't submit content you don't have the right to share.

## Intellectual property

All content on this website — text, photography, branding, product formulations — belongs to Beyoutiful Organics. Please don't copy or reuse it commercially without written permission.

## Limitation of liability

To the maximum extent permitted by law, our liability for any claim relating to an order is limited to the amount you paid for that order. Nothing in these terms limits liability that cannot be limited under Pakistani law.

## Governing law

These terms are governed by the laws of Pakistan. Disputes will be handled in the courts of Karachi.

## Changes

We may update these terms from time to time. Continued use of the website after changes means you accept the updated terms.
`;

export default function TermsPage() {
  return <PolicyPage eyebrow="The fine print, kept fair" title="Terms of Service" updated="July 2026" content={content} />;
}
