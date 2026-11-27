// 原站圖片放在 yep 圖床：網址最後的字母代表尺寸
// '' 原圖、c=800px、z=640px、d=500px。自行上傳的圖片（/uploads/...）則原樣使用。
export type Size = 'full' | 'lg' | 'md' | 'sm';
const map: Record<Size, string> = { full: '', lg: 'c', md: 'z', sm: 'd' };
export function img(src: string | undefined, size: Size = 'full'): string {
  if (!src) return '';
  const m = src.match(/^(https:\/\/images\.yep\.com\.tw\/thumbnai\/[a-z0-9]+\/)/i);
  if (m) return m[1] + map[size];
  // Unsplash 免費圖庫：依尺寸請求壓縮版本
  if (/^https:\/\/images\.unsplash\.com\/photo-[^?]+$/.test(src)) {
    const w = { full: 1920, lg: 1200, md: 800, sm: 400 }[size];
    return `${src}?w=${w}&q=80&auto=format&fit=crop`;
  }
  return src;
}
export function abs(src: string, site: URL | undefined): string {
  if (!src) return '';
  if (/^https?:/.test(src)) return src;
  return new URL(src, site ?? 'https://example.com').toString();
}
