export interface TenantUser {
  id: string;
  name: string;
  email: string;
  role?: string;
  active: boolean;
  phone?: string;
  document?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TenantUserFormData {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
  role?: string;
  active: boolean;
  phone?: string;
  document?: string;
}

export interface TenantUserFiltersData {
  search?: string;
  role?: string;
  active?: string; // "all" | "active" | "inactive"
}
