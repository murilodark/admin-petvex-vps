export interface GlobalUser {
  id: string;
  name: string;
  email: string;
  isGlobalAdmin: boolean;
  active: boolean; // defaults to true or custom field if mapped
  createdAt: string;
  updatedAt?: string;
}

export interface GlobalUserFormData {
  name: string;
  email: string;
  password?: string;
  isGlobalAdmin: boolean;
  active?: boolean;
}

export interface GlobalUserTenantAccess {
  id: string;
  userId: string;
  tenantId: string;
  tenantName: string;
  tenantSlug: string;
  role: 'owner' | 'manager' | 'user';
  active: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface GlobalUserTenantAccessFormData {
  tenantId: string;
  role: 'owner' | 'manager' | 'user';
  active: boolean;
}

export interface ListarGlobalUsersParams {
  page?: number;
  search?: string;
  isGlobalAdmin?: string; // 'all' | 'true' | 'false'
  active?: string; // 'all' | 'true' | 'false'
  tenantId?: string; // filter by direct tenant ID
}

export interface ListarGlobalUsersResult {
  data: GlobalUser[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}
