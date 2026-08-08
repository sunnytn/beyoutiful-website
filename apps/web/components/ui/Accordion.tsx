'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ReactNode, useState } from 'react';

export function Accordion({ items }: { items: Array<{ id: string; title: string; content: ReactNode }> }) {
  const [openId, setOpenId] = useState<string | null>(null);
  return (
    <div className="divide-y divide-cream-300 rounded-organic border border-cream-300 bg-white">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id}>
            <button
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              onClick={() => setOpenId(open ? null : item.id)}
              aria-expanded={open}
            >
              <span className="font-display text-lg text-ink">{item.title}</span>
              <motion.span
                animate={{ rotate: open ? 45 : 0 }}
                className="text-2xl leading-none text-clay-500"
                aria-hidden
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden"
                >
                  <div className="prose-organic px-6 pb-6 text-sm">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
