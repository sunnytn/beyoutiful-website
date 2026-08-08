export const formatPrice = (amount: number) => `Rs. ${amount.toLocaleString('en-PK')}`;

export const formatDate = (d: string | Date) =>
  new Date(d).toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' });

/** Tiny markdown renderer for trusted (admin-authored) content. */
export function renderMarkdown(md: string): string {
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const lines = esc(md).split('\n');
  const out: string[] = [];
  let inUl = false;
  let inOl = false;
  const closeLists = () => {
    if (inUl) { out.push('</ul>'); inUl = false; }
    if (inOl) { out.push('</ol>'); inOl = false; }
  };
  const inline = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^### /.test(line)) { closeLists(); out.push(`<h3>${inline(line.slice(4))}</h3>`); }
    else if (/^## /.test(line)) { closeLists(); out.push(`<h2>${inline(line.slice(3))}</h2>`); }
    else if (/^# /.test(line)) { closeLists(); out.push(`<h2>${inline(line.slice(2))}</h2>`); }
    else if (/^> /.test(line)) { closeLists(); out.push(`<blockquote>${inline(line.slice(2))}</blockquote>`); }
    else if (/^[-*] /.test(line)) { if (!inUl) { closeLists(); out.push('<ul>'); inUl = true; } out.push(`<li>${inline(line.slice(2))}</li>`); }
    else if (/^\d+\. /.test(line)) { if (!inOl) { closeLists(); out.push('<ol>'); inOl = true; } out.push(`<li>${inline(line.replace(/^\d+\. /, ''))}</li>`); }
    else if (line === '') { closeLists(); }
    else { closeLists(); out.push(`<p>${inline(line)}</p>`); }
  }
  closeLists();
  return out.join('\n');
}
