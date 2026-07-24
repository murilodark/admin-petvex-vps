import { WhatsAppNotification } from '../types/whatsapp-notification.types';

export interface UIWhatsAppNotification {
  id: string;
  tenantId: string;
  clientId: string;
  appointmentId: string;
  phone: string;
  templateKey: string;
  status: string;
  error: string;
  payload: Record<string, any>;
  metaMessageId: string;
  sentAt: string;
  deliveredAt: string;
  readAt: string;
  failedAt: string;
  createdAt: string;
  updatedAt: string;
  tenant?: {
    id?: string;
    name?: string;
    email?: string;
  };
  client?: {
    id?: string;
    name?: string;
  };
  pet?: {
    id?: string;
    name?: string;
  };
  appointment?: {
    id?: string;
    date?: string;
  };
}

export const whatsappNotificationMapper = {
  toUI(apiData: WhatsAppNotification): UIWhatsAppNotification {
    return {
      id: apiData.id || '',
      tenantId: apiData.tenant_id || '',
      clientId: apiData.client_id || '',
      appointmentId: apiData.appointment_id || '',
      phone: apiData.phone || '',
      templateKey: apiData.template_key || '',
      status: apiData.status || 'pending',
      error: apiData.error || '',
      payload: apiData.payload || {},
      metaMessageId: apiData.meta_message_id || '',
      sentAt: apiData.sent_at || '',
      deliveredAt: apiData.delivered_at || '',
      readAt: apiData.read_at || '',
      failedAt: apiData.failed_at || '',
      createdAt: apiData.created_at || '',
      updatedAt: apiData.updated_at || '',
      tenant: apiData.tenant ? {
        id: apiData.tenant.id,
        name: apiData.tenant.name,
        email: apiData.tenant.email
      } : undefined,
      client: (apiData as any).client ? {
        id: (apiData as any).client.id || '',
        name: (apiData as any).client.name || ''
      } : undefined,
      pet: (apiData as any).pet ? {
        id: (apiData as any).pet.id || '',
        name: (apiData as any).pet.name || ''
      } : undefined,
      appointment: (apiData as any).appointment ? {
        id: (apiData as any).appointment.id || '',
        date: (apiData as any).appointment.date || ''
      } : undefined,
    };
  },

  toUIList(apiList?: WhatsAppNotification[]): UIWhatsAppNotification[] {
    if (!apiList) return [];
    return apiList.map(item => this.toUI(item));
  }
};
