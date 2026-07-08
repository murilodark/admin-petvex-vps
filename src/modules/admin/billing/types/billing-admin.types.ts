import { GetAdminBillingSubscriptionsParams } from '../../../../core/http/generated/models/getAdminBillingSubscriptionsParams';
import { GetAdminBillingPaymentsParams } from '../../../../core/http/generated/models/getAdminBillingPaymentsParams';
import { GetAdminBillingInvoicesParams } from '../../../../core/http/generated/models/getAdminBillingInvoicesParams';
import { Subscription } from '../../../../core/http/generated/models/subscription';
import { Payment } from '../../../../core/http/generated/models/payment';
import { Invoice } from '../../../../core/http/generated/models/invoice';

export type ListarSubscriptionsParams = GetAdminBillingSubscriptionsParams & {
  is_sandbox?: string;
  plan_id?: string;
};

export interface ListarSubscriptionsResult {
  data: Subscription[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export type ListarPaymentsParams = GetAdminBillingPaymentsParams;

export interface ListarPaymentsResult {
  data: Payment[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export type ListarInvoicesParams = GetAdminBillingInvoicesParams;

export interface ListarInvoicesResult {
  data: Invoice[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}
