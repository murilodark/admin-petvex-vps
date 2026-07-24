export interface CatalogModuleItem {
  key: string;
  name: string;
  description: string;
  category: string;
  display_order: number;
  is_core?: boolean;
}

export interface CatalogFeatureItem {
  key: string;
  name: string;
  description: string;
  module: string;
  display_order: number;
  dependencies: string[];
}

export interface CatalogCapabilityItem {
  key: string;
  name: string;
  description: string;
  category: string;
  display_order: number;
  dependencies: string[];
}

export interface CatalogLimitItem {
  key: string;
  name: string;
  description: string | null;
  module_key: string | null;
  feature_key: string | null;
  unit: string;
  display_order: number;
}

export interface CapabilityCatalogData {
  modules: CatalogModuleItem[];
  features: CatalogFeatureItem[];
  capabilities: CatalogCapabilityItem[];
  limits: CatalogLimitItem[];
}

export interface PlanLimitsMap {
  [limitKey: string]: number | null;
}

export interface Plan {
  id: number;
  name: string;
  slug: string;
  short_description?: string | null;
  description?: string | null;
  monthly_price: number;
  yearly_price: number;
  yearly_discount_percent?: number | null;
  is_featured: boolean;
  has_trial: boolean;
  trial_days?: number | null;
  display_order?: number | null;
  badge?: string | null;
  color?: string | null;
  is_active: boolean;
  modules?: string[];
  features?: Record<string, boolean> | string[];
  capabilities?: string[];
  limits?: PlanLimitsMap;
  created_at?: string;
  updated_at?: string;
}

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
  is_active: boolean;
  modules: string[];
  features: string[];
  capabilities: string[];
  limits: Record<string, number | null>;
}

