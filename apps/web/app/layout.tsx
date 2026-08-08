import type { Metadata, Viewport } from 'next';
import { Playfair_Display, Jost } from 'next/font/google';
import './globals.css';
import { organizationJsonLd, localBusinessJsonLd, JsonLd } from '@/lib/seo';

const display = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});
const sans = Jost({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'BeYoutiful Organics — Pure Organic Skincare & Haircare in Pakistan | Cash on Delivery',
    template: '%s | BeYoutiful Organics Pakistan',
  },
  description:
    'Small-batch 100% organic skincare, haircare and wellness products made in Pakistan. Pure rosemary oil, cold-pressed oils, handmade soaps, and rose water. Cash on delivery nationwide.',
  keywords: [
    'organic skincare Pakistan',
    'organic haircare Pakistan',
    'pure rosemary oil Pakistan',
    'handmade organic soap',
    'rose water spray',
    'BeYoutiful Organics',
    'Cash on delivery skincare',
  ],
  openGraph: { siteName: 'BeYoutiful Organics', locale: 'en_PK', type: 'website' },
};

export const viewport: Viewport = {
  themeColor: '#faf7f2',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        <JsonLd data={[organizationJsonLd(), localBusinessJsonLd()]} />
        {children}
      </body>
    </html>
  );
}

