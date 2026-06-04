import { z } from 'zod';

export const userCadastroSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter de 6 a 100 caracteres'),
  password_confirmation: z.string().min(1, 'Confirmação de senha é obrigatória'),
  role: z.string().optional(),
  active: z.boolean(),
  phone: z.string().optional(),
  document: z.string().optional(),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'As senhas não coincidem',
  path: ['password_confirmation'],
});

export const userEdicaoSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  password: z.string().optional(),
  password_confirmation: z.string().optional(),
  role: z.string().optional(),
  active: z.boolean(),
  phone: z.string().optional(),
  document: z.string().optional(),
}).refine((data) => {
  if (data.password && data.password || data.password_confirmation) {
    return data.password === data.password_confirmation;
  }
  return true;
}, {
  message: 'As senhas não coincidem',
  path: ['password_confirmation'],
});
