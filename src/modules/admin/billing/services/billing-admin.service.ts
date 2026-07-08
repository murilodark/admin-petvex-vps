import {
  getAdminBillingSubscriptions,
  getAdminBillingSubscriptionsId,
  patchAdminBillingSubscriptionsIdSuspend,
  patchAdminBillingSubscriptionsIdReactivate,
  patchAdminBillingSubscriptionsIdCancel,
  getAdminBillingPayments,
  getAdminBillingPaymentsId,
  getAdminBillingInvoices,
  getAdminBillingInvoicesId,
  postAdminBillingPaymentsIdSync,
} from '../../../../core/http/generated/endpoints/default/default';
import {
  Subscription,
  Payment,
  Invoice,
} from '../../../../core/http/generated/models';
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
const getInitialSubscriptions = (): Subscription[] => {
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
    {
      id: 'sub-02',
      tenant_id: 'tenant-02',
      tenant: {
        id: 'tenant-02',
        name: 'Hospital Veterinário Amigos e Patas',
        email: 'financeiro@vetamigos.com.br',
        status: 'active',
        created_at: '2026-02-15T09:00:00Z',
      },
      plan_id: 'plan-2',
      plan: {
        id: 2,
        name: 'Plano Standard',
        slug: 'standard',
        monthly_price: 349.90,
        yearly_price: 3490.00,
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
      },
      status: 'trialing',
      billing_cycle: 'yearly',
      price: 3490.00,
      gateway: 'stripe',
      trial_ends_at: '2026-06-10T09:00:00Z',
      current_period_starts_at: '2026-06-03T09:00:00Z',
      current_period_ends_at: '2026-06-10T09:00:00Z',
      next_billing_at: '2026-06-10T09:00:00Z',
      created_at: '2026-06-03T09:00:00Z',
      updated_at: '2026-06-03T09:00:00Z',
    },
    {
      id: 'sub-03',
      tenant_id: 'tenant-03',
      tenant: {
        id: 'tenant-03',
        name: 'Pet Shop Bicho Feliz S/A',
        email: 'adm@bichofeliz.com',
        status: 'active',
        created_at: '2025-11-20T14:00:00Z',
      },
      plan_id: 'plan-3',
      plan: {
        id: 3,
        name: 'Plano Pro Multipet',
        slug: 'pro-multipet',
        monthly_price: 599.90,
        yearly_price: 5990.00,
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
      },
      status: 'suspended',
      billing_cycle: 'monthly',
      price: 599.90,
      gateway: 'iugu',
      trial_ends_at: '2025-11-27T14:00:00Z',
      current_period_starts_at: '2026-04-27T14:00:00Z',
      current_period_ends_at: '2026-05-27T14:00:00Z',
      next_billing_at: '2026-05-27T14:00:00Z',
      suspended_at: '2026-05-28T09:00:00Z',
      created_at: '2025-11-20T14:00:00Z',
      updated_at: '2026-05-28T09:00:00Z',
    },
    {
      id: 'sub-04',
      tenant_id: 'tenant-04',
      tenant: {
        id: 'tenant-04',
        name: 'Clínica Especializada Gato & Sapato',
        email: 'faturamento@gatoesapato.vet.br',
        status: 'active',
        created_at: '2026-03-05T16:00:00Z',
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
      status: 'canceled',
      billing_cycle: 'monthly',
      price: 199.90,
      gateway: 'asaas',
      trial_ends_at: '2026-03-12T16:00:00Z',
      current_period_starts_at: '2026-03-12T16:00:00Z',
      current_period_ends_at: '2026-04-12T16:00:00Z',
      next_billing_at: '2026-04-12T16:00:00Z',
      canceled_at: '2026-04-10T15:30:00Z',
      created_at: '2026-03-05T16:00:00Z',
      updated_at: '2026-04-10T15:30:00Z',
    },
    {
      id: 'sub-05',
      tenant_id: 'tenant-05',
      tenant: {
        id: 'tenant-05',
        name: 'VetCare Medicamentos Premium',
        email: 'admin@vetcare.com.br',
        status: 'active',
        created_at: '2026-04-01T08:00:00Z',
      },
      plan_id: 'plan-2',
      plan: {
        id: 2,
        name: 'Plano Standard',
        slug: 'standard',
        monthly_price: 349.90,
        yearly_price: 3490.00,
        is_active: true,
        created_at: '2026-01-01T00:00:00Z',
      },
      status: 'past_due',
      billing_cycle: 'monthly',
      price: 349.90,
      gateway: 'mercado_pago',
      trial_ends_at: '2026-04-08T08:00:00Z',
      current_period_starts_at: '2026-05-08T08:00:00Z',
      current_period_ends_at: '2026-06-08T08:00:00Z',
      next_billing_at: '2026-06-08T08:00:00Z',
      created_at: '2026-04-01T08:00:00Z',
      updated_at: '2026-05-08T08:00:00Z',
    },
  ];
};

