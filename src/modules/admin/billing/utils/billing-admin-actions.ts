import {
  AdminInvoice,
  AdminPayment,
  AdminSubscription,
} from '../types/billing-admin.types';

const normalizeStatus = (status?: string): string => {
  return String(status ?? '').trim().toLowerCase();
};

const isOneOf = (status: string | undefined, allowedStatuses: string[]): boolean => {
  return allowedStatuses.includes(normalizeStatus(status));
};

export const adminBillingCapabilities = {
  canUpdateSubscription: false,
  canActivateSubscription: false,
  canUpdatePayment: false,
  canCancelPayment: false,
  canMarkPaymentAsPaid: false,
  canUpdateInvoice: false,
  canCancelInvoice: false,
  canMarkInvoiceAsPaid: false,
} as const;

export const canEditSubscription = (_subscription: AdminSubscription): boolean => {
  return adminBillingCapabilities.canUpdateSubscription;
};

export const canSuspendSubscription = (subscription: AdminSubscription): boolean => {
  return isOneOf(subscription.status, ['trialing', 'active']);
};

export const canReactivateSubscription = (subscription: AdminSubscription): boolean => {
  return isOneOf(subscription.status, [
    'suspended',
    'payment_required',
    'past_due',
    'cancelled',
    'canceled',
  ]);
};

export const canCancelSubscription = (subscription: AdminSubscription): boolean => {
  return isOneOf(subscription.status, [
    'trialing',
    'active',
    'payment_required',
    'past_due',
    'suspended',
  ]);
};

export const canActivateSubscription = (_subscription: AdminSubscription): boolean => {
  return adminBillingCapabilities.canActivateSubscription;
};

export const canEditPayment = (_payment: AdminPayment): boolean => {
  return adminBillingCapabilities.canUpdatePayment;
};

export const canSyncPayment = (payment: AdminPayment): boolean => {
  return isOneOf(payment.status, [
    'pending',
    'failed',
    'rejected',
    'processing',
  ]);
};

export const canCancelPayment = (_payment: AdminPayment): boolean => {
  return adminBillingCapabilities.canCancelPayment;
};

export const canMarkPaymentAsPaid = (_payment: AdminPayment): boolean => {
  return adminBillingCapabilities.canMarkPaymentAsPaid;
};

export const canEditInvoice = (_invoice: AdminInvoice): boolean => {
  return adminBillingCapabilities.canUpdateInvoice;
};

export const canCancelInvoice = (_invoice: AdminInvoice): boolean => {
  return adminBillingCapabilities.canCancelInvoice;
};

export const canMarkInvoiceAsPaid = (_invoice: AdminInvoice): boolean => {
  return adminBillingCapabilities.canMarkInvoiceAsPaid;
};
