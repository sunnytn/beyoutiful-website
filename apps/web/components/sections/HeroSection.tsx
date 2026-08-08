'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/Button';

export function HeroSection({ title, subtitle }: { title: string; subtitle: string }) {
  const reduce = useReducedMotion();
  const words = title.split(' ');

  return (
    <section className="relative -mt-[104px] flex min-h-[92vh] items-center overflow-hidden bg-cream-100 pt-[104px]">
      {/* organic background shapes */}
      <motion.div
        aria-hidden
        className="absolute -right-40 -top-40 h-[36rem] w-[36rem] rounded-full bg-forest-100"
        animate={reduce ? undefined : { scale: [1, 1.06, 1], rotate: [0, 8, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-48 -left-32 h-[30rem] w-[30rem] rounded-full bg-clay-300/25"
        animate={reduce ? undefined : { scale: [1, 1.1, 1] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="absolute right-[16%] top-[22%] hidden text-6xl lg:block"
        animate={reduce ? undefined : { y: [0, -14, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
        🌿
      </motion.div>
      <motion.div
        aria-hidden
        className="absolute bottom-[18%] right-[30%] hidden text-4xl lg:block"
        animate={reduce ? undefined : { y: [0, 10, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      >
        🍃
      </motion.div>

      <div className="container-luxe relative">
        <div className="max-w-3xl">
          <motion.p
            className="eyebrow"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Organic skincare & haircare · Made in Pakistan
          </motion.p>

          <h1 className="heading-xl mt-6 text-forest-900">
            {words.map((word, i) => (
              <motion.span
                key={i}
                className="inline-block"
                initial={reduce ? false : { opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 + i * 0.08, ease: [0.21, 0.6, 0.35, 1] }}
              >
                {word}
                {i < words.length - 1 && <span>&nbsp;</span>}
              </motion.span>
            ))}
          </h1>

          <motion.p
            className="prose-organic mt-6 max-w-xl text-lg"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            {subtitle}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-wrap gap-4"
            initial={reduce ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.65 }}
          >
            <Button href="/shop" size="lg">
              Shop Now
            </Button>
            <Button href="/advisor" variant="outline" size="lg">
              Find My Perfect Products
            </Button>
          </motion.div>

          <motion.dl
            className="mt-14 flex flex-wrap gap-4"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.85 }}
          >
            {[
              ['100%', 'Pure Organic Ingredients'],
              ['22+', 'Handcrafted Botanical Products'],
              ['1000s', 'Happy Pakistani Customers'],
            ].map(([stat, label]) => (
              <div key={label} className="glass-card flex-1 min-w-[160px] rounded-2xl p-4 text-center">
                <dt className="sr-only">{label}</dt>
                <dd className="font-display text-3xl font-semibold text-forest-800">{stat}</dd>
                <dd className="mt-1 text-[11px] font-sans font-semibold uppercase tracking-luxe text-clay-600">{label}</dd>
              </div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
