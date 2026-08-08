export function Rating({ value, count, size = 14 }: { value: number; count?: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Rated ${value.toFixed(1)} out of 5`}>
      <span className="inline-flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 24 24"
            className={i <= Math.round(value) ? 'fill-clay-500' : 'fill-cream-400'}
            aria-hidden
          >
            <path d="M12 2l2.9 6.26 6.6.7-4.95 4.55L18 20l-6-3.5L6 20l1.45-6.49L2.5 8.96l6.6-.7z" />
          </svg>
        ))}
      </span>
      {count !== undefined && <span className="text-xs text-ink-faint">({count})</span>}
    </span>
  );
}
