import { useQuery, useMutation, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { customInstance } from '../../orval-mutator';
import {
  loginAdminAuth,
  logoutAdminAuth,
  meAdminAuth,
} from './admin-auth/admin-auth';
import { AdminLoginRequest } from '../models/adminLoginRequest';
import { LoginAdminAuth200 } from '../models/loginAdminAuth200';
import { LoginAdminAuth200Data } from '../models/loginAdminAuth200Data';
import { LogoutAdminAuth200 } from '../models/logoutAdminAuth200';
import { MeAdminAuth200 } from '../models/meAdminAuth200';
import { PlatformAdminUser } from '../models/platformAdminUser';
import { Tenant } from '../models/tenant';
import { CreateTenantPayload } from '../models/createTenantPayload';
import { UpdateTenantPayload } from '../models/updateTenantPayload';
import { GetAdminTenantsParams } from '../models/getAdminTenantsParams';
import { AdminTenantsResponse } from '../models/adminTenantsResponse';

function resolveLoginData(
  response: LoginAdminAuth200 | LoginAdminAuth200Data,
): LoginAdminAuth200Data {
  return 'token' in response ? response : response.data;
}

function resolveLogoutData(response: LogoutAdminAuth200 | boolean): boolean {
  return typeof response === 'boolean' ? response : response.data;
}

function resolveAdminUser(response: MeAdminAuth200 | PlatformAdminUser): PlatformAdminUser {
  return 'data' in response ? response.data : response;
}

export const postAuthLogin = async (adminLoginRequest: AdminLoginRequest): Promise<LoginAdminAuth200Data> => {
  const response = await loginAdminAuth(adminLoginRequest);
  return resolveLoginData(response);
};

export const postAuthLogout = async (): Promise<boolean> => {
  const response = await logoutAdminAuth();
  return resolveLogoutData(response);
};

export const getMe = async (): Promise<PlatformAdminUser> => {
  const response = await meAdminAuth();
  return resolveAdminUser(response);
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

export const usePostAuthLogin = (options?: Omit<UseMutationOptions<LoginAdminAuth200Data, Error, AdminLoginRequest>, 'mutationFn'>) => {
  return useMutation<LoginAdminAuth200Data, Error, AdminLoginRequest>({
    mutationFn: postAuthLogin,
    ...options,
  });
};

export const usePostAuthLogout = (options?: Omit<UseMutationOptions<boolean, Error, void>, 'mutationFn'>) => {
  return useMutation<boolean, Error, void>({
    mutationFn: postAuthLogout,
    ...options,
  });
};

export const useGetMe = (options?: Omit<UseQueryOptions<PlatformAdminUser, Error>, 'queryKey' | 'queryFn'>) => {
  return useQuery<PlatformAdminUser, Error>({
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
