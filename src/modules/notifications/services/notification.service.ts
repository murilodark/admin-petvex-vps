import {
  getNotificationTemplateStats,
  getNotificationTemplates,
  postNotificationTemplate,
  getNotificationTemplate,
  putNotificationTemplate,
  deleteNotificationTemplate,
  patchNotificationTemplateActivate,
  patchNotificationTemplateDeactivate,
  getNotificationTemplateTenantBlocks,
  postNotificationTemplateTenantBlock,
  deleteNotificationTemplateTenantBlock,
  getNotificationDispatchStats,
  getNotificationDispatches,
  getNotificationDispatch,
} from '../../../core/http/generated/endpoints/default/default';
import {
  NotificationTemplate,
  NotificationDispatch,
  TenantBlock,
  NotificationTemplateStats,
  NotificationDispatchStats,
  CreateNotificationTemplatePayload,
  UpdateNotificationTemplatePayload,
  CreateTenantBlockPayload,
  GetNotificationTemplatesParams,
  GetNotificationDispatchesParams,
} from '../../../core/http/generated/models';
import { ListTemplatesParams, ListDispatchesParams } from '../types/notification';

export const notificationService = {
  async listTemplates(filters?: ListTemplatesParams): Promise<{
    data: NotificationTemplate[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  }> {
    const params: GetNotificationTemplatesParams = {};
    if (filters) {
      if (filters.module && filters.module !== 'all') params.module = filters.module;
      if (filters.event && filters.event !== 'all') params.event = filters.event;
      if (filters.channel && filters.channel !== 'all') params.channel = filters.channel;
      if (filters.send_type && filters.send_type !== 'all') params.send_type = filters.send_type;
      if (filters.is_active !== undefined) params.is_active = filters.is_active;
      if (filters.is_default !== undefined) params.is_default = filters.is_default;
      if (filters.search) params.search = filters.search;
      if (filters.page) params.page = filters.page;
      if (filters.perPage) params.perPage = filters.perPage;
    }

    const response = await getNotificationTemplates(params);
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      perPage: response.perPage || 10,
      lastPage: response.lastPage || 1,
    };
  },

  async getTemplate(id: string): Promise<NotificationTemplate> {
    return await getNotificationTemplate(id);
  },

  async createTemplate(payload: CreateNotificationTemplatePayload): Promise<NotificationTemplate> {
    return await postNotificationTemplate(payload);
  },

  async updateTemplate(id: string, payload: UpdateNotificationTemplatePayload): Promise<NotificationTemplate> {
    return await putNotificationTemplate(id, payload);
  },

  async deleteTemplate(id: string): Promise<{ status?: boolean; message?: string }> {
    return await deleteNotificationTemplate(id);
  },

  async activateTemplate(id: string): Promise<NotificationTemplate> {
    return await patchNotificationTemplateActivate(id);
  },

  async deactivateTemplate(id: string): Promise<NotificationTemplate> {
    return await patchNotificationTemplateDeactivate(id);
  },

  async getTemplateStats(): Promise<NotificationTemplateStats> {
    return await getNotificationTemplateStats();
  },

  async listTenantBlocks(templateId: string): Promise<TenantBlock[]> {
    return await getNotificationTemplateTenantBlocks(templateId);
  },

  async blockTenant(templateId: string, payload: CreateTenantBlockPayload): Promise<TenantBlock> {
    return await postNotificationTemplateTenantBlock(templateId, payload);
  },

  async unblockTenant(templateId: string, blockId: string): Promise<{ status?: boolean; message?: string }> {
    return await deleteNotificationTemplateTenantBlock(templateId, blockId);
  },

  async listDispatches(filters?: ListDispatchesParams): Promise<{
    data: NotificationDispatch[];
    total: number;
    page: number;
    perPage: number;
    lastPage: number;
  }> {
    const params: GetNotificationDispatchesParams = {};
    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.tenant_id) params.tenant_id = filters.tenant_id;
      if (filters.notification_template_id) params.notification_template_id = filters.notification_template_id;
      if (filters.module && filters.module !== 'all') params.module = filters.module;
      if (filters.event && filters.event !== 'all') params.event = filters.event;
      if (filters.channel && filters.channel !== 'all') params.channel = filters.channel;
      if (filters.send_type && filters.send_type !== 'all') params.send_type = filters.send_type;
      if (filters.status && filters.status !== 'all') params.status = filters.status;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.page) params.page = filters.page;
      if (filters.perPage) params.perPage = filters.perPage;
    }

    const response = await getNotificationDispatches(params);
    return {
      data: response.data || [],
      total: response.total || 0,
      page: response.page || 1,
      perPage: response.perPage || 10,
      lastPage: response.lastPage || 1,
    };
  },

  async getDispatch(id: string): Promise<NotificationDispatch> {
    return await getNotificationDispatch(id);
  },

  async getDispatchStats(): Promise<NotificationDispatchStats> {
    return await getNotificationDispatchStats();
  },
};
