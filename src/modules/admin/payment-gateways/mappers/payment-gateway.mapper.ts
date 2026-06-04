import { PaymentGateway, CreatePaymentGatewayPayload, UpdatePaymentGatewayPayload } from '../../../../core/http/generated/models';
import { PaymentGatewayFormData } from '../types/payment-gateway.types';

export const paymentGatewayMapper = {
  toFormData(gateway: PaymentGateway): PaymentGatewayFormData {
    const formatJsonField = (fieldValue: any): string => {
      if (fieldValue === undefined || fieldValue === null) return '{}';
      if (Array.isArray(fieldValue) && fieldValue.length === 0) return '{}';
      return JSON.stringify(fieldValue, null, 2);
    };

    return {
      name: gateway.name || '',
      provider: gateway.provider || 'mercado_pago',
      status: gateway.status || 'testing',
      is_sandbox: !!gateway.is_sandbox,
      is_default: !!gateway.is_default,
      webhook_url: (gateway as any).webhook_url || '',
      public_key: gateway.public_key || '',
      access_token: '', // Do not display sensitive value
      client_id: gateway.client_id || '',
      client_secret: '', // Do not display sensitive value
      webhook_secret: '', // Do not display sensitive value
      config_json_string: formatJsonField(gateway.config_json),
      checkout_config_string: formatJsonField((gateway as any).checkout_config),
      metadata_string: formatJsonField((gateway as any).metadata),
    };
  },

  toApiCreate(formData: PaymentGatewayFormData): CreatePaymentGatewayPayload {
    const parseJsonOrCreate = (jsonStr?: string) => {
      if (!jsonStr || jsonStr.trim() === '') return {};
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length === 0) return {};
        return parsed;
      } catch (e) {
        return {};
      }
    };

    return {
      name: formData.name,
      provider: formData.provider,
      status: formData.status,
      is_sandbox: formData.is_sandbox,
      public_key: formData.public_key || undefined,
      access_token: formData.access_token || undefined,
      client_id: formData.client_id || undefined,
      client_secret: formData.client_secret || undefined,
      webhook_secret: formData.webhook_secret || undefined,
      ...({
        is_default: formData.is_default && formData.status === 'active',
        webhook_url: formData.webhook_url && formData.webhook_url.trim() !== '' ? formData.webhook_url : undefined,
        checkout_config: parseJsonOrCreate(formData.checkout_config_string),
        metadata: parseJsonOrCreate(formData.metadata_string),
      } as any)
    };
  },

  toApiUpdate(formData: PaymentGatewayFormData): UpdatePaymentGatewayPayload {
    const parseJsonOrCreate = (jsonStr?: string) => {
      if (!jsonStr || jsonStr.trim() === '') return {};
      try {
        const parsed = JSON.parse(jsonStr);
        if (Array.isArray(parsed) && parsed.length === 0) return {};
        return parsed;
      } catch (e) {
        return {};
      }
    };

    const payload: any = {
      name: formData.name,
      provider: formData.provider,
      status: formData.status,
      is_sandbox: formData.is_sandbox,
      is_default: formData.is_default && formData.status === 'active',
      webhook_url: formData.webhook_url && formData.webhook_url.trim() !== '' ? formData.webhook_url : undefined,
      checkout_config: parseJsonOrCreate(formData.checkout_config_string),
      metadata: parseJsonOrCreate(formData.metadata_string),
    };

    // Only set credentials if they have non-empty inputs
    if (formData.public_key && formData.public_key.trim() !== '') {
      payload.public_key = formData.public_key;
    }
    if (formData.access_token && formData.access_token.trim() !== '') {
      payload.access_token = formData.access_token;
    }
    if (formData.client_id && formData.client_id.trim() !== '') {
      payload.client_id = formData.client_id;
    }
    if (formData.client_secret && formData.client_secret.trim() !== '') {
      payload.client_secret = formData.client_secret;
    }
    if (formData.webhook_secret && formData.webhook_secret.trim() !== '') {
      payload.webhook_secret = formData.webhook_secret;
    }

    return payload as UpdatePaymentGatewayPayload;
  }
};
