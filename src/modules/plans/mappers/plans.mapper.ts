import { Plan, PlanFormData, CapabilityCatalogData } from '../types/plans.types';
import { StorePlanRequest } from '../../../core/http/generated/models/admin-plans/storePlanRequest';
import { UpdatePlanRequest } from '../../../core/http/generated/models/admin-plans/updatePlanRequest';

export function extractSelectionsFromPlan(
  plan: Plan,
  catalog?: CapabilityCatalogData
): {
  selectedModules: string[];
  selectedFeatures: string[];
  selectedCapabilities: string[];
  limitsMap: Record<string, number | null>;
} {
  const selectedModules: string[] = [];
  const selectedFeatures: string[] = [];
  const selectedCapabilities: string[] = [];
  const limitsMap: Record<string, number | null> = {};

  // Build a set of enabled keys from plan.features
  const enabledKeys = new Set<string>();

  if (plan.features && typeof plan.features === 'object' && !Array.isArray(plan.features)) {
    Object.entries(plan.features).forEach(([k, v]) => {
      if (!!v) enabledKeys.add(k);
    });
  } else if (Array.isArray(plan.features)) {
    plan.features.forEach((f) => {
      if (typeof f === 'string') enabledKeys.add(f);
    });
  }

  if (Array.isArray(plan.modules)) {
    plan.modules.forEach((m) => {
      if (typeof m === 'string') enabledKeys.add(m);
    });
  }

  if (Array.isArray(plan.capabilities)) {
    plan.capabilities.forEach((c) => {
      if (typeof c === 'string') enabledKeys.add(c);
    });
  }

  if (catalog) {
    catalog.modules.forEach((mod) => {
      if (enabledKeys.has(mod.key)) {
        selectedModules.push(mod.key);
      }
    });

    catalog.features.forEach((feat) => {
      if (enabledKeys.has(feat.key)) {
        selectedFeatures.push(feat.key);
      }
    });

    catalog.capabilities.forEach((cap) => {
      if (enabledKeys.has(cap.key)) {
        selectedCapabilities.push(cap.key);
      }
    });
  } else {
    // Fallback if catalog not available yet
    enabledKeys.forEach((key) => selectedFeatures.push(key));
  }

  // Hydrate limits map from plan.limits
  if (plan.limits && typeof plan.limits === 'object' && !Array.isArray(plan.limits)) {
    Object.entries(plan.limits).forEach(([k, v]) => {
      if (v === null || v === undefined || (typeof v === 'string' && (v as string).trim() === '')) {
        limitsMap[k] = null;
      } else {
        const num = Number(v);
        limitsMap[k] = isNaN(num) ? null : num;
      }
    });
  }

  // Ensure default catalog limits exist in map if catalog is provided
  if (catalog?.limits) {
    catalog.limits.forEach((lim) => {
      if (!(lim.key in limitsMap)) {
        limitsMap[lim.key] = null;
      }
    });
  }

  return {
    selectedModules,
    selectedFeatures,
    selectedCapabilities,
    limitsMap,
  };
}

export function buildFeaturesBooleanMap(
  formData: PlanFormData,
  catalog?: CapabilityCatalogData
): Record<string, boolean> {
  const enabledKeys = new Set<string>();

  (formData.modules || []).forEach((key) => enabledKeys.add(key));
  (formData.features || []).forEach((key) => enabledKeys.add(key));
  (formData.capabilities || []).forEach((key) => enabledKeys.add(key));

  // Dependency normalization: if a feature is enabled, ensure its module and dependencies are enabled
  if (catalog?.features) {
    catalog.features.forEach((feat) => {
      if (enabledKeys.has(feat.key)) {
        if (feat.module) enabledKeys.add(feat.module);
        if (Array.isArray(feat.dependencies)) {
          feat.dependencies.forEach((dep) => enabledKeys.add(dep));
        }
      }
    });
  }

  if (catalog?.capabilities) {
    catalog.capabilities.forEach((cap) => {
      if (enabledKeys.has(cap.key)) {
        if (Array.isArray(cap.dependencies)) {
          cap.dependencies.forEach((dep) => enabledKeys.add(dep));
        }
      }
    });
  }

  const allKeys = new Set<string>();

  if (catalog) {
    catalog.modules.forEach((m) => allKeys.add(m.key));
    catalog.features.forEach((f) => allKeys.add(f.key));
    catalog.capabilities.forEach((c) => allKeys.add(c.key));
  }

  enabledKeys.forEach((k) => allKeys.add(k));

  const featuresMap: Record<string, boolean> = {};
  allKeys.forEach((k) => {
    featuresMap[k] = enabledKeys.has(k);
  });

  return featuresMap;
}

