import React from 'react';
import { X, CheckCircle, Receipt, ExternalLink, Calendar, ShieldCheck } from 'lucide-react';
import { Invoice } from '../../../core/http/generated/models';
import { Badge } from '../../../shared/components/ui/Badge';

interface InvoiceDetailsModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceDetailsModal: React.FC<InvoiceDetailsModalProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !invoice) return null;

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
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="success">Paga</Badge>;
      case 'pending':
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
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in" id="invoice-detail-backdrop">
      <div className="bg-white rounded-[4px] border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col" id="invoice-detail-container">
        
        {/* Header toolbar */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between" id="invoice-detail-header">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-teal-600" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Dossiê de Fatura Emitida ({invoice.number})
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
        <div className="p-6 space-y-4 text-xs font-semibold text-slate-700 overflow-y-auto max-h-[70vh]" id="invoice-detail-body">
          {/* Header Summary Cards */}
          <div className="flex items-center justify-between border border-slate-100 rounded-[4px] p-4 bg-slate-50/50">
            <div>
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none">VALOR LANÇADO</span>
              <span className="text-lg font-black text-slate-900 leading-none mt-1 block">
                {formatCurrency(invoice.amount)}
              </span>
            </div>
            <div className="text-right">
              <span className="block text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">CONDIÇÃO DETECTADA</span>
              {getStatusBadge(invoice.status)}
            </div>
          </div>

          {/* Section 1: Customer Details */}
          <div className="border border-slate-100 rounded-[4px] p-4 space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-2">
              <ShieldCheck className="h-3 w-3 text-teal-600" />
              DADOS DO TOMADOR DO SERVIÇO (CLIENTE)
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">FANTASIA (RAZÃO)</span>
                <span className="text-slate-800 text-xs font-bold block truncate max-w-full">{invoice.tenant?.name || 'Inexistente'}</span>
              </div>
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">E-MAIL ADMINISTRADOR</span>
                <span className="text-slate-700 font-mono text-[10px] block truncate max-w-full">{invoice.tenant?.email}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Core Fields */}
          <div className="border border-slate-100 rounded-[4px] p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 pb-3 border-b border-slate-100/50">
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">ID RECURSO INTERNO</span>
                <span className="font-mono text-slate-800 text-[10px]">#{invoice.id}</span>
              </div>
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">NÚMERO OFICIAL DE FATURA</span>
                <span className="font-mono text-slate-800 text-[10px] font-black text-teal-700">{invoice.number}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">ID ASSINATURA REGULAR</span>
                <span className="font-mono text-slate-800 text-[10px]">#{invoice.subscription_id}</span>
              </div>
              <div>
                <span className="block text-[8px] font-extrabold text-slate-400 uppercase">GATEWAY PROCESSO</span>
                <span className="text-slate-800 uppercase text-[10px] font-mono leading-none font-bold">
                  {invoice.gateway?.replace('_', ' ') || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Gateway reference IDs */}
          {invoice.gateway_invoice_id && (
            <div className="border border-slate-100 rounded-[4px] p-4">
              <span className="block text-[8px] font-extrabold text-slate-400 uppercase mb-1">CÓDIGO DE TRANSAÇÃO DO GATEWAY (EXTERNAL INVOICE ID)</span>
              <span className="font-mono text-[10px] text-slate-800 bg-slate-50 px-2 py-1 rounded-[4px] font-black block truncate max-w-full">
                {invoice.gateway_invoice_id}
              </span>
            </div>
          )}

          {/* Section 4: Chronicles */}
          <div className="border border-slate-100 rounded-[4px] p-4 space-y-3">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1 mb-2">
              <Calendar className="h-3.5 w-3.5 text-teal-500" />
              REGISTRO DE CRONOGRAMAS E FATOS
            </div>
            <div className="space-y-1.5 font-mono text-[10px] text-slate-500">
              <div className="flex justify-between">
                <span>EMISSÃO DA FATURA:</span>
                <span className="text-slate-700 font-bold">{formatDate(invoice.created_at)}</span>
              </div>
              <div className="flex justify-between text-amber-700 bg-amber-50/50 p-1 rounded-[4px]">
                <span>DATA LIMITE (VENCIMENTO):</span>
                <span>{formatDate(invoice.due_at)}</span>
              </div>
              {invoice.paid_at && (
                <div className="flex justify-between text-teal-600 font-bold bg-teal-50/50 p-1 rounded-[4px]">
                  <span>CONFIRMAÇÃO DE LIQUIDAÇÃO:</span>
                  <span>{formatDate(invoice.paid_at)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Download Action sheet */}
          {invoice.invoice_url && (
            <a
              id="invoice-download-link"
              href={invoice.invoice_url}
              target="_blank"
              rel="noreferrer"
              className="bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 p-4 rounded-[4px] flex items-center justify-between transition-all cursor-pointer select-none font-bold"
            >
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-widest leading-none text-teal-700">LINK DA FATURA CONTRATAL</span>
                <span className="text-[11px] font-sans font-medium text-slate-600 mt-1 block">Acessar portal externo para impressão ou geração de PDF</span>
              </div>
              <ExternalLink className="h-5 w-5 text-teal-600 hover:scale-110 transition-transform shrink-0" />
            </a>
          )}
        </div>

        {/* Footer toolbar */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end" id="invoice-detail-footer">
          <button
            id="invoice-detail-close-btn"
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
