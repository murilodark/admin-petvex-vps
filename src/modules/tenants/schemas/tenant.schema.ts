import { z } from 'zod';

export const tenantCadastroSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Insira um e-mail válido'),
  password: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Como confirmação, digite a mesma senha'),
  documento: z.string().optional(),
  telefone: z.string().optional(),
  status: z.enum(['active', 'inactive']).default('active'),
  plano: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const tenantEdicaoSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  email: z.string().email('Insira um e-mail válido'),
  documento: z.string().optional(),
  telefone: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  plano: z.string().optional(),
});
