// 把內容中引用的 yep 圖床照片下載到 public/uploads/legacy/，並改寫成本站路徑。
// 舊站（yep/iyp 平台）若停止續約，圖床可能失效，建議上線前在自己電腦執行一次：
//   npm run localize-images
// 完成後 commit 推上去即可。
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'public/uploads/legacy');
const FILES = [];
async function walk(dir) {
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) await walk(p);
    else if (/\.(md|json|astro)$/.test(e.name)) FILES.push(p);
  }
}
await walk(path.join(ROOT, 'src'));
await fs.mkdir(OUT, { recursive: true });

const RE = /https:\/\/images\.yep\.com\.tw\/thumbnai\/([a-z0-9]+)\/[a-z]?/gi;
const ids = new Set();
for (const f of FILES) for (const m of (await fs.readFile(f, 'utf8')).matchAll(RE)) ids.add(m[1]);
console.log(`找到 ${ids.size} 張圖片，開始下載…`);

const ext = (type) => ({ 'image/png': '.png', 'image/webp': '.webp', 'image/svg+xml': '.svg', 'image/gif': '.gif' }[type] || '.jpg');
const map = {};
let n = 0;
for (const id of ids) {
  const existing = (await fs.readdir(OUT)).find((x) => x.startsWith(id + '.'));
  if (existing) { map[id] = '/uploads/legacy/' + existing; continue; }
  try {
    const res = await fetch(`https://images.yep.com.tw/thumbnai/${id}/`);
    if (!res.ok) throw new Error(res.status);
    const name = id + ext(res.headers.get('content-type'));
    await fs.writeFile(path.join(OUT, name), Buffer.from(await res.arrayBuffer()));
    map[id] = '/uploads/legacy/' + name;
    process.stdout.write(`\r已下載 ${++n} 張`);
  } catch (e) { console.warn(`\n✗ ${id} 下載失敗：${e.message}`); }
}
console.log('\n改寫內容中的圖片網址…');
for (const f of FILES) {
  const src = await fs.readFile(f, 'utf8');
  const out = src.replace(RE, (all, id) => map[id] || all);
  if (out !== src) await fs.writeFile(f, out);
}
console.log('完成！請檢查 git diff 後 commit。');
