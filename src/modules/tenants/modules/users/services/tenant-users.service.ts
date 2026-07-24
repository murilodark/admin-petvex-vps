import {
  activateAdminTenantUserActivate,
  createAdminTenantUser,
  deactivateAdminTenantUserDeactivate,
  deleteAdminTenantUser,
  getAdminTenantUser,
  listAdminTenantUsers,
  updateAdminTenantUser,
} from '../../../../../core/http/generated/endpoints/admin-tenant-users/admin-tenant-users';
import { TenantUser, TenantUserFormData } from '../types/tenant-user.types';
import { tenantUserMapper } from '../mappers/tenant-user.mapper';

export interface ListarTenantUsersParams {
  page?: number;
  search?: string;
  active?: string; // 'all' | 'active' | 'inactive'
  role?: string;
}

export interface ListarTenantUsersResult {
  data: TenantUser[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export const tenantUsersService = {
  async listarUsuarios(tenantId: string, params: ListarTenantUsersParams = {}): Promise<ListarTenantUsersResult> {
    // Build clean parameters for the API call
    const rawParams = {
      page: params.page,
      search: params.search || undefined,
      active: params.active === 'active' ? true : params.active === 'inactive' ? false : undefined,
      role: params.role === 'all' || !params.role ? undefined : params.role,
    };

    // Exclude empty and undefined properties (strictly respects "no perPage by default")
    const cleanParams = Object.fromEntries(
      Object.entries(rawParams).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    const response = (await listAdminTenantUsers(Number(tenantId), cleanParams)) as any;

    const usersArray: any[] = Array.isArray(response?.data) ? response.data : [];
    const meta = response?.meta && typeof response.meta === 'object' ? response.meta : undefined;

    const total = Number(meta?.total ?? usersArray.length);
    const page = Number(meta?.current_page ?? params.page ?? 1);
    const perPage = Number(meta?.per_page ?? 15);
    const lastPage = Number(meta?.last_page ?? 1);

    return {
      data: usersArray.map(tenantUserMapper.toUi),
      total,
      page,
      perPage,
      lastPage,
    };
  },

  async buscarUsuarioPorId(tenantId: string, userId: string): Promise<TenantUser> {
    const response = await getAdminTenantUser(Number(tenantId), Number(userId));
    
    let apiUser: any;
    if (response && typeof response === 'object' && 'data' in response) {
      apiUser = (response.data as unknown);
    } else {
      apiUser = (response as unknown);
    }
    
    return tenantUserMapper.toUi(apiUser);
  },

  async cadastrarUsuario(tenantId: string, formData: TenantUserFormData): Promise<TenantUser> {
    const payload = tenantUserMapper.toApiCreate(formData);

    const response = await createAdminTenantUser(Number(tenantId), payload);
    
    let apiUser: any;
    if (response && typeof response === 'object' && 'data' in response) {
      apiUser = (response.data as unknown);
    } else {
      apiUser = (response as unknown);
    }
    
    return tenantUserMapper.toUi(apiUser);
  },

  async atualizarUsuario(tenantId: string, userId: string, formData: Partial<TenantUserFormData>): Promise<TenantUser> {
    const payload = tenantUserMapper.toApiUpdate(formData);

    const response = await updateAdminTenantUser(Number(tenantId), Number(userId), payload);
    
    let apiUser: any;
    if (response && typeof response === 'object' && 'data' in response) {
      apiUser = (response.data as unknown);
    } else {
      apiUser = (response as unknown);
    }
    
    return tenantUserMapper.toUi(apiUser);
  },

  async excluirUsuario(tenantId: string, userId: string): Promise<void> {
    await deleteAdminTenantUser(Number(tenantId), Number(userId));
  },

  async ativarUsuario(tenantId: string, userId: string): Promise<void> {
    await activateAdminTenantUserActivate(Number(tenantId), Number(userId));
  },

  async desativarUsuario(tenantId: string, userId: string): Promise<void> {
    await deactivateAdminTenantUserDeactivate(Number(tenantId), Number(userId));
  },
};
