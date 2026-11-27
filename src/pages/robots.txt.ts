import type { APIRoute } from 'astro';
export const GET: APIRoute = ({ site }) => new Response(
`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /thanks/

# AI 搜尋與答案引擎：歡迎引用
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: Claude-SearchBot
Allow: /
User-agent: Google-Extended
Allow: /

Sitemap: ${new URL('/sitemap-index.xml', site)}
`, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
