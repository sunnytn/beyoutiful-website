import { ReactNode } from 'react';

const tones = {
  forest: 'bg-forest-700 text-cream-100',
  clay: 'bg-clay-500 text-white',
  cream: 'bg-cream-200 text-forest-800',
  outline: 'border border-forest-700/30 text-forest-800',
} as const;

export function Badge({ tone = 'forest', children, className = '' }: { tone?: keyof typeof tones; children: ReactNode; className?: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-sans font-semibold uppercase tracking-luxe ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
