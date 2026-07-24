import {
  createAdminPlan,
  deleteAdminPlan,
  getAdminPlan,
  listAdminPlans,
  updateAdminPlan,
  activateAdminPlanActivate,
  deactivateAdminPlanDeactivate,
  AppHttpControllersApiV1AdminPlansPlanCapabilityCatalogControllerAdminPlanCapabilityCatalog,
} from '../../../core/http/generated/endpoints/admin-plans/admin-plans';
import type { StorePlanRequest } from '../../../core/http/generated/models/admin-plans/storePlanRequest';
import type { UpdatePlanRequest } from '../../../core/http/generated/models/admin-plans/updatePlanRequest';
import { Plan, PlanFormData, CapabilityCatalogData } from '../types/plans.types';
import { plansMapper } from '../mappers/plans.mapper';

export interface ListarPlansResult {
  data: Plan[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export const plansService = {
  async obterCatalogoCapabilities(): Promise<CapabilityCatalogData> {
    const apiResponse = await AppHttpControllersApiV1AdminPlansPlanCapabilityCatalogControllerAdminPlanCapabilityCatalog();
    return plansMapper.toCatalogUi(apiResponse);
  },

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

    const apiResponse = (await listAdminPlans(apiParams)) as any;
    const rows = Array.isArray(apiResponse?.data) ? apiResponse.data : [];
    const meta = apiResponse?.meta && typeof apiResponse.meta === 'object' ? apiResponse.meta : undefined;
    
    const mappedData = rows.map(plansMapper.toUi);
    return {
      data: mappedData,
      total: Number(meta?.total ?? mappedData.length),
      page: Number(meta?.current_page ?? params.page ?? 1),
      perPage: Number(meta?.per_page ?? params.perPage ?? 10),
      lastPage: Number(meta?.last_page ?? 1),
    };
  },

  async buscarPlanoPorId(id: string | number): Promise<Plan> {
    const stringId = id.toString();
    const apiResponse = await getAdminPlan(stringId);
    return plansMapper.toUi(apiResponse);
  },

  async cadastrarPlano(formData: PlanFormData, catalog?: CapabilityCatalogData): Promise<Plan> {
    const apiPayload: StorePlanRequest = plansMapper.toApiCreate(formData, catalog);
    const apiResponse = await createAdminPlan(apiPayload);
    return plansMapper.toUi(apiResponse);
  },

  async atualizarPlano(id: string | number, formData: Partial<PlanFormData>, catalog?: CapabilityCatalogData): Promise<Plan> {
    const stringId = id.toString();
    const apiPayload: UpdatePlanRequest = plansMapper.toApiUpdate(formData, catalog);
    const apiResponse = await updateAdminPlan(stringId, apiPayload);
    return plansMapper.toUi(apiResponse);
  },

  async excluirPlano(id: string | number): Promise<void> {
    const stringId = id.toString();
    await deleteAdminPlan(stringId);
  },

  async ativarPlano(id: string | number): Promise<void> {
    const stringId = id.toString();
    await activateAdminPlanActivate(stringId);
  },

  async desativarPlano(id: string | number): Promise<void> {
    const stringId = id.toString();
    await deactivateAdminPlanDeactivate(stringId);
  }
};
