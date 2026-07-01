import React from 'react';
import { Eye, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '../../../../shared/components/ui/Badge';
import { AdminPayment } from '../types/billing-admin.types';
import { canSyncPayment } from '../utils/billing-admin-actions';

interface PaymentTableProps {
  data: AdminPayment[];
  total: number;
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onView: (payment: AdminPayment) => void;
  onSync?: (paymentId: string) => void;
  syncingId?: string | null;
}

export const PaymentTable: React.FC<PaymentTableProps> = ({
  data,
  total,
  page,
  lastPage,
  onPageChange,
  onView,
  onSync,
  syncingId,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return <Badge variant="success">Aprovado</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>;
      case 'processing':
        return <Badge variant="info">Processando</Badge>;
      case 'failed':
      case 'rejected':
        return <Badge variant="danger">Falhado</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelado</Badge>;
      case 'refunded':
        return <Badge variant="info">Estornado</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-xs overflow-hidden font-sans" id="payments-table-container">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="payments-table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <th className="px-6 py-4">ID Transação</th>
              <th className="px-6 py-4">Cliente SaaS</th>
              <th className="px-6 py-4">Assinatura</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Método</th>
              <th className="px-6 py-4">Gateway</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Atualizado Em</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-slate-300" />
                    <span>Nenhum pagamento localizado com os filtros selecionados.</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((pay) => (
                <tr key={pay.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-mono text-[10px] text-slate-400">
                    <div className="font-bold text-slate-700">#{pay.id}</div>
                    {pay.gateway_payment_id && (
                      <div className="text-[9px] text-slate-400 truncate max-w-[120px] font-normal">
                        Ref: {pay.gateway_payment_id}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div>{pay.tenant?.name || 'Inexistente'}</div>
                    <div className="text-[10px] text-slate-400 font-normal font-mono">{pay.tenant?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-[4px] border border-slate-200">
                      #{pay.subscription_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(pay.status)}</td>
                  <td className="px-6 py-4 font-semibold uppercase text-[10px] text-slate-500 font-mono">
                    {pay.method === 'credit_card' ? 'Cartão de Crédito' : pay.method === 'pix' ? 'Pix' : pay.method || 'N/A'}
                  </td>
                  <td className="px-6 py-4 uppercase font-bold text-slate-400 font-mono text-[10px]">
                    {pay.gateway?.replace('_', ' ') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-850">
                    {formatCurrency(pay.amount)}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">
                    {formatDate(pay.paid_at || pay.failed_at || pay.created_at)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5">
                      <button
                        title="Ver Dossiê Financeiro"
                        aria-label={`Ver dossiê do pagamento ${pay.id}`}
                        onClick={() => onView(pay)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-[4px] cursor-pointer transition-all"
                        id={`btn-view-payment-${pay.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {onSync && canSyncPayment(pay) && (
                        <button
                          title="Consultar gateway e atualizar status do pagamento"
                          aria-label={`Sincronizar pagamento ${pay.id}`}
                          onClick={() => onSync(pay.id!)}
                          disabled={syncingId === pay.id}
                          className={`p-1.5 rounded-[4px] cursor-pointer transition-all ${
                            syncingId === pay.id
                              ? 'text-teal-650 bg-teal-50 animate-spin'
                              : 'text-slate-400 hover:text-teal-600 hover:bg-teal-50'
                          }`}
                          id={`btn-sync-payment-row-${pay.id}`}
                        >
                          <RefreshCw className="h-4 w-4" />
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
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-[11px]" id="payments-pagination">
          <span className="text-slate-400 font-mono">
            Mostrando <b>{data.length}</b> de <b>{total}</b> transações cadastradas
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
