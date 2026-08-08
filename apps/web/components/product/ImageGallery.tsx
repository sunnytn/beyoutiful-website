'use client';

import Image from 'next/image';
import { useState, MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ProductImage } from '@/lib/api';

/** Gallery with hover-zoom lens, thumbnails and optional video slide. */
export function ImageGallery({ images, videoUrl, name }: { images: ProductImage[]; videoUrl: string | null; name: string }) {
  const slides: Array<{ type: 'image' | 'video'; url: string; alt?: string | null }> = [
    ...images.map((im) => ({ type: 'image' as const, url: im.url, alt: im.alt })),
    ...(videoUrl ? [{ type: 'video' as const, url: videoUrl }] : []),
  ];
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState('50% 50%');
  const current = slides[index];

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  if (!current) {
    return (
      <div className="flex aspect-[4/5] items-center justify-center rounded-organic bg-cream-200 text-6xl">🌿</div>
    );
  }

  return (
    <div>
      <div
        className="relative aspect-[4/5] cursor-zoom-in overflow-hidden rounded-organic bg-cream-200 shadow-soft"
        onMouseEnter={() => current.type === 'image' && setZoom(true)}
        onMouseLeave={() => setZoom(false)}
        onMouseMove={onMove}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {current.type === 'image' ? (
              <Image
                src={current.url}
                alt={current.alt || `${name} - Pure Organic Skincare in Pakistan`}
                fill
                priority={index === 0}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-200"
                style={zoom ? { transform: 'scale(2)', transformOrigin: origin } : undefined}
              />
            ) : (
              <video src={current.url} controls playsInline className="h-full w-full object-cover" aria-label={`${name} video`} />
            )}
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <GalleryArrow dir="prev" onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)} />
            <GalleryArrow dir="next" onClick={() => setIndex((i) => (i + 1) % slides.length)} />
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1" role="tablist" aria-label="Product images">
          {slides.map((slide, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === index}
              aria-label={slide.type === 'video' ? 'Product video' : `Image ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`relative h-20 w-16 shrink-0 overflow-hidden rounded-lg transition-all ${
                i === index ? 'ring-2 ring-forest-700 ring-offset-2 ring-offset-cream-100' : 'opacity-70 hover:opacity-100'
              }`}
            >
              {slide.type === 'image' ? (
                <Image src={slide.url} alt={slide.alt || `${name} view ${i + 1}`} fill sizes="64px" className="object-cover" />
              ) : (
                <span className="flex h-full w-full items-center justify-center bg-forest-800 text-cream-100">▶</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryArrow({ dir, onClick }: { dir: 'prev' | 'next'; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={dir === 'prev' ? 'Previous image' : 'Next image'}
      className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-white/85 p-2.5 shadow-soft backdrop-blur transition-all hover:bg-white ${
        dir === 'prev' ? 'left-3' : 'right-3'
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        {dir === 'prev' ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 6l6 6-6 6" />}
      </svg>
    </button>
  );
}
