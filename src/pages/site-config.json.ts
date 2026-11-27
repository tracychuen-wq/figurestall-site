// 提供給後台小幫手與批次工具使用的公開設定（分類、地區、品牌名稱、欄位名稱）
import type { APIRoute } from 'astro';
import siteJson from '../data/site.json';
import pages from '../data/pages.json';
import { getCollection } from 'astro:content';
const site: any = siteJson;
export const GET: APIRoute = async () => {
  const services = (await getCollection('services')).sort((a, b) => a.data.order - b.data.order).map((s) => ({ id: s.id, name: s.data.shortTitle }));
  return new Response(JSON.stringify({
    brand: site.brandShort || site.name,
    siteName: site.name,
    ogImage: site.ogImage,
    // GitHub repo（owner/repo）：在 Cloudflare 環境變數 GITHUB_REPO 設定；沒設定時沿用 admin/config.yml
    repo: process.env.GITHUB_REPO || '',
    areas: site.areas,
    categories: site.categories || [],
    services,
    labels: pages.labels,
  }), { headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' } });
};
