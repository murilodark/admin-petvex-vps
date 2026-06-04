import React, { useState, useEffect } from 'react';
import { tenantsService } from '../../../tenants/services/tenants.service';
import { Tenant } from '../../../tenants/types/tenant.types';
import { GlobalUserTenantAccess, GlobalUserTenantAccessFormData } from '../types/global-user.types';
import { Button } from '../../../../shared/components/ui/Button';

interface GlobalUserTenantAccessFormProps {
  initialAccess?: GlobalUserTenantAccess;
  onSubmit: (formData: GlobalUserTenantAccessFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
  userId: string;
}

export const GlobalUserTenantAccessForm: React.FC<GlobalUserTenantAccessFormProps> = ({
  initialAccess,
  onSubmit,
  onCancel,
  isLoading,
  userId,
}) => {
  const isEdit = !!initialAccess;
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  const [formData, setFormData] = useState<GlobalUserTenantAccessFormData>({
    tenantId: '',
    role: 'user',
    active: true,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit) {
      const fetchTenants = async () => {
        try {
          setLoadingTenants(true);
          const res = await tenantsService.listarTenants({ perPage: 100 });
          if (res?.data) {
            setTenants(res.data);
            if (res.data.length > 0) {
              setFormData(prev => ({ ...prev, tenantId: res.data[0].id }));
            }
          }
        } catch (err) {
          console.error('Failed to load tenants inside tenant access form', err);
        } finally {
          setLoadingTenants(false);
        }
      };
      fetchTenants();
    } else {
      setFormData({
        tenantId: initialAccess.tenantId,
        role: initialAccess.role,
        active: initialAccess.active,
      });
    }
  }, [initialAccess, isEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked as boolean) : value,
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.tenantId) {
      setError('Selecione um tenant parceiro para realizar o vínculo.');
      return;
    }

    try {
      await onSubmit(formData);
    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao salvar o vínculo de acesso.');
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-5" id="tenant-access-form">
      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-700 text-xs p-3.5 rounded-[4px] font-medium" id="access-form-error">
          {error}
        </div>
      )}

      {/* Tenant Input/Select */}
      <div className="flex flex-col gap-1.5" id="form-access-tenant-container">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">SaaS Tenant Parceiro</label>
        {isEdit ? (
          <div className="w-full px-4 py-3 border border-slate-200 bg-slate-50 text-xs rounded-[4px] font-bold text-slate-700 font-sans shadow-sm">
            {initialAccess?.tenantName} <span className="font-mono text-[10px] text-slate-400">({initialAccess?.tenantSlug || initialAccess?.tenantId})</span>
          </div>
        ) : (
          <select
            id="access-tenant-select"
            name="tenantId"
            value={formData.tenantId}
            onChange={handleChange}
            disabled={loadingTenants || isLoading}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-800 font-bold disabled:opacity-50"
          >
            {loadingTenants ? (
              <option>Puxando clínicas...</option>
            ) : tenants.length === 0 ? (
              <option value="">Não há tenants cadastrados</option>
            ) : (
              tenants.map(t => (
                <option key={t.id} value={t.id}>{t.name} (/{t.documento?.replace(/[^\w]/g, '').toLowerCase() || t.id})</option>
              ))
            )}
          </select>
        )}
      </div>

      {/* Role and Status inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="flex flex-col gap-1.5" id="form-access-role-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Perfil Operacional no Tenant</label>
          <select
            id="access-role-select"
            name="role"
            value={formData.role}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all text-slate-700 font-medium"
          >
            <option value="user">Colaborador padrão (User)</option>
            <option value="manager">Gerente da clínica (Manager)</option>
            <option value="owner">Proprietário da conta (Owner)</option>
          </select>
        </div>

        <div className="flex flex-col justify-end pb-3 pl-1" id="form-access-active-container">
          <div className="flex items-center gap-2">
            <input
              id="access-active-checkbox"
              name="active"
              type="checkbox"
              checked={formData.active}
              onChange={handleChange}
              disabled={isLoading}
              className="h-4 w-4 text-teal-600 border-slate-300 rounded-sm focus:ring-teal-500 cursor-pointer disabled:opacity-50"
            />
            <label htmlFor="access-active-checkbox" className="text-xs font-bold text-slate-800 cursor-pointer uppercase tracking-wider">
              Acesso Ativo no Tenant
            </label>
          </div>
          <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Desmarque para reter a permissão mas suspender o logon na unidade</p>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100" id="access-form-actions">
        <Button
          id="btn-cancel-access-form"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          size="sm"
        >
          Cancelar
        </Button>
        <Button
          id="btn-submit-access-form"
          type="submit"
          isLoading={isLoading}
          size="sm"
        >
          {isEdit ? 'Salvar Vínculo' : 'Vincular Usuário'}
        </Button>
      </div>
    </form>
  );
};
