import { Plan, Tenant } from '../../../../core/http/generated/models';
import {
  AdminInvoice,
  AdminPayment,
  AdminSubscription,
  BillingMetadata,
} from '../types/billing-admin.types';

type ApiRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is ApiRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const firstRecord = (value: unknown): ApiRecord => {
  const resolvedValue = Array.isArray(value) ? value[0] : value;
  return isRecord(resolvedValue) ? resolvedValue : {};
};

const optionalString = (value: unknown): string | undefined => {
  if (value === null || value === undefined || value === '') return undefined;
  return String(value);
};

const stringValue = (value: unknown, fallback = ''): string => {
  return optionalString(value) ?? fallback;
};

const numberValue = (value: unknown, fallback = 0): number => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const booleanValue = (value: unknown, fallback = false): boolean => {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  if (value === 0 || value === '0' || value === 'false') return false;
  return fallback;
};

const metadataValue = (value: unknown): BillingMetadata | undefined => {
  return isRecord(value) ? value : undefined;
};

const normalizeTenant = (value: unknown): Tenant | undefined => {
  if (!isRecord(value)) return undefined;

  return {
    id: stringValue(value.id),
    name: stringValue(value.name, 'Cliente não informado'),
    email: stringValue(value.email),
    documento: optionalString(value.documento ?? value.document ?? value.cpf_cnpj),
    telefone: optionalString(value.telefone ?? value.phone),
    status: stringValue(value.status, 'active') as Tenant['status'],
    plano: optionalString(value.plano ?? value.plan_id),
    created_at: stringValue(value.created_at),
    updated_at: optionalString(value.updated_at),
  };
};

const normalizePlan = (value: unknown, subscriptionAmount = 0): Plan | undefined => {
  if (!isRecord(value)) return undefined;

  const monthlyPrice = numberValue(value.monthly_price ?? value.price ?? value.amount, subscriptionAmount);
  const yearlyPrice = numberValue(value.yearly_price, monthlyPrice * 12);

  return {
    id: numberValue(value.id),
    name: stringValue(value.name, 'Plano não informado'),
    slug: optionalString(value.slug),
    short_description: optionalString(value.short_description),
    description: optionalString(value.description),
    monthly_price: monthlyPrice,
    yearly_price: yearlyPrice,
    yearly_discount_percent: numberValue(value.yearly_discount_percent ?? value.yearly_discount_percentage, 0),
    is_featured: booleanValue(value.is_featured),
    has_trial: booleanValue(value.has_trial ?? value.trial_enabled),
    trial_days: numberValue(value.trial_days, 0),
    display_order: numberValue(value.display_order ?? value.sort_order, 0),
    badge: optionalString(value.badge),
    color: optionalString(value.color),
    max_users: value.max_users === null ? null : numberValue(value.max_users, 0),
    max_clients: value.max_clients === null ? null : numberValue(value.max_clients, 0),
    max_pets: value.max_pets === null ? null : numberValue(value.max_pets, 0),
    max_appointments: value.max_appointments === null ? null : numberValue(value.max_appointments, 0),
    max_products: value.max_products === null ? null : numberValue(value.max_products, 0),
    max_services: value.max_services === null ? null : numberValue(value.max_services, 0),
    max_stock_items: value.max_stock_items === null ? null : numberValue(value.max_stock_items, 0),
    max_documents: value.max_documents === null ? null : numberValue(value.max_documents, 0),
    max_attachments: value.max_attachments === null ? null : numberValue(value.max_attachments, 0),
    max_storage_mb: value.max_storage_mb === null ? null : numberValue(value.max_storage_mb, 0),
    features: isRecord(value.features) ? value.features : undefined,
    is_active: booleanValue(value.is_active ?? value.active, true),
    created_at: stringValue(value.created_at),
    updated_at: optionalString(value.updated_at),
  };
};

