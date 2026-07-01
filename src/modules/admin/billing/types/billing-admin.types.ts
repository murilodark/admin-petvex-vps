import { GetAdminBillingSubscriptionsParams } from '../../../../core/http/generated/models/getAdminBillingSubscriptionsParams';
import { GetAdminBillingPaymentsParams } from '../../../../core/http/generated/models/getAdminBillingPaymentsParams';
import { GetAdminBillingInvoicesParams } from '../../../../core/http/generated/models/getAdminBillingInvoicesParams';
import { Subscription } from '../../../../core/http/generated/models/subscription';
import { Payment } from '../../../../core/http/generated/models/payment';
import { Invoice } from '../../../../core/http/generated/models/invoice';

export type BillingMetadata = Record<string, unknown>;

export type AdminSubscription = Omit<Subscription, 'status'> & {
  status: string;
  amount?: number;
  currency?: string;
  metadata?: BillingMetadata;
  trial_started_at?: string;
  started_at?: string;
  cancel_reason?: string;
  gateway_checkout_url?: string;
  payment_gateway_id?: string | number;
  billing_customer_id?: string | number;
  gateway_customer_id?: string;
  gateway_subscription_id?: string;
  gateway_checkout_id?: string;
  last_payment?: AdminPayment;
  invoice?: AdminInvoice;
  invoices?: AdminInvoice[];
  payments?: AdminPayment[];
};

export type AdminPayment = Omit<Payment, 'status' | 'method' | 'subscription' | 'invoice'> & {
  status: string;
  method: string;
  payment_method?: string;
  payment_gateway_id?: string | number;
  metadata?: BillingMetadata;
  subscription?: AdminSubscription;
  invoice?: AdminInvoice;
};

export type AdminInvoice = Omit<Invoice, 'status' | 'subscription'> & {
  status: string;
  due_date?: string;
  payment_gateway_id?: string | number;
  metadata?: BillingMetadata;
  subscription?: AdminSubscription;
  payment?: AdminPayment;
};

export type ListarSubscriptionsParams = Omit<GetAdminBillingSubscriptionsParams, 'perPage'> & {
  is_sandbox?: string;
  plan_id?: string;
};

export interface ListarSubscriptionsResult {
  data: AdminSubscription[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export type ListarPaymentsParams = Omit<GetAdminBillingPaymentsParams, 'perPage'>;

export interface ListarPaymentsResult {
  data: AdminPayment[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export type ListarInvoicesParams = Omit<GetAdminBillingInvoicesParams, 'perPage'>;

export interface ListarInvoicesResult {
  data: AdminInvoice[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export interface BillingActionResponse {
  status: boolean;
  message: string;
}
