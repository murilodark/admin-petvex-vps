import {
  createAdminTenant,
  deleteAdminTenant,
  getAdminTenant,
  listAdminTenants,
  updateAdminTenant,
} from '../../../core/http/generated/endpoints/admin-tenants/admin-tenants';
import { Tenant as ApiTenant } from '../../../core/http/generated/models/tenant';
import type {
  StoreAdminTenantRequest,
  UpdateAdminTenantRequest,
} from '../../../core/http/generated/models/admin-tenants';
import { Tenant, TenantFormData } from '../types/tenant.types';
import { tenantMapper } from '../mappers/tenant.mapper';

export interface ListarTenantsParams {
  search?: string;
  status?: string;
  plano?: string;
  page?: number;
  perPage?: number;
}

export interface TenantPaginationMeta {
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
}

export interface AdminTenantsPaginatedResponse {
  data?: ApiTenant[];
  meta?: TenantPaginationMeta;
  links?: unknown;
}

export interface ListarTenantsResult {
  data: Tenant[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export const tenantsService = {
  async listarTenants(params: ListarTenantsParams = {}): Promise<ListarTenantsResult> {
    const rawParams = {
      search: params.search,
      status: params.status === 'all' ? undefined : params.status,
      plano: params.plano === 'all' ? undefined : params.plano,
      page: params.page,
      perPage: params.perPage,
    };

    const cleanParams = Object.fromEntries(
      Object.entries(rawParams).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    const apiResponse = (await listAdminTenants(cleanParams)) as unknown as AdminTenantsPaginatedResponse;

    const tenantsArray = Array.isArray(apiResponse?.data)
      ? apiResponse.data
      : [];

    const meta =
      apiResponse?.meta &&
      typeof apiResponse.meta === 'object'
        ? apiResponse.meta
        : undefined;

    return {
      data: tenantsArray.map(tenantMapper.toUi),
      total: Number(meta?.total ?? tenantsArray.length),
      page: Number(meta?.current_page ?? params.page ?? 1),
      perPage: Number(meta?.per_page ?? params.perPage ?? 15),
      lastPage: Number(meta?.last_page ?? 1),
    };
  },

  async buscarTenantPorId(id: string): Promise<Tenant> {
    const apiResponse = await getAdminTenant(id);
    
    let apiTenant: ApiTenant;
    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      apiTenant = (apiResponse.data as unknown as ApiTenant);
    } else {
      apiTenant = (apiResponse as unknown as ApiTenant);
    }
    
    return tenantMapper.toUi(apiTenant);
  },

  async cadastrarTenant(formData: TenantFormData): Promise<Tenant> {
    const slug = formData.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const apiPayload: StoreAdminTenantRequest = {
      name: formData.name,
      slug,
      email: formData.email,
      document: formData.documento || undefined,
      phone: formData.telefone || undefined,
      active: formData.status === 'active',
      plan: formData.plano || undefined,
    };

    const apiResponse = await createAdminTenant(apiPayload);
    
    let apiTenant: ApiTenant;
    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      apiTenant = (apiResponse.data as unknown as ApiTenant);
    } else {
      apiTenant = (apiResponse as unknown as ApiTenant);
    }
    
    return tenantMapper.toUi(apiTenant);
  },

  async atualizarTenant(id: string, formData: Partial<TenantFormData>): Promise<Tenant> {
    const slug = formData.name
      ? formData.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '')
      : undefined;

    const apiPayload: UpdateAdminTenantRequest = {
      name: formData.name,
      slug,
      email: formData.email,
      document: formData.documento || undefined,
      phone: formData.telefone || undefined,
      active: formData.status ? (formData.status === 'active') : undefined,
      plan: formData.plano || undefined,
    };

    const apiResponse = await updateAdminTenant(id, apiPayload);
    
    let apiTenant: ApiTenant;
    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      apiTenant = (apiResponse.data as unknown as ApiTenant);
    } else {
      apiTenant = (apiResponse as unknown as ApiTenant);
    }
    
    return tenantMapper.toUi(apiTenant);
  },

  async excluirTenant(id: string): Promise<void> {
    await deleteAdminTenant(id);
  }
};
