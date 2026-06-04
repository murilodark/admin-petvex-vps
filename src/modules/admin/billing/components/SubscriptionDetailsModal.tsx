import React from 'react';
import { X, Calendar, ClipboardList, Shield, DollarSign, Wallet } from 'lucide-react';
import { Subscription } from '../../../../core/http/generated/models';
import { Badge } from '../../../../shared/components/ui/Badge';

interface SubscriptionDetailsModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({
  subscription,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !subscription) return null;

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
      case 'active':
        return <Badge variant="success">Ativa</Badge>;
      case 'trialing':
        return <Badge variant="info">Trialing</Badge>;
      case 'suspended':
        return <Badge variant="warning">Suspensa</Badge>;
      case 'canceled':
        return <Badge variant="danger">Cancelada</Badge>;
      case 'past_due':
        return <Badge variant="danger">Em Atraso</Badge>;
      case 'expired':
        return <Badge variant="neutral">Expirada</Badge>;
      default:
        return <Badge variant="neutral">{status}</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in" id="subscription-detail-backdrop">
      <div className="bg-white rounded-[4px] border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col" id="subscription-detail-container">
        
        {/* Header toolbar */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between" id="subscription-detail-header">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-teal-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Dossiê Completo da Assinatura
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1 rounded-[4px] cursor-pointer transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[75vh]" id="subscription-detail-body">
          {/* Section 1: Tenant Profile */}
          <div className="border border-slate-100 rounded-[4px] p-4 bg-slate-50/50">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1">
              <Shield className="h-3 w-3 text-teal-600" />
              IDENTIFICAÇÃO DO CLIENTE SAAS (TENANT)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">NOME DO ESTABELECIMENTO</span>
                <span className="text-xs font-extrabold text-slate-900">{subscription.tenant?.name || 'Inexistente'}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">E-MAIL DO ADMINISTRADOR</span>
                <span className="text-xs font-semibold text-slate-700 font-mono">{subscription.tenant?.email}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">ID DO TENANT</span>
                <span className="text-[10px] font-bold text-slate-500 font-mono">#{subscription.tenant_id}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DATA DE ADESÃO NA PLATAFORMA</span>
                <span className="text-xs font-medium text-slate-600 font-mono">{formatDate(subscription.tenant?.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Section 2: Plan Commercials */}
          <div className="border border-slate-100 rounded-[4px] p-4">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1">
              <DollarSign className="h-3.5 w-3.5 text-teal-500" />
              CONDIÇÕES COMERCIAIS & PLANO
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PLANO CONTRATADO</span>
                <span className="text-xs font-extrabold text-teal-600 uppercase">{subscription.plan?.name || subscription.plan_id}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">VALOR RECORRENTE</span>
                <span className="text-xs font-black text-slate-900">{formatCurrency(subscription.price)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">STATUS DA ASSINATURA</span>
                <div className="mt-1">{getStatusBadge(subscription.status)}</div>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">CICLO DE COBRANÇA</span>
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wide font-mono">{subscription.billing_cycle === 'monthly' ? 'Mensal' : 'Anual'}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">MÉTODO/PROVIDER FINANCEIRO</span>
                <span className="text-xs font-semibold text-slate-600 uppercase font-mono">{subscription.gateway?.replace('_', ' ') || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Subscription Lifespans */}
          <div className="border border-slate-100 rounded-[4px] p-4 bg-slate-50/50">
            <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1">
              <Calendar className="h-3 w-3 text-teal-600" />
              CRONOLOGIA FINANCEIRA DA ASSINATURA
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DATA DE INÍCIO</span>
                <span className="text-xs font-medium text-slate-700 font-mono">{formatDate(subscription.created_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">VENCIMENTO DO PERÍODO CORRENTE</span>
                <span className="text-xs font-extrabold text-slate-800 font-mono">{formatDate(subscription.current_period_ends_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PRÓXIMA DATA DE COBRANÇA</span>
                <span className="text-xs font-black text-teal-600 font-mono">{formatDate(subscription.next_billing_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">FIM DO PERÍODO AVALIAÇÃO (TRIAL)</span>
                <span className="text-xs font-medium text-slate-600 font-mono">{formatDate(subscription.trial_ends_at)}</span>
              </div>
              
              {subscription.suspended_at && (
                <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-[4px] col-span-2">
                  <span className="block text-[8px] font-black text-amber-700 uppercase tracking-widest">ASSINATURA SUSPENSA ADMINISTRATIVAMENTE</span>
                  <span className="text-[10px] font-sans font-medium text-amber-800">
                    Suspensão aplicada em: <b>{formatDate(subscription.suspended_at)}</b>
                  </span>
                </div>
              )}

              {subscription.canceled_at && (
                <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-[4px] col-span-2">
                  <span className="block text-[8px] font-black text-rose-700 uppercase tracking-widest">ASSINATURA CANCELADA DEFINITIVAMENTE</span>
                  <span className="text-[10px] font-sans font-medium text-rose-800">
                    Cancelamento processado em: <b>{formatDate(subscription.canceled_at)}</b>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer toolbar */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end" id="subscription-detail-footer">
          <button
            id="subscription-detail-close-btn"
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
