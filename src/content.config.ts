import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

// status "draft" entries render in `astro dev` / preview deploys but are
// excluded from production builds (see src/lib/published.ts).
const work = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
  schema: z.object({
    title: z.string(),
    org: z.string(),
    role: z.string(),
    years: z.string(),
    order: z.number(),
    summary: z.string(),
    status: z.enum(["published", "draft"]).default("published"),
  }),
});

const photos = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/photos" }),
  schema: z.object({
    title: z.string(),
    image: z.string(),
    story: z.string(),
    placeholder: z.boolean().default(false),
  }),
});

export const collections = { work, photos };
