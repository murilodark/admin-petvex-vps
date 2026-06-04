import React from 'react';
import { Eye, Edit, Trash2, Zap, Star, ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';
import { PaymentGateway } from '../../../../core/http/generated/models';
import { PaymentGatewayProviderBadge } from './PaymentGatewayProviderBadge';
import { PaymentGatewayStatusBadge, EnvironmentBadge } from './PaymentGatewayStatusBadge';

interface PaymentGatewayTableProps {
  gateways: PaymentGateway[];
  loading: boolean;
  page: number;
  total: number;
  onPageChange: (page: number) => void;
  onViewDetails: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTestConnection: (id: string) => void;
  onSetDefault: (id: string) => void;
}

export const PaymentGatewayTable: React.FC<PaymentGatewayTableProps> = ({
  gateways,
  loading,
  page,
  total,
  onPageChange,
  onViewDetails,
  onEdit,
  onDelete,
  onTestConnection,
  onSetDefault,
}) => {
  const perPage = 5;
  const lastPage = Math.ceil(total / perPage) || 1;

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center shadow-xs" id="gateways-table-loading">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent mb-3" />
        <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">Carregando gateways de pagamento...</p>
      </div>
    );
  }

  if (gateways.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center shadow-xs" id="gateways-table-empty">
        <AlertCircle className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Nenhum Gateway Localizado</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Tente redefinir seus filtros de pesquisa ou cadastrar um novo gateway de pagamento administrativo.</p>
      </div>
    );
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-xs overflow-hidden font-sans" id="payment-gateways-table-container">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="payment-gateways-table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <th className="px-6 py-4">Nome do Gateway</th>
              <th className="px-6 py-4">Provedor</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Ambiente</th>
              <th className="px-6 py-4">Cadastrado em</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {gateways.map((g) => (
              <tr key={g.id} id={`gateway-row-${g.id}`} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    <span>{g.name}</span>
                    {g.is_default && (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-amber-500 text-white font-mono uppercase tracking-wider">
                        Padrão
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <PaymentGatewayProviderBadge provider={g.provider} />
                </td>
                <td className="px-6 py-4">
                  <PaymentGatewayStatusBadge status={g.status} />
                </td>
                <td className="px-6 py-4">
                  <EnvironmentBadge isSandbox={g.is_sandbox} />
                </td>
                <td className="px-6 py-4 font-mono text-slate-500">{formatDate(g.created_at || g.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5" id={`gateway-actions-${g.id}`}>
                    {/* Test Connection Button */}
                    <button
                      id={`gateway-action-test-${g.id}`}
                      onClick={() => onTestConnection(g.id)}
                      title="Testar Conectividade com API"
                      className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-sm transition-all cursor-pointer"
                    >
                      <Zap className="h-4 w-4" />
                    </button>

                    {/* Set as Default Button */}
                    <button
                      id={`gateway-action-default-${g.id}`}
                      onClick={() => onSetDefault(g.id)}
                      disabled={g.is_default}
                      title={g.is_default ? "Este já é o gateway padrão" : "Definir como Gateway Padrão Global"}
                      className={`p-2 rounded-sm transition-all cursor-pointer ${
                        g.is_default 
                          ? "text-slate-200 cursor-not-allowed" 
                          : "text-slate-500 hover:text-amber-500 hover:bg-slate-100"
                      }`}
                    >
                      <Star className={`h-4 w-4 ${g.is_default ? "fill-amber-400 text-amber-400" : ""}`} />
                    </button>

                    {/* View Details Button */}
                    <button
                      id={`gateway-action-details-${g.id}`}
                      onClick={() => onViewDetails(g.id)}
                      title="Visualizar Detalhes & Configurações"
                      className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-sm transition-all cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    {/* Edit Button */}
                    <button
                      id={`gateway-action-edit-${g.id}`}
                      onClick={() => onEdit(g.id)}
                      title="Editar Parametros"
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-sm transition-all cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    {/* Delete Button */}
                    <button
                      id={`gateway-action-delete-${g.id}`}
                      onClick={() => onDelete(g.id)}
                      title="Excluir Gateway"
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-sm transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 text-[11px]" id="payment-gateways-pagination">
        <span className="font-mono text-slate-500 uppercase tracking-wide">
          Exibindo {gateways.length} de {total} registros
        </span>
        <div className="flex items-center gap-2">
          <button
            id="pagination-prev"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 border border-slate-200 bg-white rounded-[4px] text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 font-mono px-3">
            {page} / {lastPage}
          </span>
          <button
            id="pagination-next"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= lastPage}
            className="p-2 border border-slate-200 bg-white rounded-[4px] text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
