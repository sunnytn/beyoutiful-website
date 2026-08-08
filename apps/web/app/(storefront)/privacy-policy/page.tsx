import { buildMetadata } from '@/lib/seo';
import { PolicyPage } from '@/components/layout/PolicyPage';

export const metadata = buildMetadata({
  title: 'Privacy Policy',
  description: 'How BeYoutiful Organics collects, uses and protects your personal information.',
  path: '/privacy-policy',
});

const content = `
## Who we are

Beyoutiful Organics ("we", "us") operates this website from Karachi, Pakistan. This policy describes how we collect, use and protect your personal information when you use our website and services.

## Information we collect

**Information you give us.** When you place an order, contact us, subscribe to our newsletter or write a review, we collect details such as your name, email address, phone number, delivery address and the contents of your message.

**Information collected automatically.** Like most websites, we collect usage data — pages visited, time on page, device and browser type — to understand how the site is used and improve it.

**Cookies.** We use essential cookies to keep your cart and preferences working, and functional cookies to remember your choices. You can disable cookies in your browser, though parts of the site (like the cart) may stop working.

## How we use your information

- To process and deliver your orders, including sharing your delivery details with courier partners.
- To contact you about your order via WhatsApp, email or phone.
- To respond to your questions and requests.
- To send newsletters and offers **only if you subscribed** — you can unsubscribe at any time.
- To improve our website, products and services.

## What we never do

We never sell your personal information. We never share it with third parties except as needed to deliver your order (couriers), operate the website (hosting and infrastructure providers), or comply with the law.

## Data retention

We keep order records for as long as needed for business and legal purposes. You may ask us to delete your personal data at any time by emailing beyoutiful.organics@gmail.com — we will honour the request except where the law requires us to keep certain records.

## Your rights

You may request access to, correction of, or deletion of your personal data. Contact us at beyoutiful.organics@gmail.com and we will respond promptly.

## Children's privacy

Our services are not directed at children under 13, and we do not knowingly collect their personal information.

## Changes to this policy

We may update this policy from time to time. Changes take effect when posted on this page, and the "Last updated" date will reflect them.

## Contact

Questions about privacy? Email **beyoutiful.organics@gmail.com** or WhatsApp **0300-0527443**.
`;

export default function PrivacyPolicyPage() {
  return <PolicyPage eyebrow="Your data, respected" title="Privacy Policy" updated="July 2026" content={content} />;
}
