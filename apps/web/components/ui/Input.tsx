import { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes, ReactNode } from 'react';

const fieldBase =
  'w-full rounded-xl border border-cream-400 bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint transition-colors focus:border-forest-600 focus:outline-none focus:ring-2 focus:ring-forest-600/15';

export function Field({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-sans font-semibold uppercase tracking-luxe text-ink-soft">{label}</span>
      {children}
      {hint && !error && <span className="block text-xs text-ink-faint">{hint}</span>}
      {error && <span className="block text-xs text-clay-700">{error}</span>}
    </label>
  );
}

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={`${fieldBase} ${className}`} {...rest} />;
}

export function Textarea({ className = '', ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={`${fieldBase} min-h-28 ${className}`} {...rest} />;
}

export function Select({ className = '', children, ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={`${fieldBase} ${className}`} {...rest}>
      {children}
    </select>
  );
}