export function sanitizeLimitsMap(
  rawLimits?: Record<string, number | null | string>
): Record<string, number | null> {
  const result: Record<string, number | null> = {};
  if (!rawLimits || typeof rawLimits !== 'object') return result;

  Object.entries(rawLimits).forEach(([k, v]) => {
    if (v === null || v === undefined || (typeof v === 'string' && v.trim() === '')) {
      result[k] = null;
    } else {
      const num = Number(v);
      result[k] = isNaN(num) ? null : num;
    }
  });

  return result;
}

export const plansMapper = {
  toCatalogUi(apiData: any): CapabilityCatalogData {
    const rawData = apiData?.data || apiData || {};
    const rawModules = Array.isArray(rawData?.modules) ? rawData.modules : [];
    const rawFeatures = Array.isArray(rawData?.features) ? rawData.features : [];
    const rawCapabilities = Array.isArray(rawData?.capabilities) ? rawData.capabilities : [];
    const rawLimits = Array.isArray(rawData?.limits) ? rawData.limits : [];

    return {
      modules: rawModules
        .map((m: any) => ({
          key: String(m.key || ''),
          name: String(m.name || m.key || ''),
          description: String(m.description || ''),
          category: String(m.category || 'Geral'),
          display_order: Number(m.display_order ?? 0),
          is_core: !!m.is_core,
        }))
        .sort((a: any, b: any) => a.display_order - b.display_order),

      features: rawFeatures
        .map((f: any) => ({
          key: String(f.key || ''),
          name: String(f.name || f.key || ''),
          description: String(f.description || ''),
          module: String(f.module || ''),
          display_order: Number(f.display_order ?? 0),
          dependencies: Array.isArray(f.dependencies) ? f.dependencies.map(String) : [],
        }))
        .sort((a: any, b: any) => a.display_order - b.display_order),

      capabilities: rawCapabilities
        .map((c: any) => ({
          key: String(c.key || ''),
          name: String(c.name || c.key || ''),
          description: String(c.description || ''),
          category: String(c.category || 'Geral'),
          display_order: Number(c.display_order ?? 0),
          dependencies: Array.isArray(c.dependencies) ? c.dependencies.map(String) : [],
        }))
        .sort((a: any, b: any) => a.display_order - b.display_order),

      limits: rawLimits
        .map((l: any) => ({
          key: String(l.key || ''),
          name: String(l.name || l.key || ''),
          description: l.description ? String(l.description) : null,
          module_key: l.module_key ? String(l.module_key) : null,
          feature_key: l.feature_key ? String(l.feature_key) : null,
          unit: String(l.unit || 'unidades'),
          display_order: Number(l.display_order ?? 0),
        }))
        .sort((a: any, b: any) => a.display_order - b.display_order),
    };
  },

  toUi(apiData: any): Plan {
    const raw = apiData?.data && typeof apiData.data === 'object' && !Array.isArray(apiData.data)
      ? apiData.data
      : apiData;

    let rawFeatures: Record<string, boolean> = {};
    if (raw.features && typeof raw.features === 'object' && !Array.isArray(raw.features)) {
      Object.entries(raw.features).forEach(([k, v]) => {
        rawFeatures[k] = !!v;
      });
    } else if (Array.isArray(raw.features)) {
      raw.features.forEach((f: any) => {
        if (typeof f === 'string') rawFeatures[f] = true;
      });
    }

    const limits = sanitizeLimitsMap(raw.limits);

    return {
      id: raw.id ? Number(raw.id) : 0,
      name: raw.name || '',
      slug: raw.slug || '',
      short_description: raw.short_description || '',
      description: raw.description || '',
      monthly_price: typeof raw.monthly_price === 'number' ? raw.monthly_price : parseFloat(raw.monthly_price) || 0,
      yearly_price: typeof raw.yearly_price === 'number' ? raw.yearly_price : parseFloat(raw.yearly_price) || 0,
      yearly_discount_percent: typeof raw.yearly_discount_percent === 'number' ? raw.yearly_discount_percent : (parseFloat(raw.yearly_discount_percent) || null),
      is_featured: !!raw.is_featured,
      has_trial: !!raw.has_trial,
      trial_days: typeof raw.trial_days === 'number' ? raw.trial_days : (parseInt(raw.trial_days, 10) || null),
      display_order: typeof raw.display_order === 'number' ? raw.display_order : (parseInt(raw.display_order, 10) || 0),
      badge: raw.badge || '',
      color: raw.color || '',
      is_active: raw.is_active !== undefined ? !!raw.is_active : true,
      features: rawFeatures,
      limits,
      created_at: raw.created_at || raw.createdAt || new Date().toISOString(),
      updated_at: raw.updated_at || raw.updatedAt,
    };
  },

  toApiCreate(formData: PlanFormData, catalog?: CapabilityCatalogData): StorePlanRequest {
    const featuresMap = buildFeaturesBooleanMap(formData, catalog);
    const limitsMap = sanitizeLimitsMap(formData.limits);

    const payload = {
      name: formData.name,
      slug: formData.slug || undefined,
      short_description: formData.short_description || undefined,
      description: formData.description || undefined,
      monthly_price: formData.monthly_price,
      yearly_price: formData.yearly_price,
      yearly_discount_percent: formData.yearly_discount_percent ?? undefined,
      is_featured: formData.is_featured,
      has_trial: formData.has_trial,
      trial_days: formData.trial_days ?? undefined,
      display_order: formData.display_order ?? undefined,
      badge: formData.badge || undefined,
      color: formData.color || undefined,
      is_active: formData.is_active,
      limits: limitsMap,
      features: featuresMap as unknown as boolean[],
    };

    return payload as unknown as StorePlanRequest;
  },

  toApiUpdate(formData: Partial<PlanFormData> | PlanFormData, catalog?: CapabilityCatalogData): UpdatePlanRequest {
    const fullFormData: PlanFormData = {
      name: formData.name || '',
      slug: formData.slug || '',
      short_description: formData.short_description || '',
      description: formData.description || '',
      monthly_price: formData.monthly_price ?? 0,
      yearly_price: formData.yearly_price ?? 0,
      yearly_discount_percent: formData.yearly_discount_percent ?? null,
      is_featured: formData.is_featured ?? false,
      has_trial: formData.has_trial ?? false,
      trial_days: formData.trial_days ?? null,
      display_order: formData.display_order ?? null,
      badge: formData.badge || '',
      color: formData.color || '',
      is_active: formData.is_active ?? true,
      modules: formData.modules || [],
      features: formData.features || [],
      capabilities: formData.capabilities || [],
      limits: formData.limits || {},
    };

    const featuresMap = buildFeaturesBooleanMap(fullFormData, catalog);
    const limitsMap = sanitizeLimitsMap(fullFormData.limits);

    const payload = {
      name: formData.name,
      slug: formData.slug || undefined,
      short_description: formData.short_description || undefined,
      description: formData.description || undefined,
      monthly_price: formData.monthly_price,
      yearly_price: formData.yearly_price,
      yearly_discount_percent: formData.yearly_discount_percent ?? undefined,
      is_featured: formData.is_featured,
      has_trial: formData.has_trial,
      trial_days: formData.trial_days ?? undefined,
      display_order: formData.display_order ?? undefined,
      badge: formData.badge || undefined,
      color: formData.color || undefined,
      is_active: formData.is_active,
      limits: limitsMap,
      features: featuresMap as unknown as boolean[],
    };

    return payload as unknown as UpdatePlanRequest;
  },
};


