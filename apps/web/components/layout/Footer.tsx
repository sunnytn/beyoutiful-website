import Link from 'next/link';
import { NewsletterForm } from '@/components/marketing/NewsletterForm';

const columns = [
  {
    title: 'Shop',
    links: [
      { label: 'All Products', href: '/shop' },
      { label: 'Hair Care', href: '/hair-care' },
      { label: 'Skin Care', href: '/skin-care' },
      { label: 'Collections', href: '/collections' },
      { label: 'Best Sellers', href: '/collections/best-sellers' },
      { label: 'New Arrivals', href: '/collections/new-arrivals' },
    ],
  },
  {
    title: 'Discover',
    links: [
      { label: 'Our Story', href: '/about/story' },
      { label: 'Our Philosophy', href: '/about/philosophy' },
      { label: 'Ingredient Library', href: '/ingredients' },
      { label: 'AI Advisor', href: '/advisor' },
      { label: 'Before & After', href: '/before-after' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'Help',
    links: [
      { label: 'Contact Us', href: '/contact' },
      { label: 'FAQs', href: '/faqs' },
      { label: 'Shipping Policy', href: '/shipping-policy' },
      { label: 'Refund Policy', href: '/refund-policy' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-forest-900 text-cream-200">
      {/* newsletter band */}
      <div className="border-b border-forest-800">
        <div className="container-luxe flex flex-col items-center gap-6 py-14 text-center lg:flex-row lg:justify-between lg:text-left">
          <div>
            <p className="eyebrow !text-clay-300">Newsletter</p>
            <h2 className="heading-md mt-2 text-cream-100">Join the BeYoutiful family</h2>
            <p className="mt-1 text-sm text-cream-200/70">Rituals, launches and members-only offers. No spam, ever.</p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="container-luxe grid gap-12 py-16 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <p className="font-display text-2xl tracking-[0.25em] text-cream-100">BEYOUTIFUL</p>
          <p className="mt-1 text-[10px] font-sans font-semibold uppercase tracking-[0.5em] text-clay-300">Organics</p>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-cream-200/70">
            Small-batch organic skincare, haircare and wellness — made in Pakistan with ingredients straight from
            Mother Nature herself.
          </p>
          <div className="mt-6 space-y-1.5 text-sm text-cream-200/80">
            <p>
              <a href="https://wa.me/923000527443" className="hover:text-cream-100" rel="noopener noreferrer" target="_blank">
                WhatsApp: 0300-0527443
              </a>
            </p>
            <p>
              <a href="mailto:beyoutiful.organics@gmail.com" className="hover:text-cream-100">
                beyoutiful.organics@gmail.com
              </a>
            </p>
            <p>Karachi, Pakistan</p>
          </div>
          <div className="mt-6 flex gap-3">
            <Social href="https://instagram.com/beyoutifulorganics" label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </Social>
            <Social href="https://m.facebook.com/beyoutifulorganics1" label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 9h3V6h-3c-1.7 0-3 1.3-3 3v2H8v3h3v7h3v-7h3l1-3h-4V9c0-.6.4-1 1-1z" />
              </svg>
            </Social>
            <Social href="https://wa.me/c/923000527443" label="WhatsApp catalog">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.2 14.2c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.4l.9 2.2c.1.2.1.4 0 .6l-.4.6-.5.5c-.2.2-.3.4-.1.7.2.3.9 1.4 1.9 2.3 1.3 1.1 2.3 1.5 2.7 1.6.3.2.5.1.7-.1l1.1-1.3c.2-.3.4-.2.7-.1l2.1 1c.3.2.5.3.6.4 0 .1 0 .8-.6 1.4z" />
              </svg>
            </Social>
          </div>
        </div>

        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <h3 className="text-xs font-sans font-semibold uppercase tracking-luxe text-clay-300">{col.title}</h3>
            <ul className="mt-5 space-y-3">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-cream-200/70 transition-colors hover:text-cream-100">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      {/* trust badges */}
      <div className="border-t border-forest-800/80 bg-forest-950/40 py-8">
        <div className="container-luxe grid grid-cols-1 gap-6 text-center sm:grid-cols-3">
          <div className="flex flex-col items-center">
            <span className="text-2xl">🌿</span>
            <span className="mt-2 font-display text-sm text-cream-100">100% Pure Organic</span>
            <span className="mt-0.5 text-xs text-cream-200/60">No harsh chemicals or parabens</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">🚚</span>
            <span className="mt-2 font-display text-sm text-cream-100">Cash on Delivery</span>
            <span className="mt-0.5 text-xs text-cream-200/60">Pay when your order arrives</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-2xl">✨</span>
            <span className="mt-2 font-display text-sm text-cream-100">Handcrafted in Pakistan</span>
            <span className="mt-0.5 text-xs text-cream-200/60">Small-batch quality assurance</span>
          </div>
        </div>
      </div>

      <div className="border-t border-forest-800">
        <div className="container-luxe flex flex-col items-center justify-between gap-2 py-6 text-xs text-cream-200/50 sm:flex-row">
          <p>© {new Date().getFullYear()} BeYoutiful Organics. All rights reserved.</p>
          <p>Because no matter where you are in your beauty journey — you look BeYoutiful. 🌿</p>
        </div>
      </div>
    </footer>
  );
}

function Social({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="rounded-full border border-forest-700 p-2.5 text-cream-200/80 transition-all hover:border-clay-400 hover:text-clay-300"
    >
      {children}
    </a>
  );
}
