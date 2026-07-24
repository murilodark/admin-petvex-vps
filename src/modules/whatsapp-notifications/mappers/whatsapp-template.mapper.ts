import { WhatsAppTemplate } from '../types/whatsapp-notification.types';

export interface UIWhatsAppTemplate {
  key: string;
  name: string;
  metaTemplateName: string;
  language: string;
  category: string;
  description: string;
  components: any[];
  isActive: boolean;
}

export const whatsappTemplateMapper = {
  toUI(apiData: WhatsAppTemplate): UIWhatsAppTemplate {
    return {
      key: apiData.key || '',
      name: apiData.name || '',
      metaTemplateName: apiData.meta_template_name || '',
      language: apiData.language || '',
      category: apiData.category || '',
      description: apiData.description || '',
      components: apiData.components || [],
      isActive: !!apiData.is_active,
    };
  },

  toUIList(apiList?: WhatsAppTemplate[]): UIWhatsAppTemplate[] {
    if (!apiList) return [];
    return apiList.map(item => this.toUI(item));
  }
};
