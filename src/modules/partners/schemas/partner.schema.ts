import { z } from 'zod';
import { PartnerCouponDiscountType } from '../../../core/http/generated/models/admin-partners/partnerCouponDiscountType';

export const partnerSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
  company_name: z.string().nullable().optional(),
  document: z.string().nullable().optional(),
  email: z.string().email('E-mail inválido').or(z.literal('')).nullable().optional(),
  phone: z.string().nullable().optional(),
  website: z.string().url('URL do site inválida').or(z.literal('')).nullable().optional(),
  instagram: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  is_active: z.boolean().default(true),
});

export const couponSchema = z.object({
  partner_id: z.coerce.number().min(1, 'Selecione um parceiro'),
  code: z.string()
    .min(3, 'O código deve ter pelo menos 3 caracteres')
    .max(80, 'Máximo 80 caracteres')
    .regex(/^[A-Za-z0-9_-]+$/, 'Código inválido (apenas letras, números, hífen e underline são aceitos)'),
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres').max(255, 'Máximo 255 caracteres'),
  description: z.string().nullable().optional(),
  discount_type: z.nativeEnum(PartnerCouponDiscountType),
  discount_value: z.coerce.number()
    .positive('O desconto deve ser um valor positivo'),
  starts_at: z.string().nullable().optional(),
  expires_at: z.string().nullable().optional(),
  usage_limit: z.coerce.number().nullable().optional(),
  usage_limit_per_tenant: z.coerce.number().nullable().optional(),
  is_active: z.boolean().default(true),
});
