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
    // Optional on purpose: a missing screenshot shows a labelled slot, never a fake one.
    image: image().optional(),
    imageAlt: z.string().optional(),
    link: z.string(),
    order: z.number(),
  }),
});

export const collections = { projects };