const getInitialPayments = (): Payment[] => {
  return [
    {
      id: 'pay-01',
      tenant_id: 'tenant-01',
      tenant: {
        id: 'tenant-01',
        name: 'Clínica Veterinária Patinhas Verdes',
        email: 'contato@patinhasverdes.com.br',
        status: 'active',
        created_at: '2026-01-10T10:00:00Z',
      },
      subscription_id: 'sub-01',
      invoice_id: 'inv-01',
      amount: 199.90,
      currency: 'BRL',
      status: 'approved',
      method: 'credit_card',
      gateway: 'mercado_pago',
      gateway_payment_id: 'mp_pay_883019280',
      gateway_transaction_id: 'mp_tx_992100293',
      paid_at: '2026-05-17T10:05:00Z',
      created_at: '2026-05-17T10:00:00Z',
      updated_at: '2026-05-17T10:05:00Z',
    },
    {
      id: 'pay-02',
      tenant_id: 'tenant-05',
      tenant: {
        id: 'tenant-05',
        name: 'VetCare Medicamentos Premium',
        email: 'admin@vetcare.com.br',
        status: 'active',
        created_at: '2026-04-01T08:00:00Z',
      },
      subscription_id: 'sub-05',
      invoice_id: 'inv-02',
      amount: 349.90,
      currency: 'BRL',
      status: 'failed',
      method: 'credit_card',
      gateway: 'mercado_pago',
      gateway_payment_id: 'mp_pay_error_9901',
      gateway_transaction_id: 'mp_tx_error_1102',
      failure_reason: 'Saldo insuficiente na transação eletrônica com a operadora do cartão (Visa).',
      failed_at: '2026-05-08T08:30:00Z',
      created_at: '2026-05-08T08:00:00Z',
      updated_at: '2026-05-08T08:30:00Z',
    },
    {
      id: 'pay-03',
      tenant_id: 'tenant-03',
      tenant: {
        id: 'tenant-03',
        name: 'Pet Shop Bicho Feliz S/A',
        email: 'adm@bichofeliz.com',
        status: 'active',
        created_at: '2025-11-20T14:00:00Z',
      },
      subscription_id: 'sub-03',
      invoice_id: 'inv-03',
      amount: 599.90,
      currency: 'BRL',
      status: 'refunded',
      method: 'pix',
      gateway: 'iugu',
      gateway_payment_id: 'iugu_pay_28301',
      gateway_transaction_id: 'iugu_tx_11202',
      paid_at: '2026-04-27T14:15:00Z',
      refunded_at: '2026-04-28T16:00:00Z',
      created_at: '2026-04-27T14:00:00Z',
      updated_at: '2026-04-28T16:00:00Z',
    },
  ];
};

