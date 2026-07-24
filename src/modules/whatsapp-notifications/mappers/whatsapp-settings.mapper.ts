import { WhatsAppSettings } from '../types/whatsapp-notification.types';

export interface UIWhatsAppSettings {
  appointmentReminderConfirmation: boolean;
}

export const whatsappSettingsMapper = {
  toUI(apiData: WhatsAppSettings): UIWhatsAppSettings {
    return {
      appointmentReminderConfirmation: !!apiData.appointment_reminder_confirmation,
    };
  },

  toApi(uiData: UIWhatsAppSettings): WhatsAppSettings {
    return {
      appointment_reminder_confirmation: uiData.appointmentReminderConfirmation,
    };
  }
};
