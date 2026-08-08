'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Testimonial } from '@/lib/api';
import { Rating } from '@/components/ui/Rating';

export function TestimonialCarousel({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = useState(0);
  const t = testimonials[index];
  if (!t) return null;

  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="relative min-h-56">
        <AnimatePresence mode="wait">
          <motion.figure
            key={t.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
          >
            <div className="flex justify-center">
              <Rating value={t.rating} size={18} />
            </div>
            <blockquote className="mt-6 font-display text-2xl leading-relaxed text-ink sm:text-3xl">
              “{t.text}”
            </blockquote>
            <figcaption className="mt-6 text-sm text-ink-soft">
              <span className="font-semibold text-forest-800">{t.name}</span>
              {t.location && <span> · {t.location}</span>}
            </figcaption>
          </motion.figure>
        </AnimatePresence>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2" role="tablist" aria-label="Testimonials">
        {testimonials.map((item, i) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={i === index}
            aria-label={`Testimonial ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === index ? 'w-8 bg-forest-700' : 'w-2 bg-cream-400 hover:bg-cream-500'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
