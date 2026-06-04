import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { ListarInvoicesParams } from '../types/billing-admin.types';

interface InvoiceFiltersProps {
  filters: ListarInvoicesParams;
  onChange: (filters: ListarInvoicesParams) => void;
  onClear: () => void;
}

export const InvoiceFilters: React.FC<InvoiceFiltersProps> = ({
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
      id="invoice-filters-container"
    >
      <div className="flex items-center gap-2 mb-4" id="invoice-filters-title">
        <Filter className="h-4 w-4 text-slate-500" />
        <h4 className="text-[11px] font-black uppercase text-slate-700 tracking-wider">
          Filtros de Busca Avançada (Faturas de Cobrança)
        </h4>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="invoice-filters-grid">
        {/* Tenant Search */}
        <div className="relative" id="filter-inv-tenant-wrapper">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            CLIENTE OU ID
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              name="tenant_id"
              placeholder="Buscar por cliente..."
              value={filters.tenant_id || ''}
              onChange={handleInputChange}
              className="w-full pl-9 pr-3 py-1.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-700"
            />
          </div>
        </div>

        {/* Subscription ID */}
        <div id="filter-inv-sub-wrapper">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            ID DA ASSINATURA
          </label>
          <input
            type="text"
            name="subscription_id"
            placeholder="Ex: sub-01..."
            value={filters.subscription_id || ''}
            onChange={handleInputChange}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-medium text-slate-700"
          />
        </div>

        {/* Status Select */}
        <div id="filter-inv-status-wrapper">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
            STATUS DA FATURA
          </label>
          <select
            name="status"
            value={filters.status || 'all'}
            onChange={handleInputChange}
            className="w-full px-3 py-1.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 font-semibold text-slate-700 bg-white"
          >
            <option value="all">TODAS AS FATURAS</option>
            <option value="pending">PENDENTES</option>
            <option value="paid">PAGAS</option>
            <option value="overdue">VENCIDAS (OVERDUE)</option>
            <option value="cancelled">CANCELADAS</option>
            <option value="refunded">ESTORNADAS</option>
            <option value="failed">FALHADAS</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end mt-4 pt-4 border-t border-slate-100" id="invoice-filter-actions-wrapper">
        <button
          id="btn-clear-inv-filters"
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
