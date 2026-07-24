import { ListAdminBillingSubscriptionsParams, AdminSubscription } from '../../../core/http/generated/models/admin-billing-subscriptions';
import { ListAdminBillingPaymentsParams, AdminPayment } from '../../../core/http/generated/models/admin-billing-payments';
import { ListAdminBillingInvoicesParams, AdminInvoice } from '../../../core/http/generated/models/admin-billing-invoices';

export type Subscription = AdminSubscription;
export type Payment = AdminPayment;
export type Invoice = AdminInvoice;

export type ListarSubscriptionsParams = ListAdminBillingSubscriptionsParams & {
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

export type ListarPaymentsParams = ListAdminBillingPaymentsParams & {
  page?: number;
  perPage?: number;
  tenant_id?: string;
  subscription_id?: string;
  status?: string;
  gateway?: string;
  date_from?: string;
  date_to?: string;
};

export interface ListarPaymentsResult {
  data: AdminPayment[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export type ListarInvoicesParams = ListAdminBillingInvoicesParams & {
  page?: number;
  perPage?: number;
  tenant_id?: string;
  subscription_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
};

export interface ListarInvoicesResult {
  data: AdminInvoice[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}
