import { NotificationTemplate, NotificationDispatch, TenantBlock } from '../../../core/http/generated/models';

export interface UINotificationTemplate {
  id: string;
  key: string;
  name: string;
  description: string;
  module: string;
  event: string;
  channel: string;
  sendType: string;
  subject: string;
  body: string;
  variables: string[];
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UINotificationDispatch {
  id: string;
  tenantId: string;
  notificationTemplateId: string;
  module: string;
  event: string;
  channel: string;
  recipient: string;
  contact: string;
  status: string;
  subject: string;
  body: string;
  errorMessage: string;
  payload: any;
  createdAt: string;
  sentAt: string;
  tenant?: any;
  template?: any;
}

export const notificationMapper = {
  toUITemplate(apiData: NotificationTemplate): UINotificationTemplate {
    return {
      id: apiData.id || '',
      key: apiData.key || '',
      name: apiData.name || '',
      description: apiData.description || '',
      module: apiData.module || '',
      event: apiData.event || '',
      channel: apiData.channel || '',
      sendType: apiData.send_type || '',
      subject: apiData.subject || '',
      body: apiData.body || '',
      variables: apiData.variables || [],
      isActive: !!apiData.is_active,
      isDefault: !!apiData.is_default,
      createdAt: apiData.created_at || '',
      updatedAt: apiData.updated_at || '',
    };
  },

  toUITemplatesList(apiList?: NotificationTemplate[]): UINotificationTemplate[] {
    if (!apiList) return [];
    return apiList.map((item) => this.toUITemplate(item));
  },

  toUIDispatch(apiData: NotificationDispatch): UINotificationDispatch {
    return {
      id: apiData.id || '',
      tenantId: apiData.tenant_id || '',
      notificationTemplateId: apiData.notification_template_id || '',
      module: apiData.module || '',
      event: apiData.event || '',
      channel: apiData.channel || '',
      recipient: apiData.recipient || '',
      contact: apiData.contact || '',
      status: apiData.status || '',
      subject: apiData.subject || '',
      body: apiData.body || '',
      errorMessage: apiData.error_message || '',
      payload: apiData.payload || {},
      createdAt: apiData.created_at || '',
      sentAt: apiData.sent_at || '',
      tenant: apiData.tenant,
      template: apiData.template,
    };
  },

  toUIDispatchesList(apiList?: NotificationDispatch[]): UINotificationDispatch[] {
    if (!apiList) return [];
    return apiList.map((item) => this.toUIDispatch(item));
  },
};
