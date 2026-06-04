import { 
  getAdminPlans, 
  getAdminPlansId, 
  postAdminPlans, 
  putAdminPlansId, 
  deleteAdminPlansId,
  patchAdminPlansIdActivate,
  patchAdminPlansIdDeactivate
} from '../../../core/http/generated/endpoints/default/default';
import { Plan, PlanFormData } from '../types/plans.types';
import { plansMapper } from '../mappers/plans.mapper';

const LOCAL_STORAGE_KEY = 'petvex_plans_db';

const getStoredPlans = (): Plan[] => {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    const initialPlans: Plan[] = [
      {
        id: 1,
        name: 'Starter',
        slug: 'starter',
        short_description: 'Plano inicial para operações pet menores.',
        description: 'Ideal para empresas pet que estão começando a organizar clientes, pets, agenda e estoque básico.',
        monthly_price: 79.9,
        yearly_price: 862.92,
        yearly_discount_percent: 10,
        is_featured: false,
        has_trial: true,
        trial_days: 7,
        display_order: 1,
        badge: 'Essencial',
        color: '#2563eb',
        max_users: 2,
        max_clients: 500,
        max_pets: 1000,
        max_appointments: 500,
        max_products: 500,
        max_services: 50,
        max_stock_items: 500,
        max_documents: 500,
        max_attachments: 500,
        max_storage_mb: 1024,
        features: {
          pdv: false,
          reports: true,
          boarding: false,
          grooming: true,
          whatsapp: false,
          financial: false,
          inventory: true,
          surgeries: false,
          multi_user: true,
          vaccination: true,
          appointments: true,
          external_api: false,
          integrations: false,
          hospitalization: false,
          advanced_dashboard: false
        },
        is_active: true,
        created_at: '2026-05-30T19:42:01.000Z',
      },
      {
        id: 2,
        name: 'Professional',
        slug: 'professional',
        short_description: 'Plano completo para clínicas em crescimento.',
        description: 'Ideal para clínicas e hospitais pet que precisam de recursos avançados de faturamento, internações e suporte prioritário.',
        monthly_price: 199.9,
        yearly_price: 2158.92,
        yearly_discount_percent: 10,
        is_featured: true,
        has_trial: true,
        trial_days: 14,
        display_order: 2,
        badge: 'Recomendado',
        color: '#10b981',
        max_users: 10,
        max_clients: 2000,
        max_pets: 5000,
        max_appointments: 2000,
        max_products: 1500,
        max_services: 200,
        max_stock_items: 2000,
        max_documents: 2000,
        max_attachments: 2000,
        max_storage_mb: 5120,
        features: {
          pdv: true,
          reports: true,
          boarding: true,
          grooming: true,
          whatsapp: true,
          financial: true,
          inventory: true,
          surgeries: true,
          multi_user: true,
          vaccination: true,
          appointments: true,
          external_api: false,
          integrations: true,
          hospitalization: true,
          advanced_dashboard: true
        },
        is_active: true,
        created_at: '2026-05-30T19:50:00.000Z',
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initialPlans));
    return initialPlans;
  }
  try {
    return JSON.parse(data).map(plansMapper.toUi);
  } catch {
    return [];
  }
};

const saveStoredPlans = (plans: Plan[]): void => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
};

