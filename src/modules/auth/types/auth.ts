import { z } from 'zod';
import { AdminLoginRequest } from '../../../core/http/generated/models/admin-auth';

export type AuthCredentials = AdminLoginRequest;

export const loginSchema = z.object({
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
