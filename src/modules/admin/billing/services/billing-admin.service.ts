import {
  getAdminBillingInvoices,
  getAdminBillingInvoicesId,
  getAdminBillingPayments,
  getAdminBillingPaymentsId,
  getAdminBillingSubscriptions,
  getAdminBillingSubscriptionsId,
  patchAdminBillingSubscriptionsIdCancel,
  patchAdminBillingSubscriptionsIdReactivate,
  patchAdminBillingSubscriptionsIdSuspend,
  postAdminBillingPaymentsIdSync,
} from '../../../../core/http/generated/endpoints/default/default';
import { billingAdminMapper } from '../mappers/billing-admin.mapper';
import {
  AdminInvoice,
  AdminPayment,
  AdminSubscription,
  BillingActionResponse,
  ListarInvoicesParams,
  ListarInvoicesResult,
  ListarPaymentsParams,
  ListarPaymentsResult,
  ListarSubscriptionsParams,
  ListarSubscriptionsResult,
} from '../types/billing-admin.types';

type ApiRecord = Record<string, unknown>;

interface NormalizedList<T> {
  data: T[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

type QueryParams = Record<string, string | number | boolean>;

const isRecord = (value: unknown): value is ApiRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const toNumber = (value: unknown, fallback: number): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const getNestedRecord = (value: unknown, key: string): ApiRecord | undefined => {
  if (!isRecord(value)) return undefined;
  return isRecord(value[key]) ? value[key] : undefined;
};

const getNestedArray = (value: unknown, key: string): unknown[] | undefined => {
  if (!isRecord(value)) return undefined;
  return Array.isArray(value[key]) ? value[key] : undefined;
};

const normalizeQueryParams = (params: Record<string, unknown>): QueryParams => {
  const cleanParams: QueryParams = {};

  Object.entries(params).forEach(([key, value]) => {
    if (key === 'perPage') return;
    if (value === undefined || value === null || value === '' || value === 'all') return;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      cleanParams[key] = value;
    }
  });

  return cleanParams;
};

const normalizeListResponse = <T>(
  response: unknown,
  mapper: (item: unknown) => T,
): NormalizedList<T> => {
  const root = isRecord(response) ? response : {};
  const nestedData = getNestedRecord(root.data, 'data');
  const meta = getNestedRecord(root, 'meta') ?? getNestedRecord(root.data, 'meta');
  const paginationSource = nestedData ?? (isRecord(root.data) ? root.data : root);

  const items =
    Array.isArray(response)
      ? response
      : getNestedArray(root, 'data') ??
        getNestedArray(root.data, 'data') ??
        [];

  const data = items.map(mapper);
  const total = toNumber(paginationSource.total ?? meta?.total, data.length);
  const page = toNumber(
    paginationSource.page ?? paginationSource.current_page ?? meta?.current_page,
    1,
  );
  const perPage = toNumber(
    paginationSource.perPage ?? paginationSource.per_page ?? meta?.per_page,
    data.length || 10,
  );
  const lastPage = toNumber(
    paginationSource.lastPage ?? paginationSource.last_page ?? meta?.last_page,
    Math.max(1, Math.ceil(total / (perPage || 10))),
  );

  return {
    data,
    total,
    page,
    perPage,
    lastPage,
  };
};

const normalizeSingleResponse = <T>(
  response: unknown,
  mapper: (item: unknown) => T,
): T => {
  if (Array.isArray(response)) return mapper(response[0]);

  if (isRecord(response)) {
    if (Array.isArray(response.data)) return mapper(response.data[0]);
    if (isRecord(response.data)) return mapper(response.data);
  }

  return mapper(response);
};

const normalizeActionResponse = (
  response: unknown,
  fallbackMessage: string,
): BillingActionResponse => {
  if (isRecord(response)) {
    return {
      status: response.status === undefined ? true : Boolean(response.status),
      message: typeof response.message === 'string' ? response.message : fallbackMessage,
    };
  }

  return {
    status: true,
    message: fallbackMessage,
  };
};

export const billingAdminService = {
  async listarSubscriptions(params: ListarSubscriptionsParams = {}): Promise<ListarSubscriptionsResult> {
    const response = await getAdminBillingSubscriptions(normalizeQueryParams(params));
    return normalizeListResponse<AdminSubscription>(
      response,
      billingAdminMapper.normalizeSubscription,
    );
  },

  async buscarSubscriptionPorId(id: string): Promise<AdminSubscription> {
    const response = await getAdminBillingSubscriptionsId(id);
    return normalizeSingleResponse<AdminSubscription>(
      response,
      billingAdminMapper.normalizeSubscription,
    );
  },

  async suspenderSubscription(id: string, reason?: string): Promise<BillingActionResponse> {
    const response = await patchAdminBillingSubscriptionsIdSuspend(
      id,
      reason ? { reason } : undefined,
    );

    return normalizeActionResponse(
      response,
      'Assinatura suspensa administrativamente com sucesso.',
    );
  },

  async reativarSubscription(id: string): Promise<BillingActionResponse> {
    const response = await patchAdminBillingSubscriptionsIdReactivate(id);

    return normalizeActionResponse(
      response,
      'Assinatura reativada com sucesso.',
    );
  },

  async cancelarSubscription(id: string, reason?: string): Promise<BillingActionResponse> {
    const response = await patchAdminBillingSubscriptionsIdCancel(
      id,
      reason ? { reason } : undefined,
    );

    return normalizeActionResponse(
      response,
      'Assinatura cancelada administrativamente com sucesso.',
    );
  },

  async listarPayments(params: ListarPaymentsParams = {}): Promise<ListarPaymentsResult> {
    const response = await getAdminBillingPayments(normalizeQueryParams(params));
    return normalizeListResponse<AdminPayment>(
      response,
      billingAdminMapper.normalizePayment,
    );
  },

  async buscarPaymentPorId(id: string): Promise<AdminPayment> {
    const response = await getAdminBillingPaymentsId(id);
    return normalizeSingleResponse<AdminPayment>(
      response,
      billingAdminMapper.normalizePayment,
    );
  },

  async sincronizarPaymentStatus(id: string): Promise<AdminPayment> {
    const response = await postAdminBillingPaymentsIdSync(id);
    return normalizeSingleResponse<AdminPayment>(
      response,
      billingAdminMapper.normalizePayment,
    );
  },

  async listarInvoices(params: ListarInvoicesParams = {}): Promise<ListarInvoicesResult> {
    const response = await getAdminBillingInvoices(normalizeQueryParams(params));
    return normalizeListResponse<AdminInvoice>(
      response,
      billingAdminMapper.normalizeInvoice,
    );
  },

  async buscarInvoicePorId(id: string): Promise<AdminInvoice> {
    const response = await getAdminBillingInvoicesId(id);
    return normalizeSingleResponse<AdminInvoice>(
      response,
      billingAdminMapper.normalizeInvoice,
    );
  },
};
