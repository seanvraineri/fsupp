import { z } from 'zod';

export const RecommendationSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(),
  supplement: z.string(),
  dosage: z.string(),
  schedule: z.string(),
  priority: z.number().int(),
  category: z.string().optional(),
  rationale: z.string(),
  interactions: z.array(z.string()).nullable(),
  pubmed_ids: z.array(z.string()).nullable(),
  product_url: z.string().url().nullable(),
  image_url: z.string().url().nullable(),
  last_updated: z.string(),
  adherence_pct: z.number().nullable(),
});

export type Recommendation = z.infer<typeof RecommendationSchema>; 
