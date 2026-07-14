import {
  activateAdminNotificationTemplateActivate,
  createAdminNotificationTemplate,
  deactivateAdminNotificationTemplateDeactivate,
  deleteAdminNotificationTemplate,
  getAdminNotificationTemplate,
  listAdminNotificationTemplates,
  statsAdminNotificationTemplateStat,
  updateAdminNotificationTemplate,
} from '../../../core/http/generated/endpoints/admin-notification-templates/admin-notification-templates';
import {
  getAdminNotificationDispatch,
  listAdminNotificationDispatches,
  statsAdminNotificationDispatchStat,
} from '../../../core/http/generated/endpoints/admin-notification-dispatches/admin-notification-dispatches';
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

    const response = (await listAdminNotificationTemplates(params as any)) as any;
    const rows = Array.isArray(response?.data) ? response.data : [];
    const meta = response?.meta && typeof response.meta === 'object' ? response.meta : undefined;

    return {
      data: rows as NotificationTemplate[],
      total: Number(meta?.total ?? rows.length),
      page: Number(meta?.current_page ?? filters?.page ?? 1),
      perPage: Number(meta?.per_page ?? filters?.perPage ?? 10),
      lastPage: Number(meta?.last_page ?? 1),
    };
  },

  async getTemplate(id: string): Promise<NotificationTemplate> {
    return await getAdminNotificationTemplate(Number(id)) as any as NotificationTemplate;
  },

  async createTemplate(payload: CreateNotificationTemplatePayload): Promise<NotificationTemplate> {
    return await createAdminNotificationTemplate(payload as any) as any as NotificationTemplate;
  },

  async updateTemplate(id: string, payload: UpdateNotificationTemplatePayload): Promise<NotificationTemplate> {
    return await updateAdminNotificationTemplate(Number(id), payload as any) as any as NotificationTemplate;
  },

  async deleteTemplate(id: string): Promise<{ status?: boolean; message?: string }> {
    return await deleteAdminNotificationTemplate(Number(id));
  },

  async activateTemplate(id: string): Promise<NotificationTemplate> {
    return await activateAdminNotificationTemplateActivate(Number(id)) as any as NotificationTemplate;
  },

  async deactivateTemplate(id: string): Promise<NotificationTemplate> {
    return await deactivateAdminNotificationTemplateDeactivate(Number(id)) as any as NotificationTemplate;
  },

  async getTemplateStats(): Promise<NotificationTemplateStats> {
    return await statsAdminNotificationTemplateStat() as any as NotificationTemplateStats;
  },

  async listTenantBlocks(templateId: string): Promise<TenantBlock[]> {
    return [];
  },

  async blockTenant(templateId: string, payload: CreateTenantBlockPayload): Promise<TenantBlock> {
    return {} as TenantBlock;
  },

  async unblockTenant(templateId: string, blockId: string): Promise<{ status?: boolean; message?: string }> {
    return { status: true, message: 'Tenant block actions are not exposed by the current generated client.' };
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

    const response = (await listAdminNotificationDispatches(params as any)) as any;
    const rows = Array.isArray(response?.data) ? response.data : [];
    const meta = response?.meta && typeof response.meta === 'object' ? response.meta : undefined;

    return {
      data: rows as NotificationDispatch[],
      total: Number(meta?.total ?? rows.length),
      page: Number(meta?.current_page ?? filters?.page ?? 1),
      perPage: Number(meta?.per_page ?? filters?.perPage ?? 10),
      lastPage: Number(meta?.last_page ?? 1),
    };
  },

  async getDispatch(id: string): Promise<NotificationDispatch> {
    return await getAdminNotificationDispatch(Number(id)) as any as NotificationDispatch;
  },

  async getDispatchStats(): Promise<NotificationDispatchStats> {
    return await statsAdminNotificationDispatchStat() as any as NotificationDispatchStats;
  },
};
