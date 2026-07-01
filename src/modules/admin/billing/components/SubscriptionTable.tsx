import React from 'react';
import { Eye, ShieldAlert, ZapOff, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Badge } from '../../../../shared/components/ui/Badge';
import { AdminSubscription } from '../types/billing-admin.types';
import {
  canCancelSubscription,
  canReactivateSubscription,
  canSuspendSubscription,
} from '../utils/billing-admin-actions';

interface SubscriptionTableProps {
  data: AdminSubscription[];
  total: number;
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onView: (subscription: AdminSubscription) => void;
  onSuspend: (subscription: AdminSubscription) => void;
  onReactivate: (subscription: AdminSubscription) => void;
  onCancel: (subscription: AdminSubscription) => void;
}

export const SubscriptionTable: React.FC<SubscriptionTableProps> = ({
  data,
  total,
  page,
  lastPage,
  onPageChange,
  onView,
  onSuspend,
  onReactivate,
  onCancel,
}) => {
  const formatCurrency = (amountVal?: unknown, currencyStr?: string | null) => {
    const numericVal = amountVal !== undefined && amountVal !== null ? Number(amountVal) : NaN;
    if (isNaN(numericVal)) {
      return 'N/A';
    }
    const currency = currencyStr || 'BRL';
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(numericVal);
    } catch {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericVal);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return '-';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Ativa</Badge>;
      case 'trialing':
        return <Badge variant="info">Trialing</Badge>;
      case 'suspended':
        return <Badge variant="warning">Suspensa</Badge>;
      case 'canceled':
      case 'cancelled':
        return <Badge variant="danger">Cancelada</Badge>;
      case 'past_due':
      case 'payment_required':
        return <Badge variant="danger">Em Atraso</Badge>;
      case 'expired':
        return <Badge variant="neutral">Expirada</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-xs overflow-hidden font-sans" id="subscriptions-table-container">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="subscriptions-table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Cliente SaaS</th>
              <th className="px-6 py-4">Plano</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Ciclo</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Gateway</th>
              <th className="px-6 py-4">Expiração Período</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-slate-300" />
                    <span>Nenhuma assinatura localizada com os filtros selecionados.</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((sub) => (
                <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">#{sub.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div>{sub.tenant?.name || '-'}</div>
                    {sub.tenant?.email ? (
                      <div className="text-[10px] text-slate-400 font-normal font-mono">{sub.tenant.email}</div>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-normal italic">E-mail não informado</div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-semibold">{sub.plan?.name || sub.plan_id || '-'}</td>
                  <td className="px-6 py-4">{getStatusBadge(sub.status)}</td>
                  <td className="px-6 py-4 uppercase font-bold text-slate-500 font-mono text-[10px]">
                    {sub.billing_cycle === 'monthly' ? 'Mensal' : sub.billing_cycle === 'yearly' ? 'Anual' : sub.billing_cycle || '-'}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-850">
                    {formatCurrency(sub.amount ?? sub.price, sub.currency)}
                  </td>
                  <td className="px-6 py-4 uppercase font-bold text-slate-400 font-mono text-[10px]">
                    {sub.gateway?.replace('_', ' ') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">
                    {formatDate(sub.current_period_ends_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button
                        title="Ver Detalhes"
                        aria-label={`Ver detalhes da assinatura ${sub.id}`}
                        onClick={() => onView(sub)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-[4px] cursor-pointer transition-all"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {canSuspendSubscription(sub) && (
                          <button
                            title="Suspender Assinatura"
                            aria-label={`Suspender assinatura ${sub.id}`}
                            onClick={() => onSuspend(sub)}
                            className="p-1.5 text-amber-500 hover:text-amber-700 hover:bg-amber-50 rounded-[4px] cursor-pointer transition-all"
                          >
                            <ZapOff className="h-4 w-4" />
                          </button>
                      )}

                      {canCancelSubscription(sub) && (
                          <button
                            title="Cancelar Assinatura"
                            aria-label={`Cancelar assinatura ${sub.id}`}
                            onClick={() => onCancel(sub)}
                            className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-[4px] cursor-pointer transition-all"
                          >
                            <ShieldAlert className="h-4 w-4" />
                          </button>
                      )}

                      {canReactivateSubscription(sub) && (
                        <button
                          title="Reativar Assinatura"
                          aria-label={`Reativar assinatura ${sub.id}`}
                          onClick={() => onReactivate(sub)}
                          className="p-1.5 text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-[4px] cursor-pointer transition-all"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-[11px]" id="subscriptions-pagination">
          <span className="text-slate-400 font-mono">
            Mostrando <b>{data.length}</b> de <b>{total}</b> assinaturas cadastradas
          </span>
          <div className="flex items-center gap-1 font-sans">
            <button
              disabled={page === 1}
              onClick={() => onPageChange(page - 1)}
              className="px-2.5 py-1 border border-slate-200 bg-white rounded-[4px] text-slate-600 disabled:opacity-40 select-none hover:bg-slate-50 cursor-pointer text-[10px] font-bold"
            >
              ANTERIOR
            </button>
            <span className="px-3 text-slate-500 font-bold uppercase tracking-wider">
              Página <b>{page}</b> de <b>{lastPage}</b>
            </span>
            <button
              disabled={page === lastPage}
              onClick={() => onPageChange(page + 1)}
              className="px-2.5 py-1 border border-slate-200 bg-white rounded-[4px] text-slate-600 disabled:opacity-40 select-none hover:bg-slate-50 cursor-pointer text-[10px] font-bold"
            >
              PRÓXIMO
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
