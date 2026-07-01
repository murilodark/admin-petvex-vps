import React, { useState } from 'react';
import { X, Loader2, ShieldAlert } from 'lucide-react';
import { CancelSubscriptionSchema } from '../schemas/billing-admin.schema';
import { AdminSubscription } from '../types/billing-admin.types';

interface CancelSubscriptionModalProps {
  subscription: AdminSubscription | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => Promise<void>;
}

export const CancelSubscriptionModal: React.FC<CancelSubscriptionModalProps> = ({
  subscription,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !subscription) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate using Zod schema
    const validation = CancelSubscriptionSchema.safeParse({ reason });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Motivo inválido.');
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm(subscription.id, reason);
      setReason('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Houve uma falha ao tentar cancelar esta assinatura.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in" id="cancel-modal-backdrop">
      <div className="bg-white rounded-[4px] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col" id="cancel-modal-container">
        
        {/* Header */}
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-4 flex items-center justify-between" id="cancel-modal-header">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-600 animate-pulse" />
            <span className="text-xs font-black uppercase text-rose-900 tracking-wider">
              Confirmar Cancelamento Definitivo
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-rose-700 hover:text-rose-900 hover:bg-rose-100 p-1 rounded-[4px] cursor-pointer transition-all"
            disabled={submitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} id="cancel-subscription-form">
          <div className="p-6 space-y-4 text-xs font-medium text-slate-700" id="cancel-modal-body">
            <p className="leading-relaxed">
              Você está prestes a <b>cancelar definitivamente</b> a assinatura do cliente <b>{subscription.tenant?.name || 'Inexistente'}</b>.
            </p>

            <div className="bg-rose-50/30 border border-rose-100/50 rounded-[4px] p-3.5 text-rose-950 font-semibold space-y-2 leading-relaxed">
              <span className="block text-[10px] font-black uppercase tracking-widest text-rose-800">ATENÇÃO: Ação Irreversível</span>
              Esta ação desativará de imediato todas as consultas clínicas, cadastros e acessos dos médicos veterinários vinculados a este cliente no SaaS Petvex.
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                INFORME COMPROVADO DO MOTIVO DE CANCELAMENTO
              </label>
              <textarea
                id="cancel-reason-input"
                name="reason"
                required
                rows={4}
                value={reason}
                disabled={submitting}
                placeholder="Informe o motivo formal do cancelamento solicitado ou detectado (Ex: Solicitação via ticket de suporte #1192, encerramento das atividades comerciais local, não comparecimento ao suporte)..."
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-1 focus:ring-rose-500 font-medium text-slate-800 bg-white"
              />
              <span className="text-[10px] text-slate-400 font-mono text-right block mt-1">
                {reason.length === 0 ? 'Mínimo de 5 caracteres.' : `${reason.length} caracteres digitados`}
              </span>
            </div>

            {error && (
              <div className="bg-rose-100/40 border border-rose-200 text-rose-800 text-[11px] p-3 rounded-[4px] font-bold leading-relaxed" id="cancel-error">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3" id="cancel-modal-footer">
            <button
              type="button"
              id="cancel-close-btn"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-[4px] text-xs font-black cursor-pointer transition-all uppercase disabled:opacity-40"
            >
              RETORNAR
            </button>
            <button
              type="submit"
              id="cancel-confirm-btn"
              disabled={submitting}
              className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-sm rounded-[4px] text-xs font-black cursor-pointer transition-all uppercase flex items-center justify-center gap-1 min-w-[124px] disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  CANCELANDO...
                </>
              ) : (
                'EFETIVAR CANCELAMENTO'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
