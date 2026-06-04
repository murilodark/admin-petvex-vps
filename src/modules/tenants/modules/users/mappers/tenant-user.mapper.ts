import { TenantUser as ApiTenantUser } from '../../../../../core/http/generated/models/tenantUser';
import { CreateTenantUserPayload } from '../../../../../core/http/generated/models/createTenantUserPayload';
import { UpdateTenantUserPayload } from '../../../../../core/http/generated/models/updateTenantUserPayload';
import { TenantUser, TenantUserFormData } from '../types/tenant-user.types';

export const tenantUserMapper = {
  toApiCreate(formData: TenantUserFormData): CreateTenantUserPayload {
    return {
      name: formData.name,
      email: formData.email,
      password: formData.password || undefined,
      password_confirmation: formData.password_confirmation || undefined,
      role: formData.role || undefined,
      active: formData.active,
      phone: formData.phone || undefined,
      document: formData.document || undefined,
    };
  },

  toApiUpdate(formData: Partial<TenantUserFormData>): UpdateTenantUserPayload {
    const payload: UpdateTenantUserPayload = {
      name: formData.name,
      email: formData.email,
      role: formData.role || undefined,
      active: formData.active,
      phone: formData.phone || undefined,
      document: formData.document || undefined,
    };
    if (formData.password) {
      payload.password = formData.password;
    }
    if (formData.password_confirmation) {
      payload.password_confirmation = formData.password_confirmation;
    }
    return payload;
  },

  toUi(apiData: ApiTenantUser): TenantUser {
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
