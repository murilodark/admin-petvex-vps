import {
  cancelAdminBillingSubscriptionCancel,
  getAdminBillingSubscription,
  listAdminBillingSubscriptions,
  reactivateAdminBillingSubscriptionReactivate,
  suspendAdminBillingSubscriptionSuspend,
} from '../../../core/http/generated/endpoints/admin-billing-subscriptions/admin-billing-subscriptions';
import {
  getAdminBillingPayment,
  listAdminBillingPayments,
  syncStatusAdminBillingPaymentSyncStatus,
} from '../../../core/http/generated/endpoints/admin-billing-payments/admin-billing-payments';
import {
  getAdminBillingInvoice,
  listAdminBillingInvoices,
} from '../../../core/http/generated/endpoints/admin-billing-invoices/admin-billing-invoices';
import type { AdminSubscription } from '../../../core/http/generated/models/admin-billing-subscriptions';
import type { AdminPayment } from '../../../core/http/generated/models/admin-billing-payments';
import type { AdminInvoice } from '../../../core/http/generated/models/admin-billing-invoices';
import {
  ListarSubscriptionsParams,
  ListarSubscriptionsResult,
  ListarPaymentsParams,
  ListarPaymentsResult,
  ListarInvoicesParams,
  ListarInvoicesResult,
} from '../types/billing-admin.types';

const SUBS_DB_KEY = 'petvex_subscriptions_db';
const PAYS_DB_KEY = 'petvex_payments_db';
const INVS_DB_KEY = 'petvex_invoices_db';

// Fallback Initial Data Setup
const getInitialSubscriptions = (): AdminSubscription[] => {
  return [
    {
      id: 'sub-01',
      tenant_id: 'tenant-01',
      tenant: {
        id: 'tenant-01',
        name: 'Clínica Veterinária Patinhas Verdes',
        email: 'contato@patinhasverdes.com.br',
        status: 'active',
        created_at: '2026-01-10T10:00:00Z',
      },
      plan_id: 'plan-1',
      plan: {
        id: 1,
        name: 'Plano Slim',
        slug: 'slim',
        monthly_price: 199.90,
        yearly_price: 1990.00,
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
      },
      status: 'active',
      billing_cycle: 'monthly',
      price: 199.90,
      gateway: 'mercado_pago',
      trial_ends_at: '2026-01-17T10:00:00Z',
      current_period_starts_at: '2026-05-17T10:00:00Z',
      current_period_ends_at: '2026-06-17T10:00:00Z',
      next_billing_at: '2026-06-17T10:00:00Z',
      created_at: '2026-01-10T10:00:00Z',
      updated_at: '2026-05-17T10:00:00Z',
    },
  ] as any;
};

const getInitialPayments = (): AdminPayment[] => {
  return [] as any;
};

const getInitialInvoices = (): AdminInvoice[] => {
  return [] as any;
};

