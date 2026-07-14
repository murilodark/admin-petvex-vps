import { User as ApiUser } from '../../../core/http/generated/models/user';
import { CreateUserPayload } from '../../../core/http/generated/models/createUserPayload';
import { UpdateUserPayload } from '../../../core/http/generated/models/updateUserPayload';
import { UserTenantAccess as ApiUserTenantAccess } from '../../../core/http/generated/models/userTenantAccess';
import { CreateUserTenantAccessPayload } from '../../../core/http/generated/models/createUserTenantAccessPayload';
import { UpdateUserTenantAccessPayload } from '../../../core/http/generated/models/updateUserTenantAccessPayload';
import { 
  GlobalUser, 
  GlobalUserFormData, 
  GlobalUserTenantAccess, 
  GlobalUserTenantAccessFormData 
} from '../types/global-user.types';

export const globalUserMapper = {
  toUiUser(apiData: ApiUser): GlobalUser {
    return {
      id: apiData.id?.toString() || '',
      name: apiData.name || '',
      email: apiData.email || '',
      isGlobalAdmin: apiData.is_global_admin !== false,
      active: true, // index mock has true
      createdAt: new Date().toISOString(), // default or mock placeholder
    };
  },

  toApiCreateUser(formData: GlobalUserFormData): CreateUserPayload {
    return {
      name: formData.name,
      email: formData.email,
      password: formData.password || undefined,
      is_global_admin: formData.isGlobalAdmin,
    };
  },

  toApiUpdateUser(formData: Partial<GlobalUserFormData>): UpdateUserPayload {
    const payload: UpdateUserPayload = {};
    if (formData.name !== undefined) payload.name = formData.name;
    if (formData.email !== undefined) payload.email = formData.email;
    if (formData.password !== undefined && formData.password !== '') payload.password = formData.password;
    if (formData.isGlobalAdmin !== undefined) payload.is_global_admin = formData.isGlobalAdmin;
    return payload;
  },

  toUiTenantAccess(apiData: ApiUserTenantAccess, userId: string): GlobalUserTenantAccess {
    // Cast role as appropriate
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

  toApiCreateTenantAccess(formData: GlobalUserTenantAccessFormData): CreateUserTenantAccessPayload {
    return {
      tenant_id: formData.tenantId,
      role: formData.role,
      active: formData.active,
    };
  },

  toApiUpdateTenantAccess(formData: Partial<GlobalUserTenantAccessFormData>): UpdateUserTenantAccessPayload {
    const payload: UpdateUserTenantAccessPayload = {};
    if (formData.role !== undefined) payload.role = formData.role;
    if (formData.active !== undefined) payload.active = formData.active;
    return payload;
  },
};
