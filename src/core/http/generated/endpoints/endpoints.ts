import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { customInstance } from '../../orval-mutator';
import { User } from '../models/user';
import { LoginCredentials } from '../models/loginCredentials';
import { LoginResponse } from '../models/loginResponse';
import { Tenant } from '../models/tenant';
import { CreateTenantPayload } from '../models/createTenantPayload';
import { UpdateTenantPayload } from '../models/updateTenantPayload';
import { GetAdminTenantsParams } from '../models/getAdminTenantsParams';
import { AdminTenantsResponse } from '../models/adminTenantsResponse';

export const postAuthLogin = (loginCredentials: LoginCredentials): Promise<LoginResponse> => {
  return customInstance<LoginResponse>({
    url: '/auth/login',
    method: 'POST',
    data: loginCredentials,
  });
};

export const postAuthLogout = (): Promise<{ message: string }> => {
  return customInstance<{ message: string }>({
    url: '/auth/logout',
    method: 'POST',
  });
};

export const getMe = (): Promise<User> => {
  return customInstance<User>({
    url: '/me',
    method: 'GET',
  });
};

export const getAdminTenants = (params?: GetAdminTenantsParams): Promise<AdminTenantsResponse> => {
  return customInstance<AdminTenantsResponse>({
    url: '/admin/tenants',
    method: 'GET',
    params,
  });
};

export const getAdminTenantsId = (id: string): Promise<Tenant> => {
  return customInstance<Tenant>({
    url: `/admin/tenants/${id}`,
    method: 'GET',
  });
};

export const postAdminTenants = (payload: CreateTenantPayload): Promise<Tenant> => {
  return customInstance<Tenant>({
    url: '/admin/tenants',
    method: 'POST',
    data: payload,
  });
};

export const putAdminTenantsId = (id: string, payload: UpdateTenantPayload): Promise<Tenant> => {
  return customInstance<Tenant>({
    url: `/admin/tenants/${id}`,
    method: 'PUT',
    data: payload,
  });
};

export const deleteAdminTenantsId = (id: string): Promise<void> => {
  return customInstance<void>({
    url: `/admin/tenants/${id}`,
    method: 'DELETE',
  });
};

export const usePostAuthLogin = (options?: Omit<UseMutationOptions<LoginResponse, Error, LoginCredentials>, 'mutationFn'>) => {
  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: postAuthLogin,
    ...options,
  });
};

export const usePostAuthLogout = (options?: Omit<UseMutationOptions<{ message: string }, Error, void>, 'mutationFn'>) => {
  return useMutation<{ message: string }, Error, void>({
    mutationFn: postAuthLogout,
    ...options,
  });
};

export const useGetMe = (options?: Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<User, Error>({
    queryKey: ['me'],
    queryFn: getMe,
    ...options,
  });
};

export const useGetAdminTenants = (
  params?: GetAdminTenantsParams,
  options?: Omit<UseQueryOptions<AdminTenantsResponse, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<AdminTenantsResponse, Error>({
    queryKey: ['adminTenants', params],
    queryFn: () => getAdminTenants(params),
    ...options,
  });
};

export const useGetAdminTenantsId = (
  id: string,
  options?: Omit<UseQueryOptions<Tenant, Error>, 'queryKey' | 'queryFn'>
) => {
  return useQuery<Tenant, Error>({
    queryKey: ['adminTenant', id],
    queryFn: () => getAdminTenantsId(id),
    ...options,
  });
};

export const usePostAdminTenants = (
  options?: Omit<UseMutationOptions<Tenant, Error, CreateTenantPayload>, 'mutationFn'>
) => {
  return useMutation<Tenant, Error, CreateTenantPayload>({
    mutationFn: postAdminTenants,
    ...options,
  });
};

export const usePutAdminTenantsId = (
  options?: Omit<UseMutationOptions<Tenant, Error, { id: string; data: UpdateTenantPayload }>, 'mutationFn'>
) => {
  return useMutation<Tenant, Error, { id: string; data: UpdateTenantPayload }>({
    mutationFn: ({ id, data }) => putAdminTenantsId(id, data),
    ...options,
  });
};

export const useDeleteAdminTenantsId = (
  options?: Omit<UseMutationOptions<void, Error, string>, 'mutationFn'>
) => {
  return useMutation<void, Error, string>({
    mutationFn: deleteAdminTenantsId,
    ...options,
  });
};

