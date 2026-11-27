// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// 上線前請把 SITE_URL 改成正式網域（或在主機的環境變數設定 SITE_URL）
const SITE_URL = process.env.SITE_URL || 'https://figurestall-site.pages.dev';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (page) => !page.includes('/admin/') && !page.includes('/thanks/'),
      i18n: { defaultLocale: 'zh-TW', locales: { 'zh-TW': 'zh-TW' } },
    }),
  ],
  build: { format: 'directory' },
});
