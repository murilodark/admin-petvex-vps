import React, { useEffect, useState } from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { tenantsService } from '../../../tenants/services/tenants.service';
import { Tenant } from '../../../tenants/types/tenant.types';
import { ListarGlobalUsersParams } from '../types/global-user.types';

interface GlobalUserFiltersProps {
  filters: ListarGlobalUsersParams;
  onChange: (filters: ListarGlobalUsersParams) => void;
  onClear: () => void;
}

export const GlobalUserFilters: React.FC<GlobalUserFiltersProps> = ({
  filters,
  onChange,
  onClear,
}) => {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  useEffect(() => {
    const fetchTenants = async () => {
      try {
        setLoadingTenants(true);
        const res = await tenantsService.listarTenants({ perPage: 100 });
        if (res?.data) {
          setTenants(res.data);
        }
      } catch (err) {
        console.error('Failed to load tenants for filter dropdown', err);
      } finally {
        setLoadingTenants(false);
      }
    };
    fetchTenants();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleAdminChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, isGlobalAdmin: e.target.value, page: 1 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, active: e.target.value, page: 1 });
  };

  const handleTenantChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, tenantId: e.target.value, page: 1 });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-5 shadow-xs mb-6" id="global-users-filters-container">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-teal-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Filtros de Pesquisa</h4>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Search Input */}
        <div className="relative flex flex-col gap-1.5" id="filter-search-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Buscar por Nome / Email</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Digite e pressione enter..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800"
            />
          </div>
        </div>

        {/* Global Admin status */}
        <div className="flex flex-col gap-1.5" id="filter-admin-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tipo de Usuário</label>
          <select
            id="filter-admin-select"
            value={filters.isGlobalAdmin || 'all'}
            onChange={handleAdminChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-700 font-medium"
          >
            <option value="all">SaaS & Admin (Todos)</option>
            <option value="true">Administradores Globais</option>
            <option value="false">Apenas Usuários de Tenants</option>
          </select>
        </div>

        {/* Active status */}
        <div className="flex flex-col gap-1.5" id="filter-status-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status de Logon</label>
          <select
            id="filter-status-select"
            value={filters.active || 'all'}
            onChange={handleStatusChange}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-700 font-medium"
          >
            <option value="all">Filtro Atividade (Todos)</option>
            <option value="true">Ativo</option>
            <option value="false">Inativo</option>
          </select>
        </div>

        {/* Tenant Filter */}
        <div className="flex flex-col gap-1.5" id="filter-tenant-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Membro do Tenant</label>
          <select
            id="filter-tenant-select"
            value={filters.tenantId || ''}
            onChange={handleTenantChange}
            disabled={loadingTenants}
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-700 font-medium disabled:opacity-60"
          >
            <option value="">Filtro por Tenant (Todos)</option>
            {tenants.map(t => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-slate-100" id="filter-actions-container">
        <button
          id="filter-clear-btn"
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all rounded-[4px] cursor-pointer"
        >
          <RefreshCw className="h-3 w-3" />
          Limpar Filtros
        </button>
      </div>
    </div>
  );
};
