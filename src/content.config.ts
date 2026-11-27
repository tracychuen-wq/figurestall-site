import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const faq = z.object({ q: z.string(), a: z.string() });
const photo = z.object({ src: z.string(), alt: z.string().optional().default('') });

const services = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    shortTitle: z.string(),
    order: z.number().default(99),
    summary: z.string(),
    answer: z.string(), // GEO：一段話直接回答「這項服務是什麼、適合誰」
    cover: z.string(),
    shopUrl: z.string().optional(), // 選填：這個服務的線上購買連結
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    signs: z.array(z.string()).default([]),
    faqs: z.array(faq).default([]),
    updated: z.coerce.date().optional(),
    draft: z.boolean().default(false),
  }),
});

const cases = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cases' }),
  schema: z.object({
    title: z.string(),
    service: z.string(), // 對應服務項目的檔名（slug）
    category: z.string(),
    location: z.string().optional().default(''),
    date: z.coerce.date(),
    summary: z.string(),
    cover: z.string(),
    photos: z.array(photo).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    updated: z.coerce.date().optional(),
    summary: z.string(),
    keyPoints: z.array(z.string()).default([]),
    cover: z.string().optional(),
    tags: z.array(z.string()).default([]),
    faqs: z.array(faq).default([]),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { services, cases, blog };
