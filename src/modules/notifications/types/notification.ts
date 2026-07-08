import {
  NotificationTemplate,
  NotificationDispatch,
  TenantBlock,
  NotificationTemplateStats,
  NotificationDispatchStats,
  CreateNotificationTemplatePayload,
  UpdateNotificationTemplatePayload,
  CreateTenantBlockPayload,
} from '../../../core/http/generated/models';

export type {
  NotificationTemplate,
  NotificationDispatch,
  TenantBlock,
  NotificationTemplateStats,
  NotificationDispatchStats,
  CreateNotificationTemplatePayload,
  UpdateNotificationTemplatePayload,
  CreateTenantBlockPayload,
};

export interface ListTemplatesParams {
  module?: string;
  event?: string;
  channel?: string;
  send_type?: string;
  is_active?: boolean;
  is_default?: boolean;
  search?: string;
  page?: number;
  perPage?: number;
}

export interface ListDispatchesParams {
  search?: string;
  tenant_id?: string;
  notification_template_id?: string;
  module?: string;
  event?: string;
  channel?: string;
  send_type?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  perPage?: number;
}
