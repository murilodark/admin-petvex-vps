import React from 'react';
import { Star } from 'lucide-react';
import { PaymentGateway } from '../../../core/http/generated/models/admin-payment-gateways';
import { Button } from '../../../shared/components/ui/Button';

interface PaymentGatewaySetDefaultDialogProps {
  isOpen: boolean;
  gateway: PaymentGateway | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const PaymentGatewaySetDefaultDialog: React.FC<PaymentGatewaySetDefaultDialogProps> = ({
  isOpen,
  gateway,
  onConfirm,
  onClose,
  isLoading,
}) => {
  if (!isOpen || !gateway) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all" id="set-default-dialog-overlay">
      <div 
        className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-[4px] overflow-hidden transform scale-100 transition-transform duration-200"
        id="set-default-dialog-content font-sans"
      >
        <div className="p-5 border-b border-amber-100 bg-amber-50/50" id="set-default-header">
          <div className="flex items-center gap-2.5 text-amber-700">
            <Star className="h-5 w-5 fill-amber-400 text-amber-500 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-800">Definir Gateway como Padrão Global</h3>
          </div>
        </div>

        <div className="p-6 space-y-4 font-sans" id="set-default-body">
          <p className="text-xs text-slate-600 leading-relaxed">
            Você está prestes a definir <span className="font-bold text-slate-900">{gateway.name}</span> como o <span className="font-bold text-slate-900">Gateway de Pagamentos Padrão</span> de todo o ecossistema SaaS Petvex.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-[4px] space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Impacto operacional:</h4>
            <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1">
              <li>Todos os novos faturamentos, planos contratados e cobranças do sistema serão gerados e processados por esta credencial.</li>
              <li>O gateway padrão anterior perderá o pre-requisito automático de roteamento (porém continuará ativo e cadastrado).</li>
              <li>Recomenda-se realizar um teste de conectividade bem-sucedido antes de tornar o gateway padrão global.</li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3" id="set-default-footer">
          <Button
            id="btn-close-set-default"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            id="btn-confirm-set-default"
            variant="primary"
            className="bg-amber-500 hover:bg-amber-600 border-amber-600 text-white"
            onClick={onConfirm}
            isLoading={isLoading}
            size="sm"
          >
            Sim, Definir como Padrão
          </Button>
        </div>
      </div>
    </div>
  );
};
