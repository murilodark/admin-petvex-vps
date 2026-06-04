import { z } from 'zod';
import { LoginCredentials } from '../../../core/http/generated/models/loginCredentials';

export type AuthCredentials = LoginCredentials;

export const loginSchema = z.object({
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
