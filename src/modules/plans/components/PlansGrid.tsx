import React from 'react';
import { Plan } from '../types/plans.types';
import { PlanPreviewCard } from './PlanPreviewCard';
import { ChevronLeft, ChevronRight, CreditCard } from 'lucide-react';

interface PlansGridProps {
  plans: Plan[];
  loading: boolean;
  viewMode: 'grid' | 'table';
  onEdit: (plan: Plan) => void;
  onToggleStatus: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  
  // Pagination
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (newPage: number) => void;
}

export const PlansGrid: React.FC<PlansGridProps> = ({
  plans,
  loading,
  viewMode,
  onEdit,
  onToggleStatus,
  onDelete,
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
}) => {

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const formatLimit = (val: number | null | undefined) => {
    if (val === null || val === undefined || val === 0) {
      return 'Ilim.';
    }
    return val.toString();
  };

  const formatStorage = (val: number | null | undefined) => {
    if (val === null || val === undefined || val === 0) {
      return 'Ilim.';
    }
    if (val >= 1024) {
      return `${(val / 1024).toFixed(1).replace('.0', '')} GB`;
    }
    return `${val} MB`;
  };

  if (loading) {
    return (
      <div className="py-24 text-center border border-slate-200 bg-white rounded-[4px]" id="plans-loading-state">
        <div className="flex flex-col items-center justify-center gap-3">
          <div className="relative flex items-center justify-center">
            <span className="w-10 h-10 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin inline-block" />
            <CreditCard className="h-4.5 w-4.5 text-teal-600 absolute animate-pulse" />
          </div>
          <span className="text-xs font-black uppercase text-slate-400 tracking-widest mt-2 font-mono">
            Carregando tabela e modelos de planos...
          </span>
        </div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="p-16 text-center border-2 border-dashed border-slate-200 bg-white rounded-[4px]" id="plans-empty-state">
        <div className="max-w-md mx-auto space-y-3.5">
          <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mx-auto text-slate-400">
            <CreditCard className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">
              Nenhum Plano Encontrado
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Não existem produtos ou licenças SaaS cadastrados que correspondam às diretrizes de busca especificadas. Crie um novo plano para iniciar a faturar clientes.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="plans-grid-and-pagination">
      {viewMode === 'grid' ? (
        /* Bento Grid Style View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="plans-cards-grid-layout">
          {plans.map((plan) => (
            <PlanPreviewCard
              key={plan.id}
              plan={plan}
              onEdit={onEdit}
              onToggleStatus={onToggleStatus}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        /* Classic Highly-Formatted Table Admin layout */
        <div className="bg-white border border-slate-200 rounded-[4px] shadow-xs overflow-hidden" id="plans-table-layout-wrapper">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] border-collapse text-left" id="plans-admin-table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-black tracking-wider">
                  <th className="py-4 px-6 border-r border-slate-100 last:border-r-0">Plano / Identificação</th>
                  <th className="py-4 px-6 border-r border-slate-100 items-center last:border-r-0">Preço Regular (Mensal / Anual)</th>
                  <th className="py-4 px-6 border-r border-slate-100 last:border-r-0">Limites Operacionais</th>
                  <th className="py-4 px-6 border-r border-slate-100 last:border-r-0">Espaço Disco</th>
                  <th className="py-4 px-5 border-r border-slate-100 last:border-r-0">Status</th>
                  <th className="py-4 px-6 text-right">Controles</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
                {plans.map((plan) => (
                  <tr 
                    key={plan.id} 
                    className="hover:bg-slate-50/50 transition-colors"
                    id={`plan-table-row-${plan.id}`}
                  >
                    <td className="py-4.5 px-6">
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-extrabold text-slate-900 text-[13px] tracking-tight">{plan.name}</span>
                          {plan.badge && (
                            <span 
                              className="px-1 text-[8px] font-black uppercase rounded text-white"
                              style={{ backgroundColor: plan.color && plan.color.trim() !== '' ? plan.color : '#10b981' }}
                            >
                              {plan.badge}
                            </span>
                          )}
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 font-extrabold uppercase">
                          ID #{plan.id} {plan.slug ? `• slug: ${plan.slug}` : ''}
                        </span>
                        {plan.short_description && (
                          <span className="text-[10px] text-slate-500 italic mt-0.5 max-w-sm line-clamp-1 block">
                            {plan.short_description}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4.5 px-6">
                      <div className="flex flex-col text-slate-900">
                        <span className="font-bold">{formatCurrency(plan.monthly_price || 0)} <span className="text-[9px] text-slate-400 font-normal">/mês</span></span>
                        <div className="flex items-center gap-1">
                          <span className="text-[10px] text-slate-500 font-medium">{formatCurrency(plan.yearly_price || 0)} <span className="text-[9px] text-slate-400 font-normal">/ano</span></span>
                          {plan.yearly_discount_percent ? (
                            <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-1 border border-emerald-100 rounded leading-none">
                              -{plan.yearly_discount_percent}%
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </td>

                    <td className="py-4.5 px-6">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-[10px] text-slate-500">
                        <span><strong>Pets:</strong> {formatLimit(plan.max_pets)}</span>
                        <span><strong>Users:</strong> {formatLimit(plan.max_users)}</span>
                        <span><strong>Cli:</strong> {formatLimit(plan.max_clients)}</span>
                        <span><strong>Cons:</strong> {formatLimit(plan.max_appointments)}</span>
                      </div>
                    </td>

                    <td className="py-4.5 px-6 font-mono font-bold text-slate-800">
                      {formatStorage(plan.max_storage_mb)}
                    </td>

                    <td className="py-4.5 px-5">
                      <button
                        onClick={() => onToggleStatus(plan)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 border rounded-[4px] text-[9px] font-black uppercase tracking-wider cursor-pointer font-bold ${
                          plan.is_active
                            ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                            : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {plan.is_active ? 'Ativo' : 'Inativo'}
                      </button>
                    </td>

                    <td className="py-4.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEdit(plan)}
                          className="p-1 px-2 border border-slate-200 rounded-[4px] bg-white text-slate-600 hover:text-teal-600 hover:bg-slate-50 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          EDITAR
                        </button>
                        <button
                          onClick={() => onDelete(plan)}
                          className="p-1 px-2 border border-slate-200 rounded-[4px] bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50 text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer"
                        >
                          EXCLUIR
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination component */}
      {total > 0 ? (
        <div className="bg-slate-50 border border-slate-200 rounded-[4px] px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 animate-fade-in" id="plans-pagination-nav">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Mostrando <span className="text-slate-700 font-mono">{(page - 1) * perPage + 1}</span> a <span className="text-slate-700 font-mono">{Math.min(page * perPage, total)}</span> de <span className="text-slate-700 font-mono">{total}</span> modelos de planos
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-[4px] border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all"
              id="prev-plans-page"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            
            <div className="font-mono text-xs font-bold px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-[4px]">
              {page} / {lastPage}
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= lastPage}
              className="p-1.5 rounded-[4px] border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer transition-all"
              id="next-plans-page"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
