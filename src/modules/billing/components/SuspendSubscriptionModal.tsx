import React, { useState } from 'react';
import { X, Loader2, ZapOff } from 'lucide-react';
import { Subscription } from '../types/billing-admin.types';
import { SuspendSubscriptionSchema } from '../schemas/billing-admin.schema';

interface SuspendSubscriptionModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => Promise<void>;
}

export const SuspendSubscriptionModal: React.FC<SuspendSubscriptionModalProps> = ({
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
    const validation = SuspendSubscriptionSchema.safeParse({ reason });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message || 'Justificativa inválida.');
      return;
    }

    try {
      setSubmitting(true);
      await onConfirm(subscription.id, reason);
      setReason('');
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'Houve uma falha ao tentar suspender esta assinatura.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in" id="suspend-modal-backdrop">
      <div className="bg-white rounded-[4px] border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col" id="suspend-modal-container">
        
        {/* Header */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-4 flex items-center justify-between" id="suspend-modal-header">
          <div className="flex items-center gap-2">
            <ZapOff className="h-4 w-4 text-amber-600 animate-pulse" />
            <span className="text-xs font-black uppercase text-amber-900 tracking-wider">
              Confirmar Suspensão de Assinatura
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-amber-700 hover:text-amber-900 hover:bg-amber-100 p-1 rounded-[4px] cursor-pointer transition-all"
            disabled={submitting}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} id="suspend-subscription-form">
          <div className="p-6 space-y-4 text-xs font-medium text-slate-700" id="suspend-modal-body">
            <p className="leading-relaxed">
              Você está prestes a suspender a assinatura do cliente <b>{subscription.tenant?.name || 'Inexistente'}</b>.
              Esta operação impedirá o acesso do estabelecimento à plataforma Petvex até que seja reativado pelo suporte global.
            </p>

            <div className="bg-slate-50 border border-slate-100 rounded-[4px] p-3 text-[11px] text-slate-500 font-semibold uppercase font-mono">
              Plano: <span className="text-slate-800 font-bold">{subscription.plan?.name}</span> <br />
              Preço: <span className="text-slate-800 font-bold">R$ {subscription.price.toFixed(2)}</span>
            </div>

            <div>
              <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                JUSTIFICATIVA OBRIGATÓRIA DA SUSPENSÃO
              </label>
              <textarea
                id="suspend-reason-input"
                name="reason"
                required
                rows={4}
                value={reason}
                disabled={submitting}
                placeholder="Informe o motivo da suspensão (Ex: Inadimplência reincidente após notificações, solicitação formal, violação dos termos)..."
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(null);
                }}
                className="w-full px-3 py-2 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium text-slate-800 bg-white"
              />
              <span className="text-[10px] text-slate-400 font-mono text-right block mt-1">
                {reason.length === 0 ? 'Mínimo de 5 caracteres.' : `${reason.length} caracteres digitados`}
              </span>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 text-[11px] p-3 rounded-[4px] font-bold leading-relaxed" id="suspend-error">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex items-center justify-end gap-3" id="suspend-modal-footer">
            <button
              type="button"
              id="suspend-cancel-btn"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-[4px] text-xs font-black cursor-pointer transition-all uppercase disabled:opacity-40"
            >
              FECHAR
            </button>
            <button
              type="submit"
              id="suspend-confirm-btn"
              disabled={submitting}
              className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white shadow-sm rounded-[4px] text-xs font-black cursor-pointer transition-all uppercase flex items-center justify-center gap-1 min-w-[120px] disabled:opacity-40"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  SUSPENDENDO...
                </>
              ) : (
                'CONFIRMAR SUSPENSÃO'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
