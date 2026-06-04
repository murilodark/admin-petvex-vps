import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../../../../shared/components/ui/Button';
import { Input } from '../../../../../shared/components/ui/Input';
import { TenantUser, TenantUserFormData } from '../types/tenant-user.types';
import { userCadastroSchema, userEdicaoSchema } from '../schemas/tenant-user.schema';

interface TenantUserFormProps {
  user?: TenantUser; // present if editing
  onSubmit: (data: TenantUserFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const TenantUserForm: React.FC<TenantUserFormProps> = ({
  user,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const isEdit = !!user;

  const [formData, setFormData] = useState<TenantUserFormData>({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    password_confirmation: '',
    role: user?.role || 'user',
    active: user?.active !== false,
    phone: user?.phone || '',
    document: user?.document || '',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<{ message: string; fields?: Record<string, string[]> } | null>(null);

  const handleInputChange = (field: keyof TenantUserFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});
    setApiError(null);

    const schema = isEdit ? userEdicaoSchema : userCadastroSchema;
    const validationResult = schema.safeParse(formData);

    if (!validationResult.success) {
      const errors: Record<string, string> = {};
      validationResult.error.issues.forEach((issue) => {
        const path = issue.path[0]?.toString();
        if (path) {
          errors[path] = issue.message;
        }
      });
      setFieldErrors(errors);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      console.error('Submit user form error in UI:', err);
      const response = err?.response;
      if (response && response.status === 422 && response.data) {
        const msg = response.data.message || 'Erro de validação dos dados de usuário.';
        const errs = response.data.errors || {};

        setApiError({
          message: msg,
          fields: errs,
        });

        const mappedErrors: Record<string, string> = {};
        Object.entries(errs).forEach(([key, value]) => {
          if (Array.isArray(value) && value[0]) {
            mappedErrors[key] = value[0];
          }
        });
        setFieldErrors((prev) => ({ ...prev, ...mappedErrors }));
      } else {
        setApiError({
          message: err?.message || 'Ocorreu um erro ao salvar o registro de usuário.',
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="tenant-user-form-element">
      {apiError ? (
        <div className="p-4 bg-rose-50 border border-rose-250 text-rose-800 rounded-[4px] text-xs flex gap-3 items-start animate-fade-in" id="user-form-api-error-alert">
          <AlertCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-extrabold uppercase tracking-wider text-[11px]">{apiError.message}</p>
            {apiError.fields ? (
              <ul className="list-disc pl-4 space-y-1 mt-1 font-mono text-[10px]">
                {Object.entries(apiError.fields).map(([field, errs]) => (
                  <li key={field}>
                    <span className="font-bold uppercase bg-rose-100 px-1 py-0.5 rounded text-rose-900 mr-1">{field}:</span>
                    {Array.isArray(errs) ? errs.join(', ') : String(errs)}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="user-form-fields-grid">
        <Input
          id="user-field-name"
          label="Nome Completo"
          placeholder="Ex: João da Silva Santos"
          value={formData.name}
          onChange={(e: any) => handleInputChange('name', e.target.value)}
          error={fieldErrors.name}
        />

        <Input
          id="user-field-email"
          label="E-mail de Login"
          type="email"
          placeholder="Ex: joao.santos@planetavet.com.br"
          value={formData.email}
          onChange={(e: any) => handleInputChange('email', e.target.value)}
          error={fieldErrors.email}
          disabled={isEdit}
        />

        <Input
          id="user-field-phone"
          label="Telefone de Contato"
          placeholder="Ex: (11) 98888-7777"
          value={formData.phone}
          onChange={(e: any) => handleInputChange('phone', e.target.value)}
          error={fieldErrors.phone}
        />

        <Input
          id="user-field-document"
          label="CPF do Usuário"
          placeholder="Ex: 123.456.789-00"
          value={formData.document}
          onChange={(e: any) => handleInputChange('document', e.target.value)}
          error={fieldErrors.document}
        />

        <div className="flex flex-col gap-1.5" id="user-field-role-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Cargo / Perfil de Acesso
          </label>
          <select
            value={formData.role}
            onChange={(e) => handleInputChange('role', e.target.value)}
            className="w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-205 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-bold uppercase tracking-wider cursor-pointer h-[38px]"
          >
            <option value="user">USER (CONSULTA / OPERADOR)</option>
            <option value="manager">MANAGER (GERENTE / CLINICA)</option>
            <option value="admin">ADMIN (ADMINISTRADOR MASTER)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5" id="user-field-active-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Status Operativo
          </label>
          <select
            value={formData.active ? 'true' : 'false'}
            onChange={(e) => handleInputChange('active', e.target.value === 'true')}
            className="w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-205 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-bold uppercase tracking-wider cursor-pointer h-[38px]"
          >
            <option value="true">ATIVO (PERMISSÃO CONCEDIDA)</option>
            <option value="false">INATIVO (ACESSO BLOQUEADO)</option>
          </select>
        </div>

        {/* Password fields - required on creates, optional on updates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 col-span-1 md:col-span-2 border-t border-slate-100 pt-5 mt-2" id="user-pass-section">
          <div className="col-span-1 md:col-span-2">
            <h4 className="text-[11px] font-extrabold uppercase tracking-wider text-slate-900">
              {isEdit ? 'ALTERAR SENHA (OPCIONAL)' : 'SENHA DE PRIMEIRO ACESSO'}
            </h4>
            <p className="text-[9px] text-slate-400 font-mono uppercase mt-0.5">
              {isEdit ? 'DEIXE EM BRANCO PARA MANTER A SENHA ATUAL DO USUÁRIO' : 'DIGITE A SENHA INICIAL QUE O USUÁRIO FORNECERÁ NO LOGIN'}
            </p>
          </div>

          <Input
            id="user-field-password"
            label="Senha"
            type="password"
            placeholder={isEdit ? "Nova senha (opcional)" : "Digite a senha"}
            value={formData.password}
            onChange={(e: any) => handleInputChange('password', e.target.value)}
            error={fieldErrors.password}
          />

          <Input
            id="user-field-password-confirmation"
            label="Confirme a Senha"
            type="password"
            placeholder={isEdit ? "Confirme a nova senha (opcional)" : "Repita a senha"}
            value={formData.password_confirmation}
            onChange={(e: any) => handleInputChange('password_confirmation', e.target.value)}
            error={fieldErrors.password_confirmation}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100" id="user-form-actions-footer">
        <Button
          id="btn-user-form-cancel"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          CANCELAR
        </Button>
        <Button
          id="btn-user-form-submit"
          type="submit"
          variant="primary"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'SALVANDO...' : 'SALVAR DADOS'}
        </Button>
      </div>
    </form>
  );
};
