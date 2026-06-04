import { Tenant as ApiTenant } from '../../../core/http/generated/models/tenant';

export interface Tenant {
  id: string;
  name: string;
  email: string;
  documento?: string;
  telefone?: string;
  status: 'active' | 'inactive';
  plano?: string;
  createdAt: string;
}

export interface TenantFormData {
  name: string;
  email: string;
  password?: string;
  confirmPassword?: string;
  documento?: string;
  telefone?: string;
  status: 'active' | 'inactive';
  plano?: string;
}
