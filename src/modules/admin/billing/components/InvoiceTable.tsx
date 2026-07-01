import React from 'react';
import { Eye, AlertTriangle } from 'lucide-react';
import { Badge } from '../../../../shared/components/ui/Badge';
import { AdminInvoice } from '../types/billing-admin.types';

interface InvoiceTableProps {
  data: AdminInvoice[];
  total: number;
  page: number;
  lastPage: number;
  onPageChange: (page: number) => void;
  onView: (invoice: AdminInvoice) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  data,
  total,
  page,
  lastPage,
  onPageChange,
  onView,
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
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paga</Badge>;
      case 'pending':
      case 'open':
        return <Badge variant="warning">Pendente</Badge>;
      case 'overdue':
        return <Badge variant="danger">Vencida</Badge>;
      case 'cancelled':
        return <Badge variant="neutral">Cancelada</Badge>;
      case 'refunded':
        return <Badge variant="info">Estornada</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-xs overflow-hidden font-sans" id="invoices-table-container">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="invoices-table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-widest">
              <th className="px-6 py-4">Fatura</th>
              <th className="px-6 py-4">Cliente SaaS</th>
              <th className="px-6 py-4">Assinatura</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Gateway</th>
              <th className="px-6 py-4">Valor</th>
              <th className="px-6 py-4">Vencimento</th>
              <th className="px-6 py-4">Pago Em</th>
              <th className="px-6 py-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700 font-medium font-sans">
            {data.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center text-slate-400 font-medium">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertTriangle className="h-6 w-6 text-slate-300" />
                    <span>Nenhuma fatura localizada com os filtros selecionados.</span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-extrabold text-slate-900 font-mono text-[11px]">{inv.number}</div>
                    <div className="text-[9px] text-slate-400 font-normal font-mono">#{inv.id}</div>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    <div>{inv.tenant?.name || 'Inexistente'}</div>
                    <div className="text-[10px] text-slate-400 font-normal font-mono">{inv.tenant?.email}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-[4px] border border-slate-200 font-semibold text-slate-500">
                      #{inv.subscription_id}
                    </span>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(inv.status)}</td>
                  <td className="px-6 py-4 uppercase font-bold text-slate-400 font-mono text-[10px]">
                    {inv.gateway?.replace('_', ' ') || 'N/A'}
                  </td>
                  <td className="px-6 py-4 font-extrabold text-slate-800">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="px-6 py-4 text-slate-500 font-mono text-[10px] font-bold">
                    {formatDate(inv.due_at)}
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-[10px]">
                    {formatDate(inv.paid_at)}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      title="Ver Fatura"
                      aria-label={`Ver fatura ${inv.number || inv.id}`}
                      onClick={() => onView(inv)}
                      className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-[4px] cursor-pointer transition-all"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {data.length > 0 && (
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-[11px]" id="invoices-pagination">
          <span className="text-slate-400 font-mono">
            Mostrando <b>{data.length}</b> de <b>{total}</b> faturas de faturamento cadastradas
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