export interface ListarPlansResult {
  data: Plan[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export const plansService = {
  async listarPlanos(params: {
    page?: number;
    perPage?: number;
    search?: string;
    status?: string;
  }): Promise<ListarPlansResult> {
    const apiParams: any = {};
    if (params.page !== undefined) apiParams.page = params.page;
    if (params.perPage !== undefined) apiParams.perPage = params.perPage;
    if (params.search) apiParams.search = params.search;
    if (params.status && params.status !== 'all') apiParams.status = params.status;

    try {
      const apiResponse = await getAdminPlans(apiParams);
      // Ensure data field is mapped through toUi to sanitize responses
      const mappedData = (apiResponse?.data || []).map(plansMapper.toUi);
      return {
        data: mappedData,
        total: apiResponse?.total ?? mappedData.length,
        page: apiResponse?.page ?? (params.page ?? 1),
        perPage: apiResponse?.perPage ?? (mappedData.length || 10),
        lastPage: apiResponse?.lastPage ?? 1,
      };
    } catch (e) {
      console.warn('API error listing plans, using local fallback:', e);
      let list = getStoredPlans();

      if (params.search) {
        const searchLower = params.search.toLowerCase();
        list = list.filter((p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description && p.description.toLowerCase().includes(searchLower)) ||
          (p.short_description && p.short_description.toLowerCase().includes(searchLower))
        );
      }

      if (params.status && params.status !== 'all') {
        const isActiveFilter = params.status === 'active';
        list = list.filter((p) => p.is_active === isActiveFilter);
      }

      const page = params.page || 1;
      const responsePerPage = params.perPage || list.length || 10;
      const total = list.length;
      const lastPage = Math.ceil(total / responsePerPage) || 1;
      const startIndex = (page - 1) * responsePerPage;
      const paginatedItems = list.slice(startIndex, startIndex + responsePerPage);

      return {
        data: paginatedItems,
        total,
        page,
        perPage: responsePerPage,
        lastPage,
      };
    }
  },

  async buscarPlanoPorId(id: string | number): Promise<Plan> {
    const stringId = id.toString();
    try {
      const apiResponse = await getAdminPlansId(stringId);
      return plansMapper.toUi(apiResponse);
    } catch (e) {
      console.warn(`API error getting plan #${id}, using local fallback:`, e);
      const list = getStoredPlans();
      const found = list.find((p) => p.id?.toString() === stringId);
      if (!found) {
        throw new Error('Plano não encontrado.');
      }
      return found;
    }
  },

  async cadastrarPlano(formData: PlanFormData): Promise<Plan> {
    const list = getStoredPlans();
    if (list.some((p) => p.name.toLowerCase().trim() === formData.name.toLowerCase().trim())) {
      const apiError: any = new Error('The given data was invalid.');
      apiError.response = {
        status: 422,
        data: {
          message: 'Erro de validação cadastral.',
          errors: {
            name: ['Este termo de plano já foi registrado no cadastro global.'],
          }
        }
      };
      throw apiError;
    }

    const apiPayload = plansMapper.toApiCreate(formData);

    try {
      const apiResponse = await postAdminPlans(apiPayload);
      const mapped = plansMapper.toUi(apiResponse);
      saveStoredPlans([mapped, ...list]);
      return mapped;
    } catch (e: any) {
      if (e && (e.name === 'ApiError' || e.status || e.response)) {
        throw e;
      }
      console.warn('API error creating plan, storing locally:', e);
      const fakeId = Math.floor(Math.random() * 100000);
      const newPlan = plansMapper.toUi({
        ...formData,
        id: fakeId,
        created_at: new Date().toISOString(),
      });
      saveStoredPlans([newPlan, ...list]);
      return newPlan;
    }
  },

  async atualizarPlano(id: string | number, formData: Partial<PlanFormData>): Promise<Plan> {
    const stringId = id.toString();
    const list = getStoredPlans();
    const index = list.findIndex((p) => p.id?.toString() === stringId);
    if (index === -1) {
      throw new Error('Plano não cadastrado no banco.');
    }

    const apiPayload = plansMapper.toApiUpdate(formData);

    try {
      const apiResponse = await putAdminPlansId(stringId, apiPayload);
      const mapped = plansMapper.toUi(apiResponse);
      list[index] = mapped;
      saveStoredPlans(list);
      return mapped;
    } catch (e: any) {
      if (e && (e.name === 'ApiError' || e.status || e.response)) {
        throw e;
      }
      console.warn(`API error patching plan #${id}, falling back:`, e);
      const current = list[index];
      const updated = plansMapper.toUi({
        ...current,
        ...formData,
        updated_at: new Date().toISOString(),
      });
      list[index] = updated;
      saveStoredPlans(list);
      return updated;
    }
  },

  async excluirPlano(id: string | number): Promise<void> {
    const stringId = id.toString();
    try {
      await deleteAdminPlansId(stringId);
    } catch (e) {
      console.warn(`API error deleting plan #${id}:`, e);
    } finally {
      const list = getStoredPlans();
      saveStoredPlans(list.filter((p) => p.id?.toString() !== stringId));
    }
  },

  async ativarPlano(id: string | number): Promise<void> {
    const stringId = id.toString();
    try {
      await patchAdminPlansIdActivate(stringId);
    } catch (e) {
      console.warn(`API error activating plan #${id}:`, e);
    } finally {
      const list = getStoredPlans();
      const index = list.findIndex((p) => p.id?.toString() === stringId);
      if (index !== -1) {
        list[index].is_active = true;
        saveStoredPlans(list);
      }
    }
  },

  async desativarPlano(id: string | number): Promise<void> {
    const stringId = id.toString();
    try {
      await patchAdminPlansIdDeactivate(stringId);
    } catch (e) {
      console.warn(`API error deactivating plan #${id}:`, e);
    } finally {
      const list = getStoredPlans();
      const index = list.findIndex((p) => p.id?.toString() === stringId);
      if (index !== -1) {
        list[index].is_active = false;
        saveStoredPlans(list);
      }
    }
  }
};
