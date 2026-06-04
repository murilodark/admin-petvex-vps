import React, { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { Tenant, TenantFormData } from '../types/tenant.types';
import { tenantCadastroSchema, tenantEdicaoSchema } from '../schemas/tenant.schema';

interface TenantFormProps {
  tenant?: Tenant; // If present, we are in Edit mode
  onSubmit: (data: TenantFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const TenantForm: React.FC<TenantFormProps> = ({
  tenant,
  onSubmit,
  onCancel,
  isSubmitting,
}) => {
  const isEdit = !!tenant;
  
  const [formData, setFormData] = useState<TenantFormData>({
    name: tenant?.name || '',
    email: tenant?.email || '',
    password: '',
    confirmPassword: '',
    documento: tenant?.documento || '',
    telefone: tenant?.telefone || '',
    status: tenant?.status || 'active',
    plano: tenant?.plano || 'Starter',
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<{ message: string; fields?: Record<string, string[]> } | null>(null);

  const handleInputChange = (field: keyof TenantFormData, value: string) => {
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

    const schema = isEdit ? tenantEdicaoSchema : tenantCadastroSchema;
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
      console.error('Submit form error in UI:', err);
      const response = err?.response;
      if (response && response.status === 422 && response.data) {
        const msg = response.data.message || 'Erro de validação dos dados enviados.';
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
          message: err?.message || 'Ocorreu um erro ao salvar o registro de tenant.',
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" id="tenant-form-element">
      {apiError ? (
        <div className="p-4 bg-rose-50 border border-rose-250 text-rose-800 rounded-[4px] text-xs flex gap-3 items-start animate-fade-in" id="form-api-error-alert">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5" id="form-fields-grid">
        <Input
          id="field-name"
          label="Razão Social / Nome de Exibição"
          placeholder="Ex: Clínica Veterinária Planeta Vet"
          value={formData.name}
          onChange={(e: any) => handleInputChange('name', e.target.value)}
          error={fieldErrors.name}
        />

        <Input
          id="field-email"
          label="E-mail de Login do Tenant"
          type="email"
          placeholder="Ex: contato@planetavet.com.br"
          value={formData.email}
          onChange={(e: any) => handleInputChange('email', e.target.value)}
          error={fieldErrors.email}
          disabled={isEdit}
        />

        <Input
          id="field-documento"
          label="CNPJ / CPF do Cliente"
          placeholder="Ex: 11.222.333/0001-44 ou 123.456.789-00"
          value={formData.documento}
          onChange={(e: any) => handleInputChange('documento', e.target.value)}
          error={fieldErrors.documento}
        />

        <Input
          id="field-telefone"
          label="Telefone de Contato"
          placeholder="Ex: (11) 98888-7777"
          value={formData.telefone}
          onChange={(e: any) => handleInputChange('telefone', e.target.value)}
          error={fieldErrors.telefone}
        />

        <div className="flex flex-col gap-1.5" id="field-status-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Status do Tenant
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive')}
            className="w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-205 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-bold uppercase tracking-wider cursor-pointer h-[38px]"
          >
            <option value="active">ATIVO (PERMISSÃO TOTAL)</option>
            <option value="inactive">INATIVO (DENEGADO)</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5" id="field-plano-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Plano SaaS do Tenant
          </label>
          <select
            value={formData.plano}
            onChange={(e) => handleInputChange('plano', e.target.value)}
            className="w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-205 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-bold uppercase tracking-wider cursor-pointer h-[38px]"
          >
            <option value="Starter">STARTER</option>
            <option value="Pro">PRO (ESPECIALIZADO)</option>
            <option value="Enterprise">ENTERPRISE (AVANÇADO)</option>
          </select>
        </div>

        {!isEdit ? (
          <>
            <Input
              id="field-password"
              label="Senha de Acesso Inicial"
              type="password"
              placeholder="Digite a senha temporária"
              value={formData.password}
              onChange={(e: any) => handleInputChange('password', e.target.value)}
              error={fieldErrors.password}
            />

            <Input
              id="field-confirmPassword"
              label="Confirme a Senha"
              type="password"
              placeholder="Digite a mesma senha novamente"
              value={formData.confirmPassword}
              onChange={(e: any) => handleInputChange('confirmPassword', e.target.value)}
              error={fieldErrors.confirmPassword}
            />
          </>
        ) : null}
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100" id="form-actions-footer">
        <Button
          id="btn-form-cancel"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          CANCELAR
        </Button>
        <Button
          id="btn-form-submit"
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
