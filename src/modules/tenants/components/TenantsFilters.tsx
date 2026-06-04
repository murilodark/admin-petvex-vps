import React from 'react';
import { Search } from 'lucide-react';

interface TenantsFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  plano: string;
  onPlanoChange: (val: string) => void;
}

export const TenantsFilters: React.FC<TenantsFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  plano,
  onPlanoChange,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-5 flex flex-col md:flex-row gap-4 items-end" id="tenants-filters-container">
      <div className="flex-1 w-full" id="filter-search-group">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-sans">
          Buscar Tenant
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
            placeholder="Nome da clínica, e-mail, CNPJ/CPF, telefone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full md:w-48" id="filter-status-group">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-sans">
          Status do Sistema
        </label>
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer font-bold uppercase tracking-wider text-slate-700"
        >
          <option value="all">TODOS STATUS</option>
          <option value="active">ATIVO</option>
          <option value="inactive">INATIVO</option>
        </select>
      </div>

      <div className="w-full md:w-48" id="filter-plano-group">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-sans">
          Plano Ativo
        </label>
        <select
          value={plano}
          onChange={(e) => onPlanoChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer font-bold uppercase tracking-wider text-slate-700"
        >
          <option value="all">TODOS PLANOS</option>
          <option value="Starter">STARTER</option>
          <option value="Pro">PRO</option>
          <option value="Enterprise">ENTERPRISE</option>
        </select>
      </div>
    </div>
  );
};
