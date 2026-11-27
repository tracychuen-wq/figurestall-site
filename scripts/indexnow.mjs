// IndexNow：網站更新後通知 Bing、Yandex、Naver、Seznam 等搜尋引擎重新抓取。
// 由 .github/workflows/indexnow.yml 在每次推送後執行（等 Cloudflare 部署完成）。
// 用法：node scripts/indexnow.mjs <site> [changed files...]；沒給檔案＝送出 sitemap 全部網址。
import { readFileSync, existsSync } from 'node:fs';

const site = (process.argv[2] || '').replace(/\/$/, '');
const changed = process.argv.slice(3).filter(Boolean);
if (!site) { console.log('沒有網址，略過'); process.exit(0); }
if (!existsSync('public/indexnow-key.txt')) { console.log('沒有 public/indexnow-key.txt，略過'); process.exit(0); }
const key = readFileSync('public/indexnow-key.txt', 'utf8').trim();
const host = new URL(site).host;

// 1) 讀線上 sitemap，取得全部網址
const sm = await fetch(`${site}/sitemap-0.xml`, { headers: { 'cache-control': 'no-cache' } }).then((r) => r.text());
const all = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (!all.length) { console.log('sitemap 讀不到網址，略過'); process.exit(0); }

// 2) 依改動的檔案決定要通知哪些網址（只改單篇內容＝只送那幾頁＋列表頁＋首頁；改到共用設定＝全部）
let urls = all;
if (changed.length) {
  const picked = new Set([`${site}/`]);
  let everything = false;
  for (const f of changed) {
    const m = f.match(/^src\/content\/(cases|blog|services)\/(.+)\.md$/);
    if (m) {
      const md = existsSync(f) ? readFileSync(f, 'utf8') : '';
      const slug = (md.match(/^slug:\s*["']?([^"'\n]+)/m) || [])[1] || m[2];
      picked.add(`${site}/${m[1]}/`); picked.add(`${site}/${m[1]}/${slug.trim()}/`);
    } else if (/^(src\/|public\/(?!uploads\/|admin\/))/.test(f)) everything = true;
  }
  if (!everything) urls = [...picked].filter((u) => all.includes(u) || u === `${site}/`);
}
if (!urls.length) { console.log('沒有要通知的網址'); process.exit(0); }

// 3) 送出（api.indexnow.org 會轉發給所有參與的搜尋引擎）
const body = { host, key, keyLocation: `${site}/indexnow-key.txt`, urlList: urls.slice(0, 10000) };
const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST', headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body),
});
console.log(`IndexNow ${res.status}：送出 ${urls.length} 個網址`);
urls.forEach((u) => console.log('  ' + u));
if (res.status >= 400 && res.status !== 429) process.exit(1);
