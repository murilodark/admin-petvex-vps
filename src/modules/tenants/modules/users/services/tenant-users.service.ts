import { 
  getAdminTenantsTenantUsers, 
  postAdminTenantsTenantUsers, 
  getAdminTenantsTenantUsersUser, 
  putAdminTenantsTenantUsersUser, 
  deleteAdminTenantsTenantUsersUser, 
  patchAdminTenantsTenantUsersUserActivate, 
  patchAdminTenantsTenantUsersUserDeactivate 
} from '../../../../../core/http/generated/endpoints/default/default';
import { TenantUser, TenantUserFormData } from '../types/tenant-user.types';
import { tenantUserMapper } from '../mappers/tenant-user.mapper';

const getLocalStorageKey = (tenantId: string) => `petvex_tenant_users_db_${tenantId}`;

const getStoredTenantUsers = (tenantId: string): TenantUser[] => {
  const key = getLocalStorageKey(tenantId);
  const data = localStorage.getItem(key);
  if (!data) {
    const initialUsers: TenantUser[] = [
      {
        id: '1',
        name: 'Rodrigo Mendonça',
        email: 'rodrigo@petvex.com.br',
        role: 'admin',
        active: true,
        phone: '(11) 98888-2222',
        document: '111.222.333-44',
        createdAt: '2026-02-14T09:00:00.000Z',
      },
      {
        id: '2',
        name: 'Beatriz Almeida',
        email: 'beatriz.almeida@gmail.com',
        role: 'manager',
        active: true,
        phone: '(11) 97777-3333',
        document: '222.333.444-55',
        createdAt: '2026-03-10T11:20:00.000Z',
      },
      {
        id: '3',
        name: 'José Silva (Inativo)',
        email: 'jose.silva@outlook.com',
        role: 'user',
        active: false,
        phone: '(11) 96666-4444',
        document: '333.444.555-66',
        createdAt: '2026-04-01T15:00:00.000Z',
      },
    ];
    localStorage.setItem(key, JSON.stringify(initialUsers));
    return initialUsers;
  }
  return JSON.parse(data);
};

