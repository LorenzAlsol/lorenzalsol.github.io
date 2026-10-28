import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/projects' }),
  schema: ({ image }) => z.object({
    title: z.string(),
    year: z.string(),
    stack: z.array(z.string()),
    role: z.string(),
    summary: z.string(),
    image: image(),
    imageAlt: z.string(),
    link: z.string(),
    order: z.number(),
  }),
});

export const collections = { projects };
