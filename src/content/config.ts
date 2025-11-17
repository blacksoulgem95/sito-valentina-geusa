import { defineCollection, z } from "astro:content";

const portfolioCollection = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum([
      "ui-ux",
      "illustration",
      "editorial",
      "brand-identity",
      "web-design",
    ]),
    category: z.string(),
    status: z.enum(["completed", "in-progress"]).default("completed"),
    featured: z.boolean().default(false),
    order: z.number().default(0),
    image: z.string().optional(),
    client: z.string().optional(),
    year: z.string().optional(),
    tags: z.array(z.string()).optional(),
    link: z.string().optional(),

    // Immagini del progetto
    images: z
      .object({
        hero: z.string().optional(),
        mockup: z.string().optional(),
        result: z.string().optional(),
        gallery: z.array(z.string()).optional(),
      })
      .optional(),

    // Per layout Standard (UI/UX, Brand, Editorial, ecc.)
    objectives: z
      .array(
        z.object({
          title: z.string(),
          description: z.string(),
          color: z.enum(["blue", "purple", "orange", "indigo"]).optional(),
        }),
      )
      .optional(),

    results: z
      .object({
        title: z.string().optional(),
        paragraphs: z.array(z.string()),
        figmaLink: z.string().optional(),
      })
      .optional(),

    reflections: z
      .object({
        title: z.string().optional(),
        content: z.array(z.string()),
      })
      .optional(),

    // Per layout Illustrazioni
    illustration: z
      .object({
        subtitle: z.string().optional(),
        styleTitle: z.string().optional(),
        styleDescription: z.array(z.string()).optional(),
        exampleImages: z.array(z.string()).optional(),
        reflectionsTitle: z.string().optional(),
        reflectionsContent: z.array(z.string()).optional(),
      })
      .optional(),
  }),
});

export const collections = {
  portfolio: portfolioCollection,
};
