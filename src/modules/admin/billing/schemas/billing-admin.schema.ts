import { z } from 'zod';

export const SuspendSubscriptionSchema = z.object({
  reason: z.string().min(5, 'A justificativa de suspensão deve conter no mínimo 5 caracteres.').max(255, 'Limite de 255 caracteres.'),
});

export const CancelSubscriptionSchema = z.object({
  reason: z.string().min(5, 'O motivo do cancelamento deve conter no mínimo 5 caracteres.').max(255, 'Limite de 255 caracteres.'),
});

export type SuspendSubscriptionFormData = z.infer<typeof SuspendSubscriptionSchema>;
export type CancelSubscriptionFormData = z.infer<typeof CancelSubscriptionSchema>;
