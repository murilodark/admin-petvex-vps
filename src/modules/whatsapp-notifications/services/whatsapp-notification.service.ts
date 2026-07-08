import {
  getWhatsAppNotifications,
  getWhatsAppNotificationId,
  postWhatsAppNotificationIdRetry,
  getWhatsAppTemplates,
  getWhatsAppTenantSettings,
  putWhatsAppTenantSettings
} from '../../../core/http/generated/endpoints/default/default';
import {
  WhatsAppNotification,
  WhatsAppTemplate,
  WhatsAppSettings
} from '../../../core/http/generated/models';
import {
  whatsappNotificationMapper,
  UIWhatsAppNotification
} from '../mappers/whatsapp-notification.mapper';
import {
  whatsappTemplateMapper,
  UIWhatsAppTemplate
} from '../mappers/whatsapp-template.mapper';
import {
  whatsappSettingsMapper,
  UIWhatsAppSettings
} from '../mappers/whatsapp-settings.mapper';
import { ListWhatsAppNotificationsParams, ListWhatsAppNotificationsResult } from '../types/whatsapp-notification.types';

export const whatsappNotificationService = {
  async listNotifications(filters: ListWhatsAppNotificationsParams): Promise<ListWhatsAppNotificationsResult> {
    // Strip empty strings and undefined values
    const queryParams: any = {};
    if (filters.status && filters.status !== 'all') queryParams.status = filters.status;
    if (filters.appointment_id) queryParams.appointment_id = filters.appointment_id;
    if (filters.client_id) queryParams.client_id = filters.client_id;
    if (filters.date_from) queryParams.date_from = filters.date_from;
    if (filters.date_to) queryParams.date_to = filters.date_to;
    if (filters.page) queryParams.page = filters.page;
    if (filters.perPage) queryParams.perPage = filters.perPage;

    const response = await getWhatsAppNotifications(queryParams);
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      perPage: response.perPage || 10,
      lastPage: response.lastPage || 1,
    };
  },

  async getNotification(id: string): Promise<WhatsAppNotification> {
    return await getWhatsAppNotificationId(id);
  },

  async retryNotification(id: string): Promise<{ status: boolean; message: string }> {
    const response = await postWhatsAppNotificationIdRetry(id);
    return {
      status: !!response?.status,
      message: response?.message || 'Reenvio processado com sucesso'
    };
  },

  async listTemplates(): Promise<WhatsAppTemplate[]> {
    return await getWhatsAppTemplates();
  },

  async getSettings(): Promise<WhatsAppSettings[]> {
    return await getWhatsAppTenantSettings();
  },

  async updateSettings(tenantId: string, payload: WhatsAppSettings): Promise<WhatsAppSettings> {
    return await putWhatsAppTenantSettings(tenantId, payload);
  }
};
