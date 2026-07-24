import {
  getAdminWhatsappNotification,
  listAdminWhatsappNotifications,
  listAdminWhatsappTemplates,
  retryAdminWhatsappNotificationRetry,
  updateAdminWhatsappTenantSetting,
} from '../../../core/http/generated/endpoints/admin-whats-app/admin-whats-app';
import {
  UpdateTenantWhatsappSettingsRequest,
} from '../../../core/http/generated/models/admin-whats-app';
import {
  WhatsAppNotification,
  WhatsAppTemplate,
  WhatsAppSettings,
  ListWhatsAppNotificationsParams,
  ListWhatsAppNotificationsResult,
} from '../types/whatsapp-notification.types';
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

    const response = (await listAdminWhatsappNotifications(queryParams)) as any;
    
    const notificationsArray: WhatsAppNotification[] = Array.isArray(response?.data) ? response.data : [];
    const meta = response?.meta && typeof response.meta === 'object' ? response.meta : undefined;

    const total = Number(meta?.total ?? notificationsArray.length);
    const page = Number(meta?.current_page ?? filters.page ?? 1);
    const perPage = Number(meta?.per_page ?? filters.perPage ?? 10);
    const lastPage = Number(meta?.last_page ?? 1);

    return {
      data: notificationsArray,
      total,
      page,
      perPage,
      lastPage,
    };
  },

  async getNotification(id: string): Promise<WhatsAppNotification> {
    const response = await getAdminWhatsappNotification(Number(id));
    
    let apiNotification: WhatsAppNotification;
    if (response && typeof response === 'object' && 'data' in response) {
      apiNotification = (response.data as unknown as WhatsAppNotification);
    } else {
      apiNotification = (response as unknown as WhatsAppNotification);
    }
    
    return apiNotification;
  },

  async retryNotification(id: string): Promise<{ status: boolean; message: string }> {
    const response = await retryAdminWhatsappNotificationRetry(Number(id));
    return {
      status: !!response?.status,
      message: response?.message || 'Reenvio processado com sucesso'
    };
  },

  async listTemplates(): Promise<WhatsAppTemplate[]> {
    const response = await listAdminWhatsappTemplates();
    
    let templates: WhatsAppTemplate[] = [];
    if (response && typeof response === 'object') {
      if ('data' in response && Array.isArray(response.data)) {
        templates = response.data as unknown as WhatsAppTemplate[];
      } else if (Array.isArray(response)) {
        templates = response as unknown as WhatsAppTemplate[];
      }
    }
    return templates;
  },

  async getSettings(): Promise<WhatsAppSettings[]> {
    return [];
  },

  async updateSettings(tenantId: string, payload: WhatsAppSettings): Promise<WhatsAppSettings> {
    await updateAdminWhatsappTenantSetting(Number(tenantId), payload as unknown as UpdateTenantWhatsappSettingsRequest);
    return payload;
  }
};
