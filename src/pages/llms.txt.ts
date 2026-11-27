import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import siteJson from '../data/site.json';
import pages from '../data/pages.json';
const site: any = siteJson;

export const GET: APIRoute = async ({ site: base }) => {
  const u = (p: string) => new URL(p, base).toString();
  const services = (await getCollection('services', (s) => !s.data.draft)).sort((a, b) => a.data.order - b.data.order);
  const cases = (await getCollection('cases', (c) => !c.data.draft)).sort((a, b) => +b.data.date - +a.data.date);
  const posts = (await getCollection('blog', (p) => !p.data.draft)).sort((a, b) => +b.data.date - +a.data.date);
  const body = `# ${site.name}（${site.legalName}）

> ${site.description}

## 基本資料
- 品牌：${[site.brandShort, ...(site.brandAlt || [])].join(' / ')}
- 負責人：${site.owner}${site.ownerBackground ? `，${site.ownerBackground}` : ''}
- 電話：${site.phone}
- LINE：${site.lineId}（${site.lineUrl}）
- 地址：${site.address.full}
- 服務區域：${site.areas.join('、')}
- 特色：${(site.highlights || []).join('、')}
- 標語：${site.slogan}

## ${pages.labels.services}
${services.map((s) => `- [${s.data.title}](${u(`/services/${s.id}/`)})：${s.data.answer}`).join('\n')}

## ${pages.labels.cases}
${cases.map((c) => `- [${c.data.title}](${u(`/cases/${c.id}/`)})：${c.data.summary}`).join('\n')}

## ${pages.labels.blog}
${posts.map((p) => `- [${p.data.title}](${u(`/blog/${p.id}/`)})：${p.data.summary}`).join('\n')}

## 其他
- [${pages.labels.faq} Q&A](${u('/faq/')})
- [${pages.labels.about}](${u('/about/')})
- [${pages.labels.contact}](${u('/contact/')})
`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
