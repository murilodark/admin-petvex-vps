import React, { useState } from 'react';
import { X, Loader2, CheckCircle } from 'lucide-react';
import { Subscription } from '../types/billing-admin.types';

interface ReactivateSubscriptionModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const ReactivateSubscriptionModal: React.FC<ReactivateSubscriptionModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !subscription) return null;

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      setError(null);
      await onConfirm(subscription.id);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Houve uma falha ao tentar reativar esta assinatura.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in" id="reactivate-modal-backdrop">
      <div className="bg-white rounded-[4px] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col" id="reactivate-modal-container">
        
        {/* Header */}
        <div className="bg-teal-50 border-b border-teal-100 px-6 py-4 flex items-center justify-between" id="reactivate-modal-header">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-teal-600" />
            <span className="text-xs font-black uppercase text-teal-900 tracking-wider">
              Confirmar Reativação de Assinatura
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-teal-700 hover:text-teal-900 hover:bg-teal-100 p-1 rounded-[4px] cursor-pointer transition-all"
            disabled={submitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4 text-xs font-medium text-slate-700" id="reactivate-modal-body">
          <p className="leading-relaxed">
            Você está prestes a <b>reativar o acesso integral</b> da assinatura do cliente <b>{subscription.tenant?.name || 'Inexistente'}</b>.
          </p>

          <p className="text-slate-500 leading-relaxed">
            Essa ação removerá o bloqueio sistêmico instantaneamente, devolvendo as credenciais e permissões operacionais do portal veterinário normal a todos os usuários da clínica.
          </p>

          <div className="bg-slate-50 border border-slate-100 rounded-[4px] p-3 text-[11px] text-slate-500 font-semibold uppercase font-mono">
            Plano associado: <span className="text-slate-800 font-bold">{subscription.plan?.name}</span> <br />
            Preço de faturamento: <span className="text-slate-800 font-bold">R$ {subscription.price.toFixed(2)}</span>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] p-3 rounded-[4px] font-bold leading-relaxed" id="reactivate-error">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3" id="reactivate-modal-footer">
          <button
            type="button"
            id="reactivate-close-btn"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-[4px] text-xs font-black cursor-pointer transition-all uppercase disabled:opacity-40"
          >
            CANCELAR
          </button>
          <button
            type="button"
            id="reactivate-confirm-btn"
            onClick={handleConfirm}
            disabled={submitting}
            className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white shadow-sm rounded-[4px] text-xs font-black cursor-pointer transition-all uppercase flex items-center justify-center gap-1 min-w-[120px] disabled:opacity-40"
          >
            {submitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                REATIVANDO...
              </>
            ) : (
              'REATIVAR ASSINATURA'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
