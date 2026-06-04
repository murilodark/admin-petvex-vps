import React from 'react';
import { Search, Filter, RefreshCw } from 'lucide-react';
import { ListarPaymentGatewaysParams } from '../types/payment-gateway.types';

interface PaymentGatewayFiltersProps {
  filters: ListarPaymentGatewaysParams;
  onChange: (filters: ListarPaymentGatewaysParams) => void;
  onClear: () => void;
}

export const PaymentGatewayFilters: React.FC<PaymentGatewayFiltersProps> = ({
  filters,
  onChange,
  onClear,
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...filters, search: e.target.value });
  };

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, provider: e.target.value });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, status: e.target.value });
  };

  const handleEnvironmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, is_sandbox: e.target.value });
  };

  const handleDefaultChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange({ ...filters, is_default: e.target.value });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-5 shadow-xs mb-6" id="payment-gateways-filters-container">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 text-teal-600" />
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Filtros de Pesquisa</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Search Input */}
        <div className="relative flex flex-col gap-1.5" id="filter-search-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Nome do Gateway</label>
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              id="filter-search-input"
              type="text"
              placeholder="Digite o nome..."
              value={filters.search || ''}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-800 font-medium"
            />
          </div>
        </div>

        {/* Provider Filter */}
        <div className="flex flex-col gap-1.5" id="filter-provider-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Provedor</label>
          <select
            id="filter-provider-select"
            value={filters.provider || 'all'}
            onChange={handleProviderChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-700 font-medium"
          >
            <option value="all">Todos os Provedores</option>
            <option value="mercado_pago">Mercado Pago</option>
            <option value="pagseguro">PagSeguro</option>
            <option value="iugu">Iugu</option>
            <option value="stripe">Stripe</option>
            <option value="asaas">Asaas</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="flex flex-col gap-1.5" id="filter-status-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
          <select
            id="filter-status-select"
            value={filters.status || 'all'}
            onChange={handleStatusChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-700 font-medium"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="testing">Em Testes</option>
            <option value="error">Erro</option>
          </select>
        </div>

        {/* Environment Filter */}
        <div className="flex flex-col gap-1.5" id="filter-env-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Ambiente</label>
          <select
            id="filter-env-select"
            value={filters.is_sandbox || 'all'}
            onChange={handleEnvironmentChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-700 font-medium"
          >
            <option value="all">Todos os Ambientes</option>
            <option value="false">Produção</option>
            <option value="true">Homologação (Sandbox)</option>
          </select>
        </div>

        {/* Padrão Filter */}
        <div className="flex flex-col gap-1.5" id="filter-default-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Padrão</label>
          <select
            id="filter-default-select"
            value={filters.is_default || 'all'}
            onChange={handleDefaultChange}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all text-slate-700 font-medium"
          >
            <option value="all">Todos os Canais</option>
            <option value="true">Apenas Padrão</option>
            <option value="false">Apenas Secundários</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-slate-100" id="filter-actions-container">
        <button
          id="filter-clear-btn"
          onClick={onClear}
          className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-[10px] uppercase tracking-wider font-bold text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all rounded-[4px] cursor-pointer font-sans"
        >
          <RefreshCw className="h-3 w-3" />
          Limpar Filtros
        </button>
      </div>
    </div>
  );
};
