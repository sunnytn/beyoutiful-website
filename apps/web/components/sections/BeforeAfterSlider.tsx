'use client';

import Image from 'next/image';
import { useRef, useState } from 'react';

/** Accessible draggable before/after comparison slider. */
export function BeforeAfterSlider({ beforeUrl, afterUrl, title }: { beforeUrl: string; afterUrl: string; title: string }) {
  const [pos, setPos] = useState(50);
  const ref = useRef<HTMLDivElement>(null);

  const updateFromClientX = (clientX: number) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div
      ref={ref}
      className="relative aspect-[4/3] cursor-ew-resize touch-none select-none overflow-hidden"
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
        updateFromClientX(e.clientX);
      }}
      onPointerMove={(e) => e.buttons === 1 && updateFromClientX(e.clientX)}
    >
      <Image src={afterUrl} alt={`${title} — after`} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
        <Image src={beforeUrl} alt={`${title} — before`} fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
      </div>

      {/* handle */}
      <div className="absolute inset-y-0" style={{ left: `${pos}%` }} aria-hidden>
        <div className="absolute inset-y-0 -ml-px w-0.5 bg-white shadow" />
        <div className="absolute top-1/2 -ml-5 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-lift">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3d5a3d" strokeWidth="2.4">
            <path d="M8 7l-5 5 5 5M16 7l5 5-5 5" />
          </svg>
        </div>
      </div>

      <span className="absolute left-3 top-3 rounded-full bg-ink/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-luxe text-white">Before</span>
      <span className="absolute right-3 top-3 rounded-full bg-forest-700/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-luxe text-white">After</span>

      {/* keyboard access */}
      <input
        type="range"
        min={0}
        max={100}
        value={pos}
        onChange={(e) => setPos(Number(e.target.value))}
        aria-label={`Compare before and after: ${title}`}
        className="absolute bottom-3 left-1/2 w-1/2 -translate-x-1/2 opacity-0 focus:opacity-100"
      />
    </div>
  );
}
