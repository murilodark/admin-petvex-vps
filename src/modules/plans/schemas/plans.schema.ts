import { z } from 'zod';

export const planFormSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres'),
  slug: z.string().optional(),
  short_description: z.string().optional().default(''),
  description: z.string().optional().default(''),
  monthly_price: z.coerce.number().min(0, 'O preço mensal não pode ser negativo'),
  yearly_price: z.coerce.number().min(0, 'O preço anual não pode ser negativo'),
  yearly_discount_percent: z.coerce.number().min(0).max(100).optional().nullable(),
  is_featured: z.boolean().default(false),
  has_trial: z.boolean().default(false),
  trial_days: z.coerce.number().int().min(0).optional().nullable(),
  display_order: z.coerce.number().int().min(0).optional().nullable(),
  badge: z.string().optional().default(''),
  color: z.string().optional().default(''),
  is_active: z.boolean().default(true),
  modules: z.array(z.string()).default([]),
  features: z.array(z.string()).default([]),
  capabilities: z.array(z.string()).default([]),
  limits: z.record(z.string(), z.number().int().min(0).nullable()).default({}),
});

