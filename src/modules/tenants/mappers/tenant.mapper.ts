import { Tenant, TenantFormData } from '../types/tenant.types';
import { 
  StoreAdminTenantRequest, 
  UpdateAdminTenantRequest 
} from '../../../core/http/generated/models/admin-tenants';

export const tenantMapper = {
  toApiCreate(formData: TenantFormData): StoreAdminTenantRequest {
    return {
      name: formData.name,
      slug: (formData as any).slug || formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      document: formData.documento || undefined,
    };
  },

  toApiUpdate(formData: Partial<TenantFormData>): UpdateAdminTenantRequest {
    return {
      name: formData.name,
      document: formData.documento || undefined,
    };
  },

  toUi(apiData: any): Tenant {
    return {
      id: apiData.id?.toString() || '',
      name: apiData.name || '',
      email: apiData.email || '',
      documento: apiData.document || apiData.documento || '',
      telefone: apiData.telefone || '',
      status: apiData.status === 'inactive' ? 'inactive' : 'active',
      plano: apiData.plano || 'Starter',
      createdAt: apiData.created_at || new Date().toISOString(),
    };
  }
};
