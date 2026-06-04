import { Plan as ApiPlan } from '../../../core/http/generated/models/plan';
import { PlanFeatures } from '../../../core/http/generated/models/planFeatures';

export type Plan = ApiPlan;

export interface PlanFormData {
  name: string;
  slug?: string;
  short_description?: string;
  description?: string;
  monthly_price: number;
  yearly_price: number;
  yearly_discount_percent?: number | null;
  is_featured: boolean;
  has_trial: boolean;
  trial_days?: number | null;
  display_order?: number | null;
  badge?: string;
  color?: string;
  max_users?: number | null;
  max_clients?: number | null;
  max_pets?: number | null;
  max_appointments?: number | null;
  max_products?: number | null;
  max_services?: number | null;
  max_stock_items?: number | null;
  max_documents?: number | null;
  max_attachments?: number | null;
  max_storage_mb?: number | null;
  features: PlanFeatures;
  is_active: boolean;
}
