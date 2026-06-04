import { PaymentGateway, PaymentGatewayProvider, PaymentGatewayStatus } from '../../../../core/http/generated/models';

export interface ListarPaymentGatewaysParams {
  search?: string;
  is_sandbox?: string; // 'true' | 'false' | 'all'
  provider?: string;   // provider values | 'all'
  status?: string;     // status values | 'all'
  page?: number;
  is_default?: string; // 'true' | 'false' | 'all'
}

export interface ListarPaymentGatewaysResult {
  data: PaymentGateway[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}

export interface PaymentGatewayFormData {
  name: string;
  provider: PaymentGatewayProvider;
  status: PaymentGatewayStatus;
  is_sandbox: boolean;
  is_default: boolean;
  webhook_url?: string;
  public_key?: string;
  access_token?: string;
  client_id?: string;
  client_secret?: string;
  webhook_secret?: string;
  config_json_string?: string; // for editing as string
  checkout_config_string?: string; // for editing as string
  metadata_string?: string; // for editing as string
}
