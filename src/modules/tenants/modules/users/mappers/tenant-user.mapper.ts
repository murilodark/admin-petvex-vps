import { 
  StoreAdminTenantUserRequest, 
  UpdateAdminTenantUserRequest 
} from '../../../../../core/http/generated/models/admin-tenant-users';
import { TenantUser, TenantUserFormData } from '../types/tenant-user.types';

export const tenantUserMapper = {
  toApiCreate(formData: TenantUserFormData): StoreAdminTenantUserRequest {
    return {
      user_id: 0,
      role: formData.role || undefined,
    } as any;
  },

  toApiUpdate(formData: Partial<TenantUserFormData>): UpdateAdminTenantUserRequest {
    const payload: UpdateAdminTenantUserRequest = {
      role: formData.role || undefined,
    };
    return payload;
  },

  toUi(apiData: any): TenantUser {
    return {
      id: apiData.id?.toString() || '',
      name: apiData.name || '',
      email: apiData.email || '',
      role: apiData.role || 'user',
      active: apiData.active !== false,
      phone: apiData.phone || '',
      document: apiData.document || '',
      createdAt: apiData.created_at || new Date().toISOString(),
      updatedAt: apiData.updated_at || undefined,
    };
  },
};
