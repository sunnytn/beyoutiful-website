import { Reveal } from '@/components/ui/Reveal';
import { renderMarkdown } from '@/lib/format';

export function PolicyPage({ eyebrow, title, updated, content }: { eyebrow: string; title: string; updated: string; content: string }) {
  return (
    <div className="container-luxe py-16 lg:py-24">
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="heading-lg mt-3">{title}</h1>
        <p className="mt-3 text-xs text-ink-faint">Last updated: {updated}</p>
      </Reveal>
      <div
        className="md-content mx-auto mt-12 max-w-2xl"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
      />
    </div>
  );
}
