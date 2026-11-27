import site from '../data/site.json';
import { marked } from 'marked';

// 文案中的 {areas}、{phone}、{lineId}、{owner}、{address}、{brand} 會自動帶入公司資料
export function fill(s: string = ''): string {
  return String(s)
    .replaceAll('{areas}', site.areas.join('、'))
    .replaceAll('{phone}', site.phone)
    .replaceAll('{lineId}', site.lineId)
    .replaceAll('{owner}', site.owner)
    .replaceAll('{address}', site.address.full)
    .replaceAll('{brand}', (site as any).brandShort || site.name);
}
const escape = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]!));
// 單行文字：**粗體**、換行轉 <br>
export function rich(s: string = ''): string {
  return escape(fill(s)).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}
// 多段文字：用 Markdown 轉成 HTML
export function md(s: string = ''): string {
  return marked.parse(fill(s), { async: false }) as string;
}
