import {
  StoreNotificationTemplateRequest,
  UpdateNotificationTemplateRequest,
  ListAdminNotificationTemplatesParams,
} from '../../../core/http/generated/models/admin-notification-templates';
import {
  ListAdminNotificationDispatchesParams,
} from '../../../core/http/generated/models/admin-notification-dispatches';
import {
  BlockTenantNotificationTemplateRequest,
} from '../../../core/http/generated/models/admin-notification-template-tenant-blocks';

export type NotificationTemplate = any;
export type NotificationDispatch = any;
export type TenantBlock = any;
export type NotificationTemplateStats = any;
export type NotificationDispatchStats = any;

export type CreateNotificationTemplatePayload = StoreNotificationTemplateRequest;
export type UpdateNotificationTemplatePayload = UpdateNotificationTemplateRequest;
export type CreateTenantBlockPayload = BlockTenantNotificationTemplateRequest;

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
