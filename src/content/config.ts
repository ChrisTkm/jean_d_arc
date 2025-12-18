// Tipos de Astro Content Collections
import { defineCollection, z } from 'astro:content';

// Definición explícita de la colección "docs"
const docs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    sidebar: z
      .object({
        label: z.string().optional(),
        order: z.number().optional(),
        hidden: z.boolean().optional()
      })
      .optional(),
    updated: z.union([z.string(), z.date()]).optional().transform(v => {
      if (!v) return v;
      if (v instanceof Date) return v.toISOString().split('T')[0];
      // Si ya es string, normaliza a formato YYYY-MM-DD si posible
      const m = v.match(/^(\d{4}-\d{2}-\d{2})/);
      return m ? m[1] : v;
    })
  })
});

export const collections = { docs };
