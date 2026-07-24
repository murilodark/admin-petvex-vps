import { 
  StoreAdminUserRequest, 
  UpdateAdminUserRequest 
} from '../../../core/http/generated/models/admin-users';
import { 
  StoreAdminTenantUserRequest, 
  UpdateAdminTenantUserRequest 
} from '../../../core/http/generated/models/admin-tenant-users';
import { 
  GlobalUser, 
  GlobalUserFormData, 
  GlobalUserTenantAccess, 
  GlobalUserTenantAccessFormData 
} from '../types/global-user.types';

export const globalUserMapper = {
  toUiUser(apiData: any): GlobalUser {
    return {
      id: apiData.id?.toString() || '',
      name: apiData.name || '',
      email: apiData.email || '',
      isGlobalAdmin: apiData.is_global_admin !== false,
      active: true, // index mock has true
      createdAt: apiData.created_at || new Date().toISOString(),
    };
  },

  toApiCreateUser(formData: GlobalUserFormData): StoreAdminUserRequest {
    return {
      name: formData.name,
      email: formData.email,
      password: formData.password || undefined,
    };
  },

  toApiUpdateUser(formData: Partial<GlobalUserFormData>): UpdateAdminUserRequest {
    const payload: UpdateAdminUserRequest = {};
    if (formData.name !== undefined) payload.name = formData.name;
    if (formData.email !== undefined) payload.email = formData.email;
    if (formData.password !== undefined && formData.password !== '') payload.password = formData.password;
    return payload;
  },

  toUiTenantAccess(apiData: any, userId: string): GlobalUserTenantAccess {
    const roleMap: Record<string, 'owner' | 'manager' | 'user'> = {
      owner: 'owner',
      manager: 'manager',
      user: 'user',
    };
    const roleUi = roleMap[apiData.role || 'user'] || 'user';

    return {
      id: apiData.id?.toString() || '',
      userId: userId,
      tenantId: apiData.tenant_id || '',
      tenantName: apiData.tenant_name || `Tenant #${apiData.tenant_id}`,
      tenantSlug: apiData.tenant_slug || '',
      role: roleUi,
      active: apiData.active !== false,
      createdAt: apiData.created_at || new Date().toISOString(),
      updatedAt: apiData.updated_at || undefined,
    };
  },

  toApiCreateTenantAccess(formData: GlobalUserTenantAccessFormData): StoreAdminTenantUserRequest {
    return {
      tenant_id: Number(formData.tenantId) || 0,
      user_id: 0,
      role: formData.role,
    } as any;
  },

  toApiUpdateTenantAccess(formData: Partial<GlobalUserTenantAccessFormData>): UpdateAdminTenantUserRequest {
    const payload: UpdateAdminTenantUserRequest = {};
    if (formData.role !== undefined) payload.role = formData.role;
    return payload;
  },
};
