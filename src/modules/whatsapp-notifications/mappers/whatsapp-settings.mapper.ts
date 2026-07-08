import { WhatsAppSettings } from '../../../core/http/generated/models';

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