const saveStoredTenantUsers = (tenantId: string, users: TenantUser[]) => {
  localStorage.setItem(getLocalStorageKey(tenantId), JSON.stringify(users));
};

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
    try {
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

      const response = await getAdminTenantsTenantUsers(tenantId, cleanParams);

      return {
        data: response.data.map(tenantUserMapper.toUi),
        total: response.total,
        page: response.page,
        perPage: response.perPage,
        lastPage: response.lastPage,
      };
    } catch (e) {
      console.warn(`API error listing tenant #${tenantId} users, using local fallback:`, e);

      let list = getStoredTenantUsers(tenantId);

      // Filtering criteria
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        list = list.filter((u) => 
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          (u.phone && u.phone.includes(searchLower)) ||
          (u.document && u.document.includes(searchLower))
        );
      }

      if (params.active && params.active !== 'all') {
        const isActive = params.active === 'active';
        list = list.filter((u) => u.active === isActive);
      }

      if (params.role && params.role !== 'all') {
        list = list.filter((u) => u.role === params.role);
      }

      const total = list.length;
      const page = params.page || 1;
      const responsePerPage = 5; // Default page size for local testing
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

  async buscarUsuarioPorId(tenantId: string, userId: string): Promise<TenantUser> {
    try {
      const response = await getAdminTenantsTenantUsersUser(tenantId, userId);
      return tenantUserMapper.toUi(response);
    } catch (e) {
      console.warn(`API error getting user #${userId} from tenant #${tenantId}, using local fallback:`, e);
      const list = getStoredTenantUsers(tenantId);
      const found = list.find((u) => u.id === userId);
      if (!found) {
        throw new Error('Usuário não encontrado.');
      }
      return found;
    }
  },

  async cadastrarUsuario(tenantId: string, formData: TenantUserFormData): Promise<TenantUser> {
    const list = getStoredTenantUsers(tenantId);
    if (list.some((u) => u.email.toLowerCase() === formData.email.toLowerCase())) {
      const apiError: any = new Error('The given data was invalid.');
      apiError.response = {
        status: 422,
        data: {
          message: 'Erro: E-mail em uso.',
          errors: {
            email: ['Este e-mail já está em uso por outro usuário deste tenant.'],
          }
        }
      };
      throw apiError;
    }

    const payload = tenantUserMapper.toApiCreate(formData);

    try {
      const response = await postAdminTenantsTenantUsers(tenantId, payload);
      const mapped = tenantUserMapper.toUi(response);
      
      saveStoredTenantUsers(tenantId, [mapped, ...list]);
      return mapped;
    } catch (e: any) {
      if (e && (e.name === 'ApiError' || e.status || e.response)) {
        throw e;
      }
      console.warn(`API error creating user for tenant #${tenantId}, simulating response locally:`, e);
      const mockUserApi = {
        id: Math.floor(Math.random() * 1000000).toString(),
        name: payload.name,
        email: payload.email,
        role: payload.role || 'user',
        active: payload.active !== false,
        phone: payload.phone || '',
        document: payload.document || '',
        created_at: new Date().toISOString(),
      };

      const newUser = tenantUserMapper.toUi(mockUserApi);
      saveStoredTenantUsers(tenantId, [newUser, ...list]);
      return newUser;
    }
  },

  async atualizarUsuario(tenantId: string, userId: string, formData: Partial<TenantUserFormData>): Promise<TenantUser> {
    const list = getStoredTenantUsers(tenantId);
    const index = list.findIndex((u) => u.id === userId);
    if (index === -1) {
      throw new Error('Usuário não encontrado.');
    }

    if (formData.email) {
      const emailConflict = list.some((u) => u.id !== userId && u.email.toLowerCase() === formData.email!.toLowerCase());
      if (emailConflict) {
        const apiError: any = new Error('The given data was invalid.');
        apiError.response = {
          status: 422,
          data: {
            message: 'Erro: E-mail indisponível.',
            errors: {
              email: ['Este endereço de e-mail já está em uso por outro usuário.'],
            }
          }
        };
        throw apiError;
      }
    }

    const payload = tenantUserMapper.toApiUpdate(formData);

    try {
      const response = await putAdminTenantsTenantUsersUser(tenantId, userId, payload);
      const mapped = tenantUserMapper.toUi(response);
      
      list[index] = mapped;
      saveStoredTenantUsers(tenantId, list);
      return mapped;
    } catch (e: any) {
      if (e && (e.name === 'ApiError' || e.status || e.response)) {
        throw e;
      }
      console.warn(`API error updating user #${userId} for tenant #${tenantId}, patching locally:`, e);
      
      const current = list[index];
      const updated: TenantUser = {
        ...current,
        name: formData.name ?? current.name,
        email: formData.email ?? current.email,
        role: formData.role ?? current.role,
        active: formData.active ?? current.active,
        phone: formData.phone ?? current.phone,
        document: formData.document ?? current.document,
      };

      list[index] = updated;
      saveStoredTenantUsers(tenantId, list);
      return updated;
    }
  },

  async excluirUsuario(tenantId: string, userId: string): Promise<void> {
    try {
      await deleteAdminTenantsTenantUsersUser(tenantId, userId);
    } catch (e) {
      console.warn(`API error deleting user #${userId} from tenant #${tenantId}, running locally:`, e);
    } finally {
      const list = getStoredTenantUsers(tenantId);
      const filtered = list.filter((u) => u.id !== userId);
      saveStoredTenantUsers(tenantId, filtered);
    }
  },

  async ativarUsuario(tenantId: string, userId: string): Promise<void> {
    try {
      await patchAdminTenantsTenantUsersUserActivate(tenantId, userId);
    } catch (e) {
      console.warn(`API error activating user #${userId} from tenant #${tenantId}, running locally:`, e);
    } finally {
      const list = getStoredTenantUsers(tenantId);
      const index = list.findIndex((u) => u.id === userId);
      if (index !== -1) {
        list[index].active = true;
        saveStoredTenantUsers(tenantId, list);
      }
    }
  },

  async desativarUsuario(tenantId: string, userId: string): Promise<void> {
    try {
      await patchAdminTenantsTenantUsersUserDeactivate(tenantId, userId);
    } catch (e) {
      console.warn(`API error deactivating user #${userId} from tenant #${tenantId}, running locally:`, e);
    } finally {
      const list = getStoredTenantUsers(tenantId);
      const index = list.findIndex((u) => u.id === userId);
      if (index !== -1) {
        list[index].active = false;
        saveStoredTenantUsers(tenantId, list);
      }
    }
  },
};
