import React from 'react';
import { X, CheckCircle, ShieldX, DollarSign, Wallet, ArrowRight, ShieldCheck } from 'lucide-react';
import { Payment } from '../../../../core/http/generated/models';
import { Badge } from '../../../../shared/components/ui/Badge';

interface PaymentDetailsModalProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentDetailsModal: React.FC<PaymentDetailsModalProps> = ({
  payment,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !payment) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprovado</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendente</Badge>;
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in" id="payment-detail-backdrop">
      <div className="bg-white rounded-[4px] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" id="payment-detail-container">
        
        {/* Header toolbar */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between" id="payment-detail-header">
          <div className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-teal-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Dossiê de Transação de Pagamento
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1 rounded-[4px] cursor-pointer transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-4 text-xs font-semibold text-slate-700 overflow-y-auto max-h-[70vh]" id="payment-detail-body">
          {/* Header Summary Cards */}
          <div className="flex items-center justify-between border border-slate-100 rounded-[4px] p-4 bg-slate-50/50">
            <div>
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">VALOR LANÇADO</span>
              <span className="text-lg font-black text-slate-900 leading-none mt-1 block">
                {formatCurrency(payment.amount)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">CONDIÇÃO DETECTADA</span>
              {getStatusBadge(payment.status)}
            </div>
          </div>

          {/* Section 1: Core Fields */}
          <div className="border border-slate-100 rounded-[4px] p-4 space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-2">
              <ShieldCheck className="h-3 w-3 text-teal-600" />
              IDENTIFICADORES DE SESSÃO FINANCEIRA
            </div>
            
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100/50">
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">ID DE CONTROLE INTERNO</span>
                <span className="font-mono text-slate-800 text-[10px]">#{payment.id}</span>
              </div>
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">ASSINATURA ASSOCIADA</span>
                <span className="font-mono text-slate-800 text-[10px]">#{payment.subscription_id}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">MÉTODO</span>
                <span className="text-slate-800 uppercase text-[10px] font-bold">
                  {payment.method === 'credit_card' ? 'Cartão de Crédito' : payment.method === 'pix' ? 'Pix' : payment.method || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">GATEWAY PROCESSO</span>
                <span className="text-slate-800 uppercase text-[10px] font-mono leading-none font-bold">
                  {payment.gateway?.replace('_', ' ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Gateway Payload codes */}
          <div className="border border-slate-100 rounded-[4px] p-4 space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-2">
              <ArrowRight className="h-3 w-3 text-teal-500" />
              CÓDIGOS RETORNADOS DO GATEWAY
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">ID NO GATEWAY (PAYMENT ID)</span>
                <span className="font-mono text-[9px] text-slate-700 font-bold bg-slate-50 px-1 py-0.5 rounded-[4px] outline-hidden truncate max-w-full block">
                  {payment.gateway_payment_id || 'N/A'}
                </span>
              </div>
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">ID DE TRANSAÇÃO (TX ID)</span>
                <span className="font-mono text-[9px] text-slate-700 font-bold bg-slate-50 px-1 py-0.5 rounded-[4px] outline-hidden truncate max-w-full block">
                  {payment.gateway_transaction_id || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Chronicles */}
          <div className="border border-slate-100 rounded-[4px] p-4 space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-2">
              GERENCIAMENTO DE LOG DE EVENTOS
            </div>
            <div className="space-y-1.5 font-mono text-[10px] text-slate-500">
              <div className="flex justify-between">
                <span>REQUISIÇÃO GERADA:</span>
                <span className="text-slate-700 font-bold">{formatDate(payment.created_at)}</span>
              </div>
              {payment.paid_at && (
                <div className="flex justify-between text-teal-600 font-bold bg-teal-50/50 p-1 rounded-[4px]">
                  <span>PAGAMENTO LIQUIDADO:</span>
                  <span>{formatDate(payment.paid_at)}</span>
                </div>
              )}
              {payment.failed_at && (
                <div className="flex justify-between text-rose-600 font-bold bg-rose-50/50 p-1 rounded-[4px]">
                  <span>REJEIÇÃO DETECTADA:</span>
                  <span>{formatDate(payment.failed_at)}</span>
                </div>
              )}
              {payment.refunded_at && (
                <div className="flex justify-between text-sky-600 font-bold bg-sky-50/50 p-1 rounded-[4px]">
                  <span>ESTORNO CONCLUÍDO:</span>
                  <span>{formatDate(payment.refunded_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Failure Alert Banner */}
          {payment.status === 'failed' && payment.failure_reason && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-[4px] space-y-1 leading-relaxed">
              <div className="flex items-center gap-1.5 text-rose-700 text-[10px] font-black uppercase tracking-widest">
                <ShieldX className="h-4 w-4" />
                Dossiê Técnico da Falha Rejeitada
              </div>
              <p className="text-[11px] font-medium text-slate-600 mt-1.5 font-mono">
                {payment.failure_reason}
              </p>
            </div>
          )}
        </div>

        {/* Footer toolbar */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end" id="payment-detail-footer">
          <button
            id="payment-detail-close-btn"
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-[4px] text-xs font-extrabold cursor-pointer transition-all uppercase"
          >
            FECHAR DOSSIÊ
          </button>
        </div>
      </div>
    </div>
  );
};
