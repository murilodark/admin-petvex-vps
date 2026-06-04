import { Tenant, TenantFormData } from '../types/tenant.types';
import { CreateTenantPayload } from '../../../core/http/generated/models/createTenantPayload';
import { UpdateTenantPayload } from '../../../core/http/generated/models/updateTenantPayload';
import { Tenant as ApiTenant } from '../../../core/http/generated/models/tenant';

export const tenantMapper = {
  toApiCreate(formData: TenantFormData): CreateTenantPayload {
    return {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      documento: formData.documento || undefined,
      telefone: formData.telefone || undefined,
      status: formData.status,
      plano: formData.plano || undefined,
    };
  },

  toApiUpdate(formData: Partial<TenantFormData>): UpdateTenantPayload {
    return {
      name: formData.name,
      email: formData.email,
      documento: formData.documento || undefined,
      telefone: formData.telefone || undefined,
      status: formData.status,
      plano: formData.plano || undefined,
    };
  },

  toUi(apiData: ApiTenant): Tenant {
    return {
      id: apiData.id?.toString() || '',
      name: apiData.name || '',
      email: apiData.email || '',
      documento: apiData.documento || '',
      telefone: apiData.telefone || '',
      status: apiData.status === 'inactive' ? 'inactive' : 'active',
      plano: apiData.plano || 'Starter',
      createdAt: apiData.created_at || new Date().toISOString(),
    };
  }
};
