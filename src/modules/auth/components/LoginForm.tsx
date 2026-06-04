import React, { useState } from 'react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { loginSchema, LoginFormData } from '../types/auth';
import { authService } from '../services/auth.service';

interface LoginFormProps {
  onSuccess: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<LoginFormData>({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setApiError(null);

    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      await authService.authenticate(formData);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Falha na autenticação. Verifique suas credenciais.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
      {apiError ? (
        <div id="login-api-error" className="p-3.5 bg-rose-50 border border-rose-100 rounded-lg text-sm text-rose-700 font-medium">
          {apiError}
        </div>
      ) : null}

      <Input
        id="login-email"
        name="email"
        type="email"
        label="E-mail corporativo"
        placeholder="nome@petvex.com.br"
        value={formData.email}
        disabled={isLoading}
        onChange={handleChange}
        error={errors.email}
      />

      <Input
        id="login-password"
        name="password"
        type="password"
        label="Senha de acesso"
        placeholder="••••••••"
        value={formData.password}
        disabled={isLoading}
        onChange={handleChange}
        error={errors.password}
      />

      <div className="pt-2">
        <Button
          id="login-submit"
          type="submit"
          className="w-full flex justify-center py-2.5"
          isLoading={isLoading}
        >
          Entrar no Painel Global
        </Button>
      </div>
    </form>
  );
};
