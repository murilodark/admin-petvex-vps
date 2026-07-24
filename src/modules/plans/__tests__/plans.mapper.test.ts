import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  plansMapper,
  extractSelectionsFromPlan,
  buildFeaturesBooleanMap,
  sanitizeLimitsMap,
} from '../mappers/plans.mapper';
import { PlanFormData, CapabilityCatalogData, Plan } from '../types/plans.types';

const mockCatalog: CapabilityCatalogData = {
  modules: [
    { key: 'inventory', name: 'Estoque', description: 'Módulo de Estoque', category: 'Geral', display_order: 1 },
    { key: 'clinical', name: 'Clínico', description: 'Prontuário Veterinário', category: 'Geral', display_order: 2 },
  ],
  features: [
    {
      key: 'stock',
      name: 'Gestão de Estoque',
      description: 'Controle de produtos',
      module: 'inventory',
      display_order: 1,
      dependencies: ['inventory'],
    },
    {
      key: 'vaccination',
      name: 'Vacinação',
      description: 'Carteira de vacinas',
      module: 'clinical',
      display_order: 2,
      dependencies: ['clinical'],
    },
  ],
  capabilities: [
    {
      key: 'multi_user',
      name: 'Multi-usuário',
      description: 'Acesso simultâneo',
      category: 'Geral',
      display_order: 1,
      dependencies: [],
    },
    {
      key: 'cashflow',
      name: 'Fluxo de Caixa',
      description: 'Gestão financeira',
      category: 'Geral',
      display_order: 2,
      dependencies: [],
    },
  ],
  limits: [
    {
      key: 'users',
      name: 'Usuários do Sistema',
      description: null,
      module_key: null,
      feature_key: null,
      unit: 'unidades',
      display_order: 1,
    },
    {
      key: 'stock_items',
      name: 'Itens em Estoque',
      description: null,
      module_key: 'inventory',
      feature_key: 'stock',
      unit: 'itens',
      display_order: 2,
    },
  ],
};

describe('Plans Mapper - Hydration and API Payload Conversion', () => {
  it('1. Extract selections from plan using catalog correctly categorizes keys and limits', () => {
    const rawPlan: Plan = {
      id: 10,
      name: 'Plano Pro',
      slug: 'plano-pro',
      monthly_price: 199,
      yearly_price: 1990,
      is_featured: true,
      has_trial: false,
      is_active: true,
      features: {
        inventory: true,
        stock: true,
        multi_user: true,
        clinical: false,
        cashflow: false,
      },
      limits: {
        users: 5,
        stock_items: 0, // 0 means blocked, MUST be preserved as 0
      },
    };

    const extracted = extractSelectionsFromPlan(rawPlan, mockCatalog);

    assert.deepEqual(extracted.selectedModules, ['inventory']);
    assert.deepEqual(extracted.selectedFeatures, ['stock']);
    assert.deepEqual(extracted.selectedCapabilities, ['multi_user']);

    assert.equal(extracted.limitsMap.users, 5);
    assert.equal(extracted.limitsMap.stock_items, 0, 'Limit of 0 must be preserved as number 0, not null');
  });

  it('2. buildFeaturesBooleanMap generates a Record<string, boolean> object, NOT an array', () => {
    const formData: PlanFormData = {
      name: 'Novo Plano',
      monthly_price: 99,
      yearly_price: 990,
      is_featured: false,
      has_trial: false,
      is_active: true,
      modules: ['inventory'],
      features: ['stock'],
      capabilities: ['multi_user'],
      limits: {
        users: 3,
        stock_items: null,
      },
    };

    const featuresMap = buildFeaturesBooleanMap(formData, mockCatalog);

    // Verify it is an Object and NOT an Array
    assert.equal(Array.isArray(featuresMap), false, 'payload.features MUST be a Record object, not an array');
    assert.equal(typeof featuresMap, 'object');

    // Verify boolean entries
    assert.equal(featuresMap['inventory'], true);
    assert.equal(featuresMap['stock'], true);
    assert.equal(featuresMap['multi_user'], true);
    assert.equal(featuresMap['clinical'], false);
    assert.equal(featuresMap['cashflow'], false);

    // Verify absence of numeric array index properties
    assert.equal(featuresMap['0' as any], undefined);
    assert.equal(featuresMap['1' as any], undefined);
  });

  it('3. sanitizeLimitsMap correctly preserves 0, converts empty/null to null, and parses numbers', () => {
    const rawLimits = {
      users: 10,
      stock_items: 0,
      pets: null,
      clients: '',
      documents: '100',
    };

    const sanitized = sanitizeLimitsMap(rawLimits as any);

    assert.equal(sanitized.users, 10);
    assert.equal(sanitized.stock_items, 0, 'Zero must be preserved as 0');
    assert.equal(sanitized.pets, null);
    assert.equal(sanitized.clients, null);
    assert.equal(sanitized.documents, 100);
  });

  it('4. toApiCreate produces valid StorePlanRequest payload with boolean object map', () => {
    const formData: PlanFormData = {
      name: 'Plano Premium',
      monthly_price: 299,
      yearly_price: 2990,
      is_featured: true,
      has_trial: true,
      trial_days: 14,
      is_active: true,
      modules: ['inventory'],
      features: ['stock'],
      capabilities: [],
      limits: {
        users: 10,
        stock_items: 0,
      },
    };

    const payload = plansMapper.toApiCreate(formData, mockCatalog) as any;

    assert.equal(payload.name, 'Plano Premium');
    assert.equal(Array.isArray(payload.features), false, 'features must be a boolean map, not an array');
    assert.equal(payload.features.stock, true);
    assert.equal(payload.features.inventory, true);
    assert.equal(payload.features.clinical, false);
    assert.equal(payload.limits.stock_items, 0);
  });
});
