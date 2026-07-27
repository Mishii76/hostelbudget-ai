// Minimal, dependency-free GitHub-flavored Markdown renderer.
// Supports: headings, bold, italic, inline code, blockquotes, ordered/unordered
// lists, tables, horizontal rules, and paragraphs. Returns HTML string.

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function inline(s: string): string {
  let out = escapeHtml(s);
  out = out.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-100 text-emerald-700 text-[0.85em] font-mono">$1</code>');
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  out = out.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>');
  return out;
}

export function renderMarkdown(md: string): string {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const html: string[] = [];
  let i = 0;

  const flushList = (type: 'ul' | 'ol', items: string[]) => {
    if (!items.length) return;
    const tag = type;
    html.push(`<${tag} class="${type === 'ul' ? 'list-disc' : 'list-decimal'} ml-5 space-y-1 text-slate-700">`);
    items.forEach((it) => html.push(`<li>${inline(it)}</li>`));
    html.push(`</${tag}>`);
  };

  while (i < lines.length) {
    const line = lines[i];

    // Table block
    if (line.includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1])) {
      const header = line.split('|').map((c) => c.trim()).filter(Boolean);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && lines[i].includes('|') && lines[i].trim() !== '') {
        rows.push(lines[i].split('|').map((c) => c.trim()).filter(Boolean));
        i++;
      }
      html.push('<div class="overflow-x-auto my-3">');
      html.push('<table class="w-full text-sm border-collapse">');
      html.push('<thead><tr class="bg-slate-50 border-b border-slate-200">');
      header.forEach((h) => html.push(`<th class="text-left px-3 py-2 font-semibold text-slate-700">${inline(h)}</th>`));
      html.push('</tr></thead><tbody>');
      rows.forEach((r) => {
        html.push('<tr class="border-b border-slate-100">');
        r.forEach((c) => html.push(`<td class="px-3 py-2 text-slate-600">${inline(c)}</td>`));
        html.push('</tr>');
      });
      html.push('</tbody></table></div>');
      continue;
    }

    // Horizontal rule
    if (/^\s*---+\s*$/.test(line)) {
      html.push('<hr class="my-4 border-slate-200" />');
      i++;
      continue;
    }

    // Headings
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const sizes = ['text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm', 'text-xs'];
      html.push(`<h${level} class="${sizes[level - 1]} font-bold text-slate-900 mt-4 mb-2">${inline(h[2])}</h${level}>`);
      i++;
      continue;
    }

    // Blockquote
    if (line.trim().startsWith('>')) {
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quote.push(lines[i].replace(/^\s*>\s?/, ''));
        i++;
      }
      html.push(`<blockquote class="border-l-4 border-emerald-400 bg-emerald-50/50 pl-4 py-2 my-3 text-slate-600 italic">${inline(quote.join(' '))}</blockquote>`);
      continue;
    }

    // Ordered list
    if (/^\s*\d+\.\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*\d+\.\s+/, ''));
        i++;
      }
      flushList('ol', items);
      continue;
    }

    // Unordered list
    if (/^\s*[-*]\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*[-*]\s+/, ''));
        i++;
      }
      flushList('ul', items);
      continue;
    }

    // Blank line
    if (line.trim() === '') {
      i++;
      continue;
    }

    // Paragraph (gather consecutive non-empty, non-special lines)
    const para: string[] = [];
    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      !/^(#{1,6})\s+/.test(lines[i]) &&
      !/^\s*[-*]\s+/.test(lines[i]) &&
      !/^\s*\d+\.\s+/.test(lines[i]) &&
      !lines[i].trim().startsWith('>') &&
      !/^\s*---+\s*$/.test(lines[i]) &&
      !(lines[i].includes('|') && i + 1 < lines.length && /^\s*\|?[\s:|-]+\|?\s*$/.test(lines[i + 1]))
    ) {
      para.push(lines[i]);
      i++;
    }
    if (para.length) {
      html.push(`<p class="text-slate-700 leading-relaxed my-2">${inline(para.join(' '))}</p>`);
    }
  }

  return html.join('\n');
}
