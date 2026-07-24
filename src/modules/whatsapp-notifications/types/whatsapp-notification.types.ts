export type WhatsAppNotification = any;
export type WhatsAppTemplate = any;
export type WhatsAppSettings = any;

export interface ListWhatsAppNotificationsParams {
  status?: string;
  appointment_id?: string;
  client_id?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  perPage?: number;
}

export interface ListWhatsAppNotificationsResult {
  data: WhatsAppNotification[];
  total: number;
  page: number;
  perPage: number;
  lastPage: number;
}
