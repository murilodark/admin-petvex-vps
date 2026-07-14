import {
  createAdminUser,
  deleteAdminUser,
  getAdminUser,
  listAdminUsers,
  updateAdminUser,
} from '../../../core/http/generated/endpoints/admin-users/admin-users';
import { 
  GlobalUser, 
  GlobalUserFormData, 
  GlobalUserTenantAccess, 
  GlobalUserTenantAccessFormData,
  ListarGlobalUsersParams,
  ListarGlobalUsersResult
} from '../types/global-user.types';
import { globalUserMapper } from '../mappers/global-user.mapper';

const USERS_DB_KEY = 'petvex_global_users_db';
const getTenantsDbKey = (userId: string) => `petvex_global_users_tenants_db_${userId}`;

const getStoredGlobalUsers = (): GlobalUser[] => {
  const data = localStorage.getItem(USERS_DB_KEY);
  if (!data) {
    const initialUsers: GlobalUser[] = [
      {
        id: '1',
        name: 'Administrador Principal',
        email: 'admin@petvex.com.br',
        isGlobalAdmin: true,
        active: true,
        createdAt: '2026-01-10T10:00:00.000Z',
      },
      {
        id: '2',
        name: 'Suporte Técnico',
        email: 'suporte@petvex.com.br',
        isGlobalAdmin: true,
        active: true,
        createdAt: '2026-02-15T14:30:00.000Z',
      },
      {
        id: '3',
        name: 'Ana Clara',
        email: 'ana@petvex.com.br',
        isGlobalAdmin: false,
        active: true,
        createdAt: '2026-03-20T09:15:00.000Z',
      },
      {
        id: '4',
        name: 'Bruno Carvalho',
        email: 'bruno@petvex.com.br',
        isGlobalAdmin: false,
        active: false,
        createdAt: '2026-04-05T11:00:00.000Z',
      }
    ];
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(initialUsers));
    return initialUsers;
  }
  return JSON.parse(data);
};

const saveStoredGlobalUsers = (users: GlobalUser[]) => {
  localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
};

const getStoredTenantAccess = (userId: string): GlobalUserTenantAccess[] => {
  const key = getTenantsDbKey(userId);
  const data = localStorage.getItem(key);
  if (!data) {
    let initialAccess: GlobalUserTenantAccess[] = [];
    if (userId === '1') {
      initialAccess = [
        {
          id: 'access_1_1',
          userId: '1',
          tenantId: '1',
          tenantName: 'Clínica Veterinária Silva',
          tenantSlug: 'clinica-silva',
          role: 'owner',
          active: true,
          createdAt: '2026-01-11T12:00:00.000Z',
        }
      ];
    } else if (userId === '2') {
      initialAccess = [
        {
          id: 'access_2_1',
          userId: '2',
          tenantId: '1',
          tenantName: 'Clínica Veterinária Silva',
          tenantSlug: 'clinica-silva',
          role: 'manager',
          active: true,
          createdAt: '2026-02-16T15:00:00.000Z',
        },
        {
          id: 'access_2_2',
          userId: '2',
          tenantId: '2',
          tenantName: 'Hospital Pet Premium',
          tenantSlug: 'pet-premium',
          role: 'manager',
          active: true,
          createdAt: '2026-02-20T10:00:00.000Z',
        }
      ];
    } else if (userId === '3') {
      initialAccess = [
        {
          id: 'access_3_1',
          userId: '3',
          tenantId: '2',
          tenantName: 'Hospital Pet Premium',
          tenantSlug: 'pet-premium',
          role: 'user',
          active: true,
          createdAt: '2026-03-21T09:30:00.000Z',
        }
      ];
    } else if (userId === '4') {
      initialAccess = [
        {
          id: 'access_4_1',
          userId: '4',
          tenantId: '1',
          tenantName: 'Clínica Veterinária Silva',
          tenantSlug: 'clinica-silva',
          role: 'user',
          active: false,
          createdAt: '2026-04-06T11:30:00.000Z',
        }
      ];
    }
    localStorage.setItem(key, JSON.stringify(initialAccess));
    return initialAccess;
  }
  return JSON.parse(data);
};

const saveStoredTenantAccess = (userId: string, access: GlobalUserTenantAccess[]) => {
  localStorage.setItem(getTenantsDbKey(userId), JSON.stringify(access));
};