export const normalizeSubscription = (data: unknown): AdminSubscription => {
  const record = firstRecord(data);
  const amount = numberValue(record.amount ?? record.price);

  const subscription: AdminSubscription = {
    id: stringValue(record.id),
    tenant_id: stringValue(record.tenant_id),
    tenant: normalizeTenant(record.tenant),
    plan_id: stringValue(record.plan_id),
    plan: normalizePlan(record.plan, amount),
    status: stringValue(record.status, 'pending'),
    billing_cycle: stringValue(record.billing_cycle, 'monthly') as AdminSubscription['billing_cycle'],
    price: amount,
    amount,
    currency: stringValue(record.currency, 'BRL'),
    gateway: optionalString(record.gateway),
    trial_started_at: optionalString(record.trial_started_at),
    trial_ends_at: optionalString(record.trial_ends_at),
    started_at: optionalString(record.started_at),
    current_period_starts_at: optionalString(record.current_period_starts_at),
    current_period_ends_at: optionalString(record.current_period_ends_at),
    next_billing_at: optionalString(record.next_billing_at),
    canceled_at: optionalString(record.canceled_at ?? record.cancelled_at),
    suspended_at: optionalString(record.suspended_at),
    cancel_reason: optionalString(record.cancel_reason),
    gateway_checkout_url: optionalString(record.gateway_checkout_url),
    payment_gateway_id: optionalString(record.payment_gateway_id),
    billing_customer_id: optionalString(record.billing_customer_id),
    gateway_customer_id: optionalString(record.gateway_customer_id),
    gateway_subscription_id: optionalString(record.gateway_subscription_id),
    gateway_checkout_id: optionalString(record.gateway_checkout_id),
    metadata: metadataValue(record.metadata),
    created_at: stringValue(record.created_at),
    updated_at: optionalString(record.updated_at),
  };

  if (isRecord(record.last_payment)) {
    subscription.last_payment = normalizePayment(record.last_payment);
  }
  if (isRecord(record.invoice)) {
    subscription.invoice = normalizeInvoice(record.invoice);
  }
  if (Array.isArray(record.invoices)) {
    subscription.invoices = record.invoices.map(normalizeInvoice);
  }
  if (Array.isArray(record.payments)) {
    subscription.payments = record.payments.map(normalizePayment);
  }

  return subscription;
};

export const normalizePayment = (data: unknown): AdminPayment => {
  const record = firstRecord(data);
  const method = stringValue(record.method ?? record.payment_method);

  return {
    id: stringValue(record.id),
    tenant_id: optionalString(record.tenant_id),
    tenant: normalizeTenant(record.tenant),
    subscription_id: optionalString(record.subscription_id),
    subscription: isRecord(record.subscription) ? normalizeSubscription(record.subscription) : undefined,
    invoice_id: optionalString(record.invoice_id),
    invoice: isRecord(record.invoice) ? normalizeInvoice(record.invoice) : undefined,
    gateway: optionalString(record.gateway),
    gateway_payment_id: optionalString(record.gateway_payment_id),
    gateway_transaction_id: optionalString(record.gateway_transaction_id),
    status: stringValue(record.status, 'pending'),
    method,
    payment_method: optionalString(record.payment_method),
    amount: numberValue(record.amount),
    currency: stringValue(record.currency, 'BRL'),
    paid_at: optionalString(record.paid_at),
    failed_at: optionalString(record.failed_at),
    refunded_at: optionalString(record.refunded_at),
    failure_reason: optionalString(record.failure_reason),
    payment_gateway_id: optionalString(record.payment_gateway_id),
    metadata: metadataValue(record.metadata),
    created_at: stringValue(record.created_at),
    updated_at: optionalString(record.updated_at),
  };
};

export const normalizeInvoice = (data: unknown): AdminInvoice => {
  const record = firstRecord(data);
  const dueDate = optionalString(record.due_at ?? record.due_date);

  return {
    id: stringValue(record.id),
    number: stringValue(record.number),
    tenant_id: optionalString(record.tenant_id),
    tenant: normalizeTenant(record.tenant),
    subscription_id: optionalString(record.subscription_id),
    subscription: isRecord(record.subscription) ? normalizeSubscription(record.subscription) : undefined,
    payment: isRecord(record.payment) ? normalizePayment(record.payment) : undefined,
    gateway: optionalString(record.gateway),
    status: stringValue(record.status, 'pending'),
    amount: numberValue(record.amount),
    currency: stringValue(record.currency, 'BRL'),
    due_at: dueDate,
    due_date: dueDate,
    paid_at: optionalString(record.paid_at),
    gateway_invoice_id: optionalString(record.gateway_invoice_id),
    invoice_url: optionalString(record.invoice_url),
    payment_gateway_id: optionalString(record.payment_gateway_id),
    metadata: metadataValue(record.metadata),
    created_at: stringValue(record.created_at),
    updated_at: optionalString(record.updated_at),
  };
};

export const billingAdminMapper = {
  normalizeSubscription,
  normalizePayment,
  normalizeInvoice,
};