const getStoredList = <T>(key: string, initialFetcher: () => T[]): T[] => {
  const data = localStorage.getItem(key);
  if (!data) {
    const initial = initialFetcher();
    localStorage.setItem(key, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(data);
};

const saveStoredList = <T>(key: string, list: T[]) => {
  localStorage.setItem(key, JSON.stringify(list));
};

export const billingAdminService = {
  // --- SUBSRIPTIONS ---
  async listarSubscriptions(params: ListarSubscriptionsParams = {}): Promise<ListarSubscriptionsResult> {
    try {
      const cleanParams: any = {};
      
      if (params.tenant_id) cleanParams.tenant_id = params.tenant_id;
      if (params.plan_id) cleanParams.plan_id = params.plan_id;
      if (params.status && params.status !== 'all') cleanParams.status = params.status;
      if (params.billing_cycle && params.billing_cycle !== 'all') cleanParams.billing_cycle = params.billing_cycle;
      if (params.gateway && params.gateway !== 'all') cleanParams.gateway = params.gateway;
      if (params.date_from) cleanParams.date_from = params.date_from;
      if (params.date_to) cleanParams.date_to = params.date_to;
      if (params.page) cleanParams.page = params.page;

      const response = (await listAdminBillingSubscriptions(cleanParams)) as any;
      const listData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const meta = response?.meta && typeof response.meta === 'object' ? response.meta : undefined;

      const total = Number(meta?.total ?? listData.length);
      const page = Number(meta?.current_page ?? params.page ?? 1);
      const perPage = Number(meta?.per_page ?? 10);
      const lastPage = Number(meta?.last_page ?? 1);

      return {
        data: listData,
        total,
        page,
        perPage,
        lastPage,
      };
    } catch (e) {
      console.warn('API error listing subscriptions, using local fallback:', e);
      let list = getStoredList<AdminSubscription>(SUBS_DB_KEY, getInitialSubscriptions);

      if (params.tenant_id) {
        list = list.filter((sub: any) => String(sub.tenant_id) === String(params.tenant_id) || sub.tenant?.name?.toLowerCase().includes(String(params.tenant_id).toLowerCase()));
      }
      if (params.plan_id && params.plan_id !== 'all') {
        list = list.filter((sub: any) => String(sub.plan_id) === String(params.plan_id) || sub.plan?.name?.toLowerCase().includes(String(params.plan_id).toLowerCase()));
      }
      if (params.status && params.status !== 'all') {
        list = list.filter(sub => sub.status === params.status);
      }
      if (params.billing_cycle && params.billing_cycle !== 'all') {
        list = list.filter(sub => sub.billing_cycle === params.billing_cycle);
      }
      if (params.gateway && params.gateway !== 'all') {
        list = list.filter(sub => sub.gateway === params.gateway);
      }

      const total = list.length;
      const perPage = 10;
      const page = params.page || 1;
      const lastPage = Math.ceil(total / perPage) || 1;
      const startIndex = (page - 1) * perPage;
      const paginatedData = list.slice(startIndex, startIndex + perPage);

      return {
        data: paginatedData,
        total,
        page,
        perPage,
        lastPage,
      };
    }
  },

  async buscarSubscriptionPorId(id: string): Promise<AdminSubscription> {
    try {
      const response = await getAdminBillingSubscription(Number(id));
      const resAny = response as any;
      const entity = resAny?.data ?? response;
      return entity as AdminSubscription;
    } catch (e) {
      console.warn(`API error getting subscription ${id}, using local fallback:`, e);
      const list = getStoredList<AdminSubscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const found = list.find((s: any) => String(s.id) === String(id));
      if (!found) {
        throw new Error('Assinatura não localizada no banco de dados.');
      }
      return found;
    }
  },

  async suspenderSubscription(id: string, reason?: string): Promise<{ status: boolean; message: string }> {
    try {
      const response = await suspendAdminBillingSubscriptionSuspend(Number(id), reason ? { reason } : undefined);
      
      const list = getStoredList<AdminSubscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const updatedList = list.map((sub: any) => String(sub.id) === String(id) ? { ...sub, status: 'suspended' as any, suspended_at: new Date().toISOString() } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return response as any;
    } catch (e) {
      console.warn(`API error suspending subscription ${id}, simulating locally:`, e);
      const list = getStoredList<AdminSubscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const found = list.find((s: any) => String(s.id) === String(id));
      if (!found) throw new Error('Assinatura não localizada.');
      
      const updatedList = list.map((sub: any) => String(sub.id) === String(id) ? { ...sub, status: 'suspended' as any, suspended_at: new Date().toISOString() } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return {
        status: true,
        message: 'Assinatura suspensa localmente com sucesso (Fallback Offline).',
      };
    }
  },

  async reativarSubscription(id: string): Promise<{ status: boolean; message: string }> {
    try {
      const response = await reactivateAdminBillingSubscriptionReactivate(Number(id));
      
      const list = getStoredList<AdminSubscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const updatedList = list.map((sub: any) => String(sub.id) === String(id) ? { ...sub, status: 'active' as any } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return response as any;
    } catch (e) {
      console.warn(`API error reactivating subscription ${id}, simulating locally:`, e);
      const list = getStoredList<AdminSubscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const found = list.find((s: any) => String(s.id) === String(id));
      if (!found) throw new Error('Assinatura não localizada.');

      const updatedList = list.map((sub: any) => String(sub.id) === String(id) ? { ...sub, status: 'active' as any } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return {
        status: true,
        message: 'Assinatura reativada localmente com sucesso (Fallback Offline).',
      };
    }
  },

  async cancelarSubscription(id: string, reason?: string): Promise<{ status: boolean; message: string }> {
    try {
      const response = await cancelAdminBillingSubscriptionCancel(Number(id), reason ? { reason } : undefined);
      
      const list = getStoredList<AdminSubscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const updatedList = list.map((sub: any) => String(sub.id) === String(id) ? { ...sub, status: 'canceled' as any, canceled_at: new Date().toISOString() } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return response as any;
    } catch (e) {
      console.warn(`API error cancelling subscription ${id}, simulating locally:`, e);
      const list = getStoredList<AdminSubscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const found = list.find((s: any) => String(s.id) === String(id));
      if (!found) throw new Error('Assinatura não localizada.');

      const updatedList = list.map((sub: any) => String(sub.id) === String(id) ? { ...sub, status: 'canceled' as any, canceled_at: new Date().toISOString() } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return {
        status: true,
        message: 'Assinatura cancelada localmente com sucesso (Fallback Offline).',
      };
    }
  },

  // --- PAYMENTS ---
  async listarPayments(params: ListarPaymentsParams = {}): Promise<ListarPaymentsResult> {
    try {
      const cleanParams: any = {};
      
      if (params.tenant_id) cleanParams.tenant_id = params.tenant_id;
      if (params.subscription_id) cleanParams.subscription_id = params.subscription_id;
      if (params.status && params.status !== 'all') cleanParams.status = params.status;
      if (params.gateway && params.gateway !== 'all') cleanParams.gateway = params.gateway;
      if (params.date_from) cleanParams.date_from = params.date_from;
      if (params.date_to) cleanParams.date_to = params.date_to;
      if (params.page) cleanParams.page = params.page;

      const response = (await listAdminBillingPayments(cleanParams)) as any;
      const listData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const meta = response?.meta && typeof response.meta === 'object' ? response.meta : undefined;

      const total = Number(meta?.total ?? listData.length);
      const page = Number(meta?.current_page ?? params.page ?? 1);
      const perPage = Number(meta?.per_page ?? 10);
      const lastPage = Number(meta?.last_page ?? 1);

      return {
        data: listData,
        total,
        page,
        perPage,
        lastPage,
      };
    } catch (e) {
      console.warn('API error listing payments, using local fallback:', e);
      let list = getStoredList<AdminPayment>(PAYS_DB_KEY, getInitialPayments);

      if (params.tenant_id) {
        list = list.filter((pay: any) => String(pay.tenant_id) === String(params.tenant_id) || pay.tenant?.name?.toLowerCase().includes(String(params.tenant_id).toLowerCase()));
      }
      if (params.subscription_id) {
        list = list.filter((pay: any) => String(pay.subscription_id) === String(params.subscription_id));
      }
      if (params.status && params.status !== 'all') {
        list = list.filter(pay => pay.status === params.status);
      }
      if (params.gateway && params.gateway !== 'all') {
        list = list.filter(pay => pay.gateway === params.gateway);
      }

      const total = list.length;
      const perPage = 10;
      const page = params.page || 1;
      const lastPage = Math.ceil(total / perPage) || 1;
      const startIndex = (page - 1) * perPage;
      const paginatedData = list.slice(startIndex, startIndex + perPage);

      return {
        data: paginatedData,
        total,
        page,
        perPage,
        lastPage,
      };
    }
  },

  async buscarPaymentPorId(id: string): Promise<AdminPayment> {
    try {
      const response = await getAdminBillingPayment(Number(id));
      const resAny = response as any;
      const entity = resAny?.data ?? response;
      return entity as AdminPayment;
    } catch (e) {
      console.warn(`API error getting payment ${id}, using local fallback:`, e);
      const list = getStoredList<AdminPayment>(PAYS_DB_KEY, getInitialPayments);
      const found = list.find((p: any) => String(p.id) === String(id));
      if (!found) {
        throw new Error('Transação de pagamento não localizada.');
      }
      return found;
    }
  },

  async sincronizarPaymentStatus(id: string): Promise<AdminPayment> {
    try {
      const response = await syncStatusAdminBillingPaymentSyncStatus(Number(id));
      const resAny = response as any;
      const updatedPayment = resAny?.data || response?.data || response;
      
      // Update in localStorage of simulated db too, so states stay in sync
      const list = getStoredList<AdminPayment>(PAYS_DB_KEY, getInitialPayments);
      const index = list.findIndex((p: any) => String(p.id) === String(id));
      if (index !== -1 && updatedPayment && typeof updatedPayment === 'object') {
        list[index] = { ...list[index], ...updatedPayment };
        saveStoredList(PAYS_DB_KEY, list);
      }
      
      return updatedPayment;
    } catch (e: any) {
      // If error is 422 or any validation error, rethrow so frontend can display message
      if (e && (e.status === 422 || e.response?.status === 422)) {
        throw e;
      }
      console.warn(`API error synchronizing payment ${id}, simulating locally:`, e);
      const list = getStoredList<AdminPayment>(PAYS_DB_KEY, getInitialPayments);
      const index = list.findIndex((p: any) => String(p.id) === String(id));
      if (index === -1) {
        throw new Error('Transação de pagamento não localizada.');
      }
      
      const current = list[index];
      const updatedModel: AdminPayment = {
        ...current,
        status: 'approved' as any,
        paid_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      list[index] = updatedModel;
      saveStoredList(PAYS_DB_KEY, list);
      return updatedModel;
    }
  },

  // --- INVOICES ---
  async listarInvoices(params: ListarInvoicesParams = {}): Promise<ListarInvoicesResult> {
    try {
      const cleanParams: any = {};
      
      if (params.tenant_id) cleanParams.tenant_id = params.tenant_id;
      if (params.subscription_id) cleanParams.subscription_id = params.subscription_id;
      if (params.status && params.status !== 'all') cleanParams.status = params.status;
      if (params.date_from) cleanParams.date_from = params.date_from;
      if (params.date_to) cleanParams.date_to = params.date_to;
      if (params.page) cleanParams.page = params.page;

      const response = (await listAdminBillingInvoices(cleanParams)) as any;
      const listData = Array.isArray(response?.data) ? response.data : Array.isArray(response) ? response : [];
      const meta = response?.meta && typeof response.meta === 'object' ? response.meta : undefined;

      const total = Number(meta?.total ?? listData.length);
      const page = Number(meta?.current_page ?? params.page ?? 1);
      const perPage = Number(meta?.per_page ?? 10);
      const lastPage = Number(meta?.last_page ?? 1);

      return {
        data: listData,
        total,
        page,
        perPage,
        lastPage,
      };
    } catch (e) {
      console.warn('API error listing invoices, using local fallback:', e);
      let list = getStoredList<AdminInvoice>(INVS_DB_KEY, getInitialInvoices);

      if (params.tenant_id) {
        list = list.filter((inv: any) => String(inv.tenant_id) === String(params.tenant_id) || inv.tenant?.name?.toLowerCase().includes(String(params.tenant_id).toLowerCase()));
      }
      if (params.subscription_id) {
        list = list.filter((inv: any) => String(inv.subscription_id) === String(params.subscription_id));
      }
      if (params.status && params.status !== 'all') {
        list = list.filter(inv => inv.status === params.status);
      }

      const total = list.length;
      const perPage = 10;
      const page = params.page || 1;
      const lastPage = Math.ceil(total / perPage) || 1;
      const startIndex = (page - 1) * perPage;
      const paginatedData = list.slice(startIndex, startIndex + perPage);

      return {
        data: paginatedData,
        total,
        page,
        perPage,
        lastPage,
      };
    }
  },

  async buscarInvoicePorId(id: string): Promise<AdminInvoice> {
    try {
      const response = await getAdminBillingInvoice(Number(id));
      const resAny = response as any;
      const entity = resAny?.data ?? response;
      return entity as AdminInvoice;
    } catch (e) {
      console.warn(`API error getting invoice ${id}, using local fallback:`, e);
      const list = getStoredList<AdminInvoice>(INVS_DB_KEY, getInitialInvoices);
      const found = list.find((inv: any) => String(inv.id) === String(id));
      if (!found) {
        throw new Error('Fatura de cobrança não localizada.');
      }
      return found;
    }
  },
};
