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
