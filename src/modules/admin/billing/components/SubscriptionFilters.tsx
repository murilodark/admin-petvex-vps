import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { ListarSubscriptionsParams } from '../types/billing-admin.types';

interface SubscriptionFiltersProps {
  filters: ListarSubscriptionsParams;
  onChange: (filters: ListarSubscriptionsParams) => void;
  onClear: () => void;
}

export const SubscriptionFilters: React.FC<SubscriptionFiltersProps> = ({
  filters,
  onChange,
  onClear,
}) => {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    onChange({ ...filters, [name]: value, page: 1 });
  };

  return (
    <div
      className="bg-white border border-slate-200 rounded-[4px] p-5 shadow-xs mb-6 font-sans"
      id="subscription-filters-container"
    >
      <div className="flex items-center gap-2 mb-4" id="subscription-filters-title">
        <Filter className="h-4 w-4 text-slate-500" />
        <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
          Filtros de Busca Avançada (Assinaturas)
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4" id="subscription-filters-grid">
        {/* Tenant Search */}
        <div className="relative" id="filter-tenant-wrapper">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            CLIENTE OU ID
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              name="tenant_id"
              placeholder="Min. 3 letras..."
              value={filters.tenant_id || ''}
              onChange={handleInputChange}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Plan Select */}
        <div id="filter-plan-wrapper">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            PLANO CONTRATADO
          </label>
          <select
            name="plan_id"
            value={filters.plan_id || 'all'}
            onChange={handleInputChange}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold text-slate-700 bg-white"
          >
            <option value="all">TODOS OS PLANOS</option>
            <option value="1">PLANO SLIM</option>
            <option value="2">PLANO STANDARD</option>
            <option value="3">PLANO PRO MULTIPET</option>
          </select>
        </div>

        {/* Status Select */}
        <div id="filter-status-wrapper">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            STATUS OPERACIONAL
          </label>
          <select
            name="status"
            value={filters.status || 'all'}
            onChange={handleInputChange}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold text-slate-700 bg-white"
          >
            <option value="all">TODOS OS STATUS</option>
            <option value="pending">PENDENTES</option>
            <option value="trialing">PERÍODO TESTE (TRIAL)</option>
            <option value="active">ATIVAS</option>
            <option value="past_due">ATRASADAS (PAST DUE)</option>
            <option value="payment_required">PAGAMENTO NECESSÁRIO</option>
            <option value="suspended">SUSPENSAS</option>
            <option value="canceled">CANCELADAS</option>
            <option value="cancelled">CANCELADAS (API)</option>
            <option value="expired">EXPIRADAS</option>
          </select>
        </div>

        {/* Cycle Select */}
        <div id="filter-cycle-wrapper">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            CICLO DE FATURA
          </label>
          <select
            name="billing_cycle"
            value={filters.billing_cycle || 'all'}
            onChange={handleInputChange}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold text-slate-700 bg-white"
          >
            <option value="all">TODOS OS CICLOS</option>
            <option value="monthly">MENSAL</option>
            <option value="yearly">ANUAL</option>
          </select>
        </div>

        {/* Gateway Select */}
        <div id="filter-gateway-wrapper">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            GATEWAY ATIVO
          </label>
          <select
            name="gateway"
            value={filters.gateway || 'all'}
            onChange={handleInputChange}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold text-slate-700 bg-white"
          >
            <option value="all">TODOS OS GATEWAYS</option>
            <option value="mercado_pago">MERCADO PAGO</option>
            <option value="pagseguro">PAGSEGURO</option>
            <option value="iugu">IUGU</option>
            <option value="stripe">STRIPE</option>
            <option value="asaas">ASAAS</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-slate-100" id="filter-actions-wrapper">
        <button
          id="btn-clear-subs-filters"
          onClick={onClear}
          className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-[4px] text-xs font-bold transition-all cursor-pointer"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          LIMPAR FILTROS
        </button>
      </div>
    </div>
  );
};