export const globalUsersService = {
  async listarUsuarios(params: ListarGlobalUsersParams = {}): Promise<ListarGlobalUsersResult> {
    try {
      // Build clean parameters for the OpenAPI request
      const rawParams = {
        page: params.page || 1,
        perPage: 5,
        search: params.search || undefined,
        is_global_admin: params.isGlobalAdmin === 'true' ? true : params.isGlobalAdmin === 'false' ? false : undefined,
        active: params.active === 'true' ? true : params.active === 'false' ? false : undefined,
        tenant_id: params.tenantId || undefined,
      };

      const cleanParams = Object.fromEntries(
        Object.entries(rawParams).filter(([, value]) => value !== undefined && value !== null && value !== '')
      );

      const response = (await listAdminUsers(cleanParams)) as any;
      const rows = Array.isArray(response?.data) ? response.data : [];
      const meta = response?.meta && typeof response.meta === 'object' ? response.meta : undefined;

      return {
        data: rows.map((u: any) => globalUserMapper.toUiUser(u)),
        total: Number(meta?.total ?? rows.length),
        page: Number(meta?.current_page ?? params.page ?? 1),
        perPage: Number(meta?.per_page ?? 5),
        lastPage: Number(meta?.last_page ?? 1),
      };
    } catch (e) {
      console.warn('API error listing global users, using local fallback:', e);
      let list = getStoredGlobalUsers();

      // Apply Search Filter
      if (params.search) {
        const searchLower = params.search.toLowerCase();
        list = list.filter(u => 
          u.name.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower)
        );
      }

      // Apply Global Admin Status Filter
      if (params.isGlobalAdmin && params.isGlobalAdmin !== 'all') {
        const isAdmin = params.isGlobalAdmin === 'true';
        list = list.filter(u => u.isGlobalAdmin === isAdmin);
      }

      // Apply Active Status Filter
      if (params.active && params.active !== 'all') {
        const isActive = params.active === 'true';
        list = list.filter(u => u.active === isActive);
      }

      // Apply Tenant Filter if provided
      if (params.tenantId) {
        list = list.filter(u => {
          const tenantAccess = getStoredTenantAccess(u.id);
          return tenantAccess.some(a => a.tenantId === params.tenantId);
        });
      }

      const total = list.length;
      const page = params.page || 1;
      const perPage = 5;
      const lastPage = Math.ceil(total / perPage) || 1;
      const startIndex = (page - 1) * perPage;
      const paginatedItems = list.slice(startIndex, startIndex + perPage);

      return {
        data: paginatedItems,
        total,
        page,
        perPage,
        lastPage,
      };
    }
  },

  async buscarUsuarioPorId(userId: string): Promise<GlobalUser> {
    try {
      const response = await getAdminUser(Number(userId));
      return globalUserMapper.toUiUser((response as any)?.data ?? response);
    } catch (e) {
      console.warn(`API error details for global user ${userId}, using local fallback:`, e);
      const list = getStoredGlobalUsers();
      const found = list.find(u => u.id === userId);
      if (!found) {
        throw new Error('Usuário global não encontrado no sistema.');
      }
      return found;
    }
  },

  async cadastrarUsuario(formData: GlobalUserFormData): Promise<GlobalUser> {
    const list = getStoredGlobalUsers();
    
    // Validate unique email (local validation checks email duplication)
    if (list.some(u => u.email.toLowerCase() === formData.email.toLowerCase())) {
      const apiError: any = new Error('The given data was invalid.');
      apiError.response = {
        status: 422,
        data: {
          message: 'Erro: E-mail em uso.',
          errors: {
            email: ['Este endereço de e-mail já está cadastrado no sistema principal.'],
          }
        }
      };
      throw apiError;
    }

    const payload = globalUserMapper.toApiCreateUser(formData);

    try {
      const response = await createAdminUser(payload as any);
      const mapped = globalUserMapper.toUiUser((response as any)?.data ?? response);
      saveStoredGlobalUsers([mapped, ...list]);
      return mapped;
    } catch (e: any) {
      if (e && (e.name === 'ApiError' || e.status || e.response)) {
        throw e;
      }
      console.warn('API error registering global user, simulating locally:', e);
      const newId = Math.floor(Math.random() * 1000000).toString();
      const mapped: GlobalUser = {
        id: newId,
        name: payload.name || '',
        email: payload.email || '',
        isGlobalAdmin: payload.is_global_admin || false,
        active: formData.active !== false,
        createdAt: new Date().toISOString(),
      };
      saveStoredGlobalUsers([mapped, ...list]);
      return mapped;
    }
  },

  async atualizarUsuario(userId: string, formData: Partial<GlobalUserFormData>, loggedInUserId?: string): Promise<GlobalUser> {
    const list = getStoredGlobalUsers();
    const foundUserIndex = list.findIndex(u => u.id === userId);

    if (foundUserIndex === -1) {
      throw new Error('Usuário global não localizado.');
    }

    const targetUser = list[foundUserIndex];

    // RULE: Prevent removing the last active global admin
    if (targetUser.isGlobalAdmin && formData.isGlobalAdmin === false) {
      const activeAdmins = list.filter(u => u.isGlobalAdmin && u.active);
      if (activeAdmins.length <= 1 && (activeAdmins[0]?.id === userId)) {
        throw new Error('Não é possível remover o último administrador global cadastrado no sistema.');
      }
    }

    // RULE: Prevent self de-admining or deactivating yourself
    if (userId === loggedInUserId) {
      if (formData.isGlobalAdmin === false) {
        throw new Error('Você não pode revogar seus próprios privilégios de Administrador Global.');
      }
      if (formData.active === false) {
        throw new Error('Você não pode desativar seu próprio usuário.');
      }
    }

    // Email duplication check
    if (formData.email && list.some(u => u.id !== userId && u.email.toLowerCase() === formData.email!.toLowerCase())) {
      const apiError: any = new Error('The given data was invalid.');
      apiError.response = {
        status: 422,
        data: {
          message: 'Erro: E-mail em uso.',
          errors: {
            email: ['Este e-mail está associado a outro usuário diferente.'],
          }
        }
      };
      throw apiError;
    }

    const payload = globalUserMapper.toApiUpdateUser(formData);

    try {
      const response = await updateAdminUser(Number(userId), payload as any);
      const mapped = globalUserMapper.toUiUser((response as any)?.data ?? response);
      
      const updatedList = [...list];
      updatedList[foundUserIndex] = { ...targetUser, ...mapped };
      saveStoredGlobalUsers(updatedList);
      return updatedList[foundUserIndex];
    } catch (e: any) {
      if (e && (e.name === 'ApiError' || e.status || e.response)) {
        throw e;
      }
      console.warn(`API error editing global user ${userId}, applying modifications locally:`, e);
      const updatedList = [...list];
      const updatedUser: GlobalUser = {
        ...targetUser,
        name: formData.name !== undefined ? formData.name : targetUser.name,
        email: formData.email !== undefined ? formData.email : targetUser.email,
        isGlobalAdmin: formData.isGlobalAdmin !== undefined ? formData.isGlobalAdmin : targetUser.isGlobalAdmin,
        active: formData.active !== undefined ? formData.active : targetUser.active,
        updatedAt: new Date().toISOString(),
      };
      updatedList[foundUserIndex] = updatedUser;
      saveStoredGlobalUsers(updatedList);
      return updatedUser;
    }
  },

  async excluirUsuario(userId: string, loggedInUserId?: string): Promise<void> {
    const list = getStoredGlobalUsers();
    const foundUser = list.find(u => u.id === userId);

    if (!foundUser) {
      throw new Error('Usuário global não encontrado para exclusão.');
    }

    // RULE: Guard against deleting oneself
    if (userId === loggedInUserId) {
      throw new Error('Você não pode excluir seu próprio usuário.');
    }

    // RULE: Prevent removing the last active global admin
    if (foundUser.isGlobalAdmin) {
      const activeAdmins = list.filter(u => u.isGlobalAdmin && u.active);
      if (activeAdmins.length <= 1) {
        throw new Error('Não é possível remover o último administrador global cadastrado no sistema.');
      }
    }

    try {
      await deleteAdminUser(Number(userId));
      const updated = list.filter(u => u.id !== userId);
      saveStoredGlobalUsers(updated);
      localStorage.removeItem(getTenantsDbKey(userId)); // clear tenants links database as well
    } catch (e) {
      console.warn(`API error deleting user ${userId}, executing fallback local removal:`, e);
      const updated = list.filter(u => u.id !== userId);
      saveStoredGlobalUsers(updated);
      localStorage.removeItem(getTenantsDbKey(userId));
    }
  },

  // VENUL VINCLES WITH TENANTS
  async listarVinculosTenants(userId: string): Promise<GlobalUserTenantAccess[]> {
    try {
      return getStoredTenantAccess(userId);
    } catch (e) {
      console.warn(`API error getting tenant accesses for global user ${userId}, falling back to storage:`, e);
      return getStoredTenantAccess(userId);
    }
  },

  async vincularTenant(userId: string, formData: GlobalUserTenantAccessFormData): Promise<GlobalUserTenantAccess> {
    const accesses = getStoredTenantAccess(userId);

    // Guard duplicate link
    if (accesses.some(v => v.tenantId === formData.tenantId)) {
      throw new Error('Este usuário já possui vínculo cadastrado neste tenant.');
    }

    const payload = globalUserMapper.toApiCreateTenantAccess(formData);

    try {
      const response = await createAdminUser(payload as any);
      const mapped = globalUserMapper.toUiTenantAccess((response as any)?.data ?? response, userId);
      saveStoredTenantAccess(userId, [mapped, ...accesses]);
      return mapped;
    } catch (e: any) {
      if (e && (e.name === 'ApiError' || e.status || e.response)) {
        throw e;
      }
      console.warn(`API error creating tenant access for global user ${userId}, creating fallback link:`, e);
      
      // Simulate tenant details lookup if possible
      let tenantName = `Tenant #${formData.tenantId}`;
      let tenantSlug = `tenant-slug-${formData.tenantId}`;
      
      // Attempt to load from localStorage database of tenants
      const tenantsData = localStorage.getItem('petvex_tenants_db');
      if (tenantsData) {
        const parsedTenants = JSON.parse(tenantsData);
        const related = parsedTenants.find((t: any) => t.id === formData.tenantId || t.name === formData.tenantId);
        if (related) {
          tenantName = related.name;
          tenantSlug = related.documento?.replace(/[^\w]/g, '').toLowerCase() || 'petvex';
        }
      }

      const mapped: GlobalUserTenantAccess = {
        id: `access_${userId}_${formData.tenantId}`,
        userId,
        tenantId: formData.tenantId,
        tenantName,
        tenantSlug,
        role: formData.role,
        active: formData.active !== false,
        createdAt: new Date().toISOString(),
      };

      saveStoredTenantAccess(userId, [mapped, ...accesses]);
      return mapped;
    }
  },

  async atualizarVinculoTenant(userId: string, tenantId: string, formData: Partial<GlobalUserTenantAccessFormData>): Promise<GlobalUserTenantAccess> {
    const accesses = getStoredTenantAccess(userId);
    const index = accesses.findIndex(v => v.tenantId === tenantId);

    if (index === -1) {
      throw new Error('Vínculo de tenant não encontrado para este usuário.');
    }

    const targetAccess = accesses[index];
    const payload = globalUserMapper.toApiUpdateTenantAccess(formData);

    try {
      const response = await updateAdminUser(Number(userId), payload as any);
      const mapped = globalUserMapper.toUiTenantAccess((response as any)?.data ?? response, userId);
      
      const updated = [...accesses];
      updated[index] = { ...targetAccess, ...mapped };
      saveStoredTenantAccess(userId, updated);
      return updated[index];
    } catch (e: any) {
      if (e && (e.name === 'ApiError' || e.status || e.response)) {
        throw e;
      }
      console.warn(`API error updating tenant access for user ${userId} and tenant ${tenantId}, editing locally:`, e);
      const updated = [...accesses];
      updated[index] = {
        ...targetAccess,
        role: formData.role !== undefined ? formData.role : targetAccess.role,
        active: formData.active !== undefined ? formData.active : targetAccess.active,
        updatedAt: new Date().toISOString(),
      };
      saveStoredTenantAccess(userId, updated);
      return updated[index];
    }
  },

  async desvincularTenant(userId: string, tenantId: string): Promise<void> {
    const accesses = getStoredTenantAccess(userId);
    const index = accesses.findIndex(v => v.tenantId === tenantId);

    if (index === -1) {
      throw new Error('O vínculo do tenant não existe neste usuário.');
    }

    try {
      await deleteAdminUser(Number(userId));
      const updated = accesses.filter(v => v.tenantId !== tenantId);
      saveStoredTenantAccess(userId, updated);
    } catch (e) {
      console.warn(`API error deleting tenant access link for user ${userId}, applying local deletion:`, e);
      const updated = accesses.filter(v => v.tenantId !== tenantId);
      saveStoredTenantAccess(userId, updated);
    }
  },
};
