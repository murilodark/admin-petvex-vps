import { z } from 'zod';

export const notificationTemplateSchema = z.object({
  key: z.string().min(2, 'A chave do template deve ter pelo menos 2 caracteres'),
  name: z.string().min(2, 'O nome do template deve ter pelo menos 2 caracteres'),
  description: z.string().optional(),
  module: z.enum(['appointments', 'clients', 'sales', 'billing', 'stock', 'system'], {
    message: 'Selecione um módulo válido',
  }),
  event: z.enum(['confirmation', 'cancellation', 'reminder', 'payment_pending', 'sale_finished', 'custom'], {
    message: 'Selecione um evento válido',
  }),
  channel: z.enum(['whatsapp_manual', 'email', 'sms', 'push', 'system'], {
    message: 'Selecione um canal válido',
  }),
  send_type: z.enum(['manual', 'automatic', 'both'], {
    message: 'Selecione um tipo de envio válido',
  }),
  subject: z.string().optional().or(z.literal('')),
  body: z.string().min(5, 'O conteúdo (corpo) deve ter pelo menos 5 caracteres'),
  variables: z.array(z.string()).default([]),
  is_active: z.boolean().default(true),
  is_default: z.boolean().default(false),
}).refine((data) => {
  if (data.channel === 'email' && (!data.subject || data.subject.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: 'O assunto é obrigatório para o canal de E-mail',
  path: ['subject'],
});

export type NotificationTemplateSchemaInput = z.infer<typeof notificationTemplateSchema>;
