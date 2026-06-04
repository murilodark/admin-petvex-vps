import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, Loader2, PlayCircle, CheckCircle, XCircle } from 'lucide-react';
import { PaymentGateway } from '../../../../core/http/generated/models';
import { Button } from '../../../../shared/components/ui/Button';
import { paymentGatewaysService } from '../services/payment-gateways.service';

interface PaymentGatewayTestConnectionDialogProps {
  isOpen: boolean;
  gateway: PaymentGateway | null;
  onClose: () => void;
}

export const PaymentGatewayTestConnectionDialog: React.FC<PaymentGatewayTestConnectionDialogProps> = ({
  isOpen,
  gateway,
  onClose,
}) => {
  const [testing, setTesting] = useState(true);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    if (isOpen && gateway) {
      setTesting(true);
      setResult(null);
      
      paymentGatewaysService.testarConexao(gateway.id)
        .then((res) => {
          setResult(res);
        })
        .catch((err) => {
          setResult({
            success: false,
            message: err.message || 'Houve uma falha inesperada de comunicação com o servidor de gateway.',
          });
        })
        .finally(() => {
          setTesting(false);
        });
    }
  }, [isOpen, gateway]);

  if (!isOpen || !gateway) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all" id="test-connection-dialog-overlay">
      <div 
        className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-[4px] overflow-hidden transform scale-100 transition-transform duration-200"
        id="test-connection-dialog-content font-sans"
      >
        <div className="p-5 border-b border-slate-100 bg-slate-50/50" id="test-dialog-header">
          <div className="flex items-center gap-2.5 text-slate-800">
            <Wifi className="h-5 w-5 text-teal-600 animate-pulse" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">Diagnóstico de API {gateway.name}</h3>
          </div>
        </div>

        <div className="p-6 space-y-4" id="test-dialog-body">
          {testing ? (
            <div className="py-6 flex flex-col items-center justify-center space-y-3" id="test-loading">
              <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
              <p className="text-xs text-slate-500 font-medium">Realizando testes de handshake e credenciamento de API...</p>
            </div>
          ) : result ? (
            <div className="space-y-4" id="test-result-wrapper">
              {result.success ? (
                <div className="p-4 bg-teal-50 border border-teal-100 rounded-[4px] flex items-start gap-3 text-teal-800" id="test-sucesso shadow-xs">
                  <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-wider">Conexão realizada com sucesso</h4>
                    <p className="text-xs text-teal-700 leading-relaxed font-sans">{result.message}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-rose-50 border border-rose-100 rounded-[4px] flex items-start gap-3 text-rose-800" id="test-erro shadow-xs">
                  <XCircle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="text-xs font-black uppercase tracking-wider">Falha de autenticação</h4>
                    <p className="text-xs text-rose-700 leading-relaxed font-sans">{result.message}</p>
                  </div>
                </div>
              )}

              <div className="p-4 bg-slate-50 border border-slate-100 rounded-[4px] space-y-2 text-[11px] text-slate-600 font-sans leading-relaxed">
                <span className="font-bold text-slate-800 uppercase tracking-widest text-[9px] block">Parâmetros Diagnosticados:</span>
                <div>• Provedor de API: <span className="font-mono text-slate-950 font-bold uppercase">{gateway.provider}</span></div>
                <div>• Endpoint URL: <span className="font-mono">{gateway.is_sandbox ? 'Homologação (Sandbox)' : 'Produção (Live API)'}</span></div>
                <div>• Status: <span className="font-bold">{result.success ? 'ONLINE' : 'OFFLINE'}</span></div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end" id="test-dialog-footer">
          <Button
            id="btn-close-test-dialog"
            variant="outline"
            onClick={onClose}
            size="sm"
          >
            Fechar Diagnóstico
          </Button>
        </div>
      </div>
    </div>
  );
};