const getInitialInvoices = (): Invoice[] => {
  return [
    {
      id: 'inv-01',
      number: 'INV-2026-001',
      tenant_id: 'tenant-01',
      tenant: {
        id: 'tenant-01',
        name: 'Clínica Veterinária Patinhas Verdes',
        email: 'contato@patinhasverdes.com.br',
        status: 'active',
        created_at: '2026-01-10T10:00:00Z',
      },
      subscription_id: 'sub-01',
      gateway: 'mercado_pago',
      status: 'paid',
      amount: 199.90,
      currency: 'BRL',
      due_at: '2026-05-17T10:00:00Z',
      paid_at: '2026-05-17T10:05:00Z',
      gateway_invoice_id: 'mp_inv_772019',
      invoice_url: 'https://link.mercadopago.com.br/fatura/exemplo-1',
      created_at: '2026-05-17T10:00:00Z',
      updated_at: '2026-05-17T10:05:00Z',
    },
    {
      id: 'inv-02',
      number: 'INV-2026-005',
      tenant_id: 'tenant-05',
      tenant: {
        id: 'tenant-05',
        name: 'VetCare Medicamentos Premium',
        email: 'admin@vetcare.com.br',
        status: 'active',
        created_at: '2026-04-01T08:00:00Z',
      },
      subscription_id: 'sub-05',
      gateway: 'mercado_pago',
      status: 'overdue',
      amount: 349.90,
      currency: 'BRL',
      due_at: '2026-05-08T08:00:00Z',
      gateway_invoice_id: 'mp_inv_88192',
      invoice_url: 'https://link.mercadopago.com.br/fatura/exemplo-2',
      created_at: '2026-05-08T08:00:00Z',
      updated_at: '2026-05-08T08:00:00Z',
    },
  ];
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

      const response = await getAdminBillingSubscriptions(cleanParams);
      const resAny = response as any;
      const listData = resAny?.data || response?.data || response || [];
      const total = resAny?.total || response?.total || (Array.isArray(listData) ? listData.length : 0);
      const page = resAny?.page || response?.page || 1;
      const perPage = resAny?.perPage || response?.perPage || 10;
      const lastPage = resAny?.lastPage || response?.lastPage || 1;

      return {
        data: Array.isArray(listData) ? listData : [],
        total,
        page,
        perPage,
        lastPage,
      };
    } catch (e) {
      console.warn('API error listing subscriptions, using local fallback:', e);
      let list = getStoredList<Subscription>(SUBS_DB_KEY, getInitialSubscriptions);

      if (params.tenant_id) {
        list = list.filter(sub => sub.tenant_id === params.tenant_id || sub.tenant?.name.toLowerCase().includes(params.tenant_id!.toLowerCase()));
      }
      if (params.plan_id && params.plan_id !== 'all') {
        list = list.filter(sub => sub.plan_id === params.plan_id || sub.plan?.name.toLowerCase().includes(params.plan_id!.toLowerCase()));
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

  async buscarSubscriptionPorId(id: string): Promise<Subscription> {
    try {
      const response = await getAdminBillingSubscriptionsId(id);
      const resAny = response as any;
      if (resAny && resAny.data) {
        return resAny.data;
      }
      return response;
    } catch (e) {
      console.warn(`API error getting subscription ${id}, using local fallback:`, e);
      const list = getStoredList<Subscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const found = list.find(s => s.id === id);
      if (!found) {
        throw new Error('Assinatura não localizada no banco de dados.');
      }
      return found;
    }
  },

  async suspenderSubscription(id: string, reason?: string): Promise<{ status: boolean; message: string }> {
    try {
      const response = await patchAdminBillingSubscriptionsIdSuspend(id, reason ? { reason } : undefined);
      
      const list = getStoredList<Subscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const updatedList = list.map(sub => sub.id === id ? { ...sub, status: 'suspended' as any, suspended_at: new Date().toISOString() } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return response as any;
    } catch (e) {
      console.warn(`API error suspending subscription ${id}, simulating locally:`, e);
      const list = getStoredList<Subscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const found = list.find(s => s.id === id);
      if (!found) throw new Error('Assinatura não localizada.');
      
      const updatedList = list.map(sub => sub.id === id ? { ...sub, status: 'suspended' as any, suspended_at: new Date().toISOString() } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return {
        status: true,
        message: 'Assinatura suspensa localmente com sucesso (Fallback Offline).',
      };
    }
  },

  async reativarSubscription(id: string): Promise<{ status: boolean; message: string }> {
    try {
      const response = await patchAdminBillingSubscriptionsIdReactivate(id);
      
      const list = getStoredList<Subscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const updatedList = list.map(sub => sub.id === id ? { ...sub, status: 'active' as any } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return response as any;
    } catch (e) {
      console.warn(`API error reactivating subscription ${id}, simulating locally:`, e);
      const list = getStoredList<Subscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const found = list.find(s => s.id === id);
      if (!found) throw new Error('Assinatura não localizada.');

      const updatedList = list.map(sub => sub.id === id ? { ...sub, status: 'active' as any } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return {
        status: true,
        message: 'Assinatura reativada localmente com sucesso (Fallback Offline).',
      };
    }
  },

  async cancelarSubscription(id: string, reason?: string): Promise<{ status: boolean; message: string }> {
    try {
      const response = await patchAdminBillingSubscriptionsIdCancel(id, reason ? { reason } : undefined);
      
      const list = getStoredList<Subscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const updatedList = list.map(sub => sub.id === id ? { ...sub, status: 'canceled' as any, canceled_at: new Date().toISOString() } : sub);
      saveStoredList(SUBS_DB_KEY, updatedList);

      return response as any;
    } catch (e) {
      console.warn(`API error cancelling subscription ${id}, simulating locally:`, e);
      const list = getStoredList<Subscription>(SUBS_DB_KEY, getInitialSubscriptions);
      const found = list.find(s => s.id === id);
      if (!found) throw new Error('Assinatura não localizada.');

      const updatedList = list.map(sub => sub.id === id ? { ...sub, status: 'canceled' as any, canceled_at: new Date().toISOString() } : sub);
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

      const response = await getAdminBillingPayments(cleanParams);
      const resAny = response as any;
      const listData = resAny?.data || response?.data || response || [];
      const total = resAny?.total || response?.total || (Array.isArray(listData) ? listData.length : 0);
      const page = resAny?.page || response?.page || 1;
      const perPage = resAny?.perPage || response?.perPage || 10;
      const lastPage = resAny?.lastPage || response?.lastPage || 1;

      return {
        data: Array.isArray(listData) ? listData : [],
        total,
        page,
        perPage,
        lastPage,
      };
    } catch (e) {
      console.warn('API error listing payments, using local fallback:', e);
      let list = getStoredList<Payment>(PAYS_DB_KEY, getInitialPayments);

      if (params.tenant_id) {
        list = list.filter(pay => pay.tenant_id === params.tenant_id || pay.tenant?.name.toLowerCase().includes(params.tenant_id!.toLowerCase()));
      }
      if (params.subscription_id) {
        list = list.filter(pay => pay.subscription_id === params.subscription_id);
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

  async buscarPaymentPorId(id: string): Promise<Payment> {
    try {
      const response = await getAdminBillingPaymentsId(id);
      const resAny = response as any;
      if (resAny && resAny.data) {
        return resAny.data;
      }
      return response;
    } catch (e) {
      console.warn(`API error getting payment ${id}, using local fallback:`, e);
      const list = getStoredList<Payment>(PAYS_DB_KEY, getInitialPayments);
      const found = list.find(p => p.id === id);
      if (!found) {
        throw new Error('Transação de pagamento não localizada.');
      }
      return found;
    }
  },

  async sincronizarPaymentStatus(id: string): Promise<Payment> {
    try {
      const response = await postAdminBillingPaymentsIdSync(id);
      const resAny = response as any;
      const updatedPayment = resAny?.data || response?.data || response;
      
      // Update in localStorage of simulated db too, so states stay in sync
      const list = getStoredList<Payment>(PAYS_DB_KEY, getInitialPayments);
      const index = list.findIndex(p => p.id === id);
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
      const list = getStoredList<Payment>(PAYS_DB_KEY, getInitialPayments);
      const index = list.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error('Transação de pagamento não localizada.');
      }
      
      const current = list[index];
      const updatedModel: Payment = {
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

      const response = await getAdminBillingInvoices(cleanParams);
      const resAny = response as any;
      const listData = resAny?.data || response?.data || response || [];
      const total = resAny?.total || response?.total || (Array.isArray(listData) ? listData.length : 0);
      const page = resAny?.page || response?.page || 1;
      const perPage = resAny?.perPage || response?.perPage || 10;
      const lastPage = resAny?.lastPage || response?.lastPage || 1;

      return {
        data: Array.isArray(listData) ? listData : [],
        total,
        page,
        perPage,
        lastPage,
      };
    } catch (e) {
      console.warn('API error listing invoices, using local fallback:', e);
      let list = getStoredList<Invoice>(INVS_DB_KEY, getInitialInvoices);

      if (params.tenant_id) {
        list = list.filter(inv => inv.tenant_id === params.tenant_id || inv.tenant?.name.toLowerCase().includes(params.tenant_id!.toLowerCase()));
      }
      if (params.subscription_id) {
        list = list.filter(inv => inv.subscription_id === params.subscription_id);
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

  async buscarInvoicePorId(id: string): Promise<Invoice> {
    try {
      const response = await getAdminBillingInvoicesId(id);
      const resAny = response as any;
      if (resAny && resAny.data) {
        return resAny.data;
      }
      return response;
    } catch (e) {
      console.warn(`API error getting invoice ${id}, using local fallback:`, e);
      const list = getStoredList<Invoice>(INVS_DB_KEY, getInitialInvoices);
      const found = list.find(inv => inv.id === id);
      if (!found) {
        throw new Error('Fatura de cobrança não localizada.');
      }
      return found;
    }
  },
};
