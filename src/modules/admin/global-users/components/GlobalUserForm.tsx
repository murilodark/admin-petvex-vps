import React, { useState, useEffect } from 'react';
import { ShieldAlert, KeyRound, Check } from 'lucide-react';
import { GlobalUser, GlobalUserFormData } from '../types/global-user.types';
import { Button } from '../../../../shared/components/ui/Button';
import { Input } from '../../../../shared/components/ui/Input';
import { ApiErrorAlert } from '../../../../shared/components/ui/ApiErrorAlert';
import { apiErrorHelper } from '../../../../common/helpers/api-error.helper';

interface GlobalUserFormProps {
  initialData?: GlobalUser;
  onSubmit: (data: GlobalUserFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  loggedInUserId?: string;
}

export const GlobalUserForm: React.FC<GlobalUserFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
  loggedInUserId,
}) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState<GlobalUserFormData>({
    name: '',
    email: '',
    password: '',
    isGlobalAdmin: false,
    active: true,
  });

  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<any>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        email: initialData.email,
        password: '',
        isGlobalAdmin: initialData.isGlobalAdmin,
        active: initialData.active,
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome completo é obrigatório.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Endereço de e-mail é obrigatório.';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Insira um e-mail válido.';
    }

    if (!isEdit && !formData.password) {
      newErrors.password = 'A senha é obrigatória para novos usuários.';
    } else if (formData.password && formData.password.length < 6) {
      newErrors.password = 'A senha deve conter no mínimo 6 caracteres.';
    }

    if (formData.password && formData.password !== passwordConfirmation) {
      newErrors.passwordConfirmation = 'A confirmação de senha não coincide.';
    }

    // RULE: Preventing self role-revoke or deactivation
    if (isEdit && initialData?.id === loggedInUserId) {
      if (formData.isGlobalAdmin === false) {
        newErrors.isGlobalAdmin = 'Você não pode retirar seus próprios privilégios de Admin Global.';
      }
      if (formData.active === false) {
        newErrors.active = 'Você não pode desativar o seu próprio logon.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (err: any) {
      console.error('Error submitting global user form:', err);
      setApiError(err);
      const nestedErrors = apiErrorHelper.extractFormErrors(err);
      if (Object.keys(nestedErrors).length > 0) {
        setErrors(prev => ({
          ...prev,
          ...nestedErrors
        }));
      }
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6" id="global-user-form">
      {apiError && (
        <ApiErrorAlert error={apiError} onClear={() => setApiError(null)} />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Input
          id="user-name-input"
          label="Nome completo do usuário"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          placeholder="Ex: João da Silva Santos"
          disabled={isLoading}
        />

        <Input
          id="user-email-input"
          label="Endereço de e-mail institucional"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="Ex: joao.silva@petvex.com.br"
          disabled={isLoading}
        />
      </div>

      <div className="border border-slate-100 bg-slate-50/50 rounded-[4px] p-5" id="form-security-panel">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-4 w-4 text-teal-600" />
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">Definição de Segurança / Credenciais</h4>
        </div>
        
        {isEdit && (
          <p className="text-[10px] font-mono text-slate-400 uppercase mb-4" id="form-password-notice">
            Deixe o campo vazio caso não deseje redefinir a senha do usuário.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Input
            id="user-password-input"
            label="Senha de Acesso"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            error={errors.password}
            placeholder={isEdit ? "••••••••" : "No mínimo 6 dígitos"}
            disabled={isLoading}
          />

          <div className="w-full flex flex-col gap-1.5" id="confirm-password-container">
            <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Confirmar Senha</label>
            <input
              id="user-password-confirmation"
              type="password"
              value={passwordConfirmation}
              onChange={(e) => {
                setPasswordConfirmation(e.target.value);
                if (errors.passwordConfirmation) {
                  setErrors(prev => {
                    const copy = { ...prev };
                    delete copy.passwordConfirmation;
                    return copy;
                  });
                }
              }}
              className={`w-full px-3.5 py-2.5 border rounded-[4px] bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow ${errors.passwordConfirmation ? 'border-rose-500' : ''}`}
              placeholder={isEdit ? "••••••••" : "Redigite a senha de acesso"}
              disabled={isLoading}
            />
            {errors.passwordConfirmation && (
              <span className="text-xs text-rose-600 font-medium">{errors.passwordConfirmation}</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 border border-teal-100 bg-teal-50/10 rounded-[4px] space-y-4" id="form-roles-panel">
        <div className="flex items-center gap-2" id="panel-roles-head">
          <ShieldAlert className="h-4 w-4 text-teal-600" />
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-teal-800">Permissões de Escopo de Controle</h4>
        </div>

        <div className="flex flex-col gap-4">
          {/* Global Admin checkbox */}
          <div className="flex items-start gap-3" id="admin-checkbox-container">
            <input
              id="user-is-global-admin"
              name="isGlobalAdmin"
              type="checkbox"
              checked={formData.isGlobalAdmin}
              onChange={handleChange}
              disabled={isLoading || (isEdit && initialData?.id === loggedInUserId)}
              className="mt-1 h-4 w-4 text-teal-600 border-slate-300 rounded-sm focus:ring-teal-500 cursor-pointer disabled:opacity-50"
            />
            <div className="text-xs">
              <label htmlFor="user-is-global-admin" className="font-bold text-slate-900 cursor-pointer uppercase tracking-wider text-[11px]">
                Administrador Global (Dono de Sistema)
              </label>
              <p className="text-slate-400 mt-1 max-w-xl">
                O usuário terá acesso irrestrito ao painel <span className="font-mono text-xs">admin.petvex.com.br</span>, podendo gerenciar todos os planos, tenants, faturamento e contas corporativas.
              </p>
              {errors.isGlobalAdmin && (
                <span className="text-xs text-rose-600 font-medium block mt-1">{errors.isGlobalAdmin}</span>
              )}
            </div>
          </div>

          <hr className="border-teal-100" />

          {/* Active Checkbox */}
          <div className="flex items-start gap-3" id="active-checkbox-container">
            <input
              id="user-is-active"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={handleChange}
              disabled={isLoading || (isEdit && initialData?.id === loggedInUserId)}
              className="mt-1 h-4 w-4 text-teal-600 border-slate-300 rounded-sm focus:ring-teal-500 cursor-pointer disabled:opacity-50"
            />
            <div className="text-xs">
              <label htmlFor="user-is-active" className="font-bold text-slate-900 cursor-pointer uppercase tracking-wider text-[11px]">
                Logon Permitido (Ativo)
              </label>
              <p className="text-slate-400 mt-1 max-w-xl">
                Determina se este usuário poderá realizar login no ecossistema Petvex. Usuários inativos têm seu acesso bloqueado instantaneamente.
              </p>
              {errors.active && (
                <span className="text-xs text-rose-600 font-medium block mt-1">{errors.active}</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100" id="form-actions">
        <Button
          id="btn-cancel-user-form"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          id="btn-submit-user-form"
          type="submit"
          isLoading={isLoading}
        >
          {isEdit ? 'Salvar Alterações' : 'Cadastrar Usuário'}
        </Button>
      </div>
    </form>
  );
};
