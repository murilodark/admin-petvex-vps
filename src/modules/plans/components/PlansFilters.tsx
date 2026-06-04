import React from 'react';
import { Search, SlidersHorizontal, LayoutGrid, List } from 'lucide-react';

interface PlansFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  
  viewMode: 'grid' | 'table';
  onViewModeChange: (mode: 'grid' | 'table') => void;
}

export const PlansFilters: React.FC<PlansFiltersProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  viewMode,
  onViewModeChange,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-5 space-y-4 shadow-xs" id="plans-filters-panel">
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
        
        {/* Search Input bar */}
        <div className="flex-1 relative" id="plans-search-group">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
          <input
            id="input-search-plans"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar planos por nome ou benefícios..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
        </div>

        {/* Filter Selection parameters & Layout Switcher */}
        <div className="flex flex-wrap items-center gap-4" id="plans-filters-selectors">
          
          {/* Status Selection */}
          <div className="flex items-center gap-2" id="filter-status-wrapper">
            <SlidersHorizontal className="h-4.5 w-4.5 text-slate-400 shrink-0" />
            <select
              id="select-status-filter"
              value={status}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3.5 py-2.5 border border-slate-250 bg-white text-slate-700 font-bold uppercase rounded-[4px] text-[10px] tracking-wider cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">SITUAÇÃO: TODOS</option>
              <option value="active">ATIVOS</option>
              <option value="inactive">INATIVOS</option>
            </select>
          </div>

          {/* View mode buttons */}
          <div className="flex items-center border border-slate-200 rounded-[4px] p-0.5 bg-slate-100" id="plans-view-mode-toggle">
            <button
              type="button"
              id="btn-view-grid"
              onClick={() => onViewModeChange('grid')}
              className={`p-1.5 rounded-[3px] transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-teal-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Visualização em Grade de Vendas"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              id="btn-view-table"
              onClick={() => onViewModeChange('table')}
              className={`p-1.5 rounded-[3px] transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-teal-600 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Visualização em Lista Operacional"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
