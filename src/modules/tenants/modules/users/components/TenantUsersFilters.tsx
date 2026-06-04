import React from 'react';
import { Search } from 'lucide-react';

interface TenantUsersFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  role: string;
  onRoleChange: (val: string) => void;
  active: string;
  onActiveChange: (val: string) => void;
}

export const TenantUsersFilters: React.FC<TenantUsersFiltersProps> = ({
  search,
  onSearchChange,
  role,
  onRoleChange,
  active,
  onActiveChange,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-5 flex flex-col md:flex-row gap-4 items-end animate-fade-in" id="tenant-users-filters-container">
      <div className="flex-1 w-full" id="filter-user-search-group">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-sans">
          Buscar Usuário
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-slate-800"
            placeholder="Buscar por nome, e-mail CPF, telefone..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="w-full md:w-48" id="filter-user-role-group">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-sans">
          Cargo / Perfil
        </label>
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer font-bold uppercase tracking-wider text-slate-700 h-[38px]"
        >
          <option value="all">TODOS CARGOS</option>
          <option value="user">USER (OPERADOR)</option>
          <option value="manager">MANAGER (GERENTE)</option>
          <option value="admin">ADMIN (ADMIN MASTER)</option>
        </select>
      </div>

      <div className="w-full md:w-48" id="filter-user-active-group">
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5 font-sans">
          Status Operativo
        </label>
        <select
          value={active}
          onChange={(e) => onActiveChange(e.target.value)}
          className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 cursor-pointer font-bold uppercase tracking-wider text-slate-700 h-[38px]"
        >
          <option value="all">TODOS STATUS</option>
          <option value="active">ATIVO</option>
          <option value="inactive">INATIVO</option>
        </select>
      </div>
    </div>
  );
};
