import Link from 'next/link';
import { ButtonHTMLAttributes, ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'clay';
type Size = 'sm' | 'md' | 'lg';

const variants: Record<Variant, string> = {
  primary:
    'bg-forest-700 text-cream-100 hover:bg-forest-800 active:scale-[0.98] shadow-soft hover:shadow-lift',
  secondary:
    'bg-white/85 backdrop-blur-md border border-cream-300 text-forest-800 hover:bg-white active:scale-[0.98] shadow-soft',
  outline:
    'border border-forest-700/35 text-forest-800 hover:border-forest-700 hover:bg-forest-700/5 active:scale-[0.98]',
  ghost: 'text-forest-800 hover:bg-forest-700/5 active:scale-[0.98]',
  clay: 'bg-clay-500 text-white hover:bg-clay-600 active:scale-[0.98] shadow-soft hover:shadow-lift',
};

const sizes: Record<Size, string> = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-sm',
};

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-sans font-semibold uppercase tracking-luxe transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest-700 focus-visible:ring-offset-2';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  href?: string;
  children: ReactNode;
}

export function Button({ variant = 'primary', size = 'md', href, className = '', children, ...rest }: ButtonProps) {
  const cls = `${base} ${variants[variant]} ${sizes[size]} ${className}`;
  if (href) {
    return (
      <Link href={href} className={cls}>
        {children}
      </Link>
    );
  }
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
