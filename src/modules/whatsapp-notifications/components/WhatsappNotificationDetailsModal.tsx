import React, { useState } from 'react';
import { X, Send, AlertCircle, Calendar, MessageSquare, Info, RefreshCw, Layers } from 'lucide-react';
import { WhatsAppNotification } from '../../../core/http/generated/models';
import { Button } from '../../../shared/components/ui/Button';
import { WhatsappStatusBadge } from './WhatsappStatusBadge';
import { whatsappNotificationService } from '../services/whatsapp-notification.service';

interface WhatsappNotificationDetailsModalProps {
  notification: WhatsAppNotification | null;
  isOpen: boolean;
  onClose: () => void;
  onRefresh?: () => void;
}

export const WhatsappNotificationDetailsModal: React.FC<WhatsappNotificationDetailsModalProps> = ({
  notification,
  isOpen,
  onClose,
  onRefresh,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryResult, setRetryResult] = useState<{ success?: boolean; message?: string } | null>(null);

  if (!isOpen || !notification) return null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  const renderText = (value?: any, fallback: string = '-') => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  };

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryResult(null);
    try {
      const result = await whatsappNotificationService.retryNotification(notification.id);
      if (result.status) {
        setRetryResult({ success: true, message: result.message || 'Reenvio agendado com sucesso!' });
        if (onRefresh) onRefresh();
      } else {
        setRetryResult({ success: false, message: result.message || 'Falha ao processar reenvio.' });
      }
    } catch (err: any) {
      setRetryResult({
        success: false,
        message: err?.response?.data?.message || err?.message || 'Erro inesperado ao reenviar notificação.'
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const isRetryable =
    notification.status?.toLowerCase() === 'failed' ||
    notification.status?.toLowerCase() === 'cancelled';

  const clientInfo = (notification as any).client || {};
  const petInfo = (notification as any).pet || {};
  const appointmentInfo = (notification as any).appointment || {};
  const tenantInfo = notification.tenant || {};

  return (
    <div
      id="notification-details-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="notification-details-modal-container"
        className="bg-slate-900 border border-slate-800 text-white rounded-[4px] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-teal-500" />
            <div>
              <h3 className="font-sans font-medium text-sm uppercase tracking-wider text-slate-100">
                Dossiê da Notificação WhatsApp
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1">ID: {notification.id}</p>
            </div>
          </div>
          <button
            id="btn-close-notification-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6" id="notification-modal-content">
          {/* Main Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-[4px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Status Atual</div>
              <div className="mt-2">
                <WhatsappStatusBadge status={notification.status} />
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-[4px] md:col-span-2">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Meta Message ID</div>
              <div className="text-xs font-mono text-teal-400 mt-2 break-all">
                {renderText(notification.meta_message_id, 'N/A')}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-[4px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Destinatário</div>
              <div className="text-xs font-mono text-teal-500 font-bold mt-2">
                {renderText(notification.phone, '-')}
              </div>
            </div>
          </div>

          {/* Feedback messages */}
          {retryResult && (
            <div
              id="retry-feedback-alert"
              className={`p-4 rounded-[4px] border flex items-start gap-3 ${
                retryResult.success
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-xs">
                <p className="font-bold">{retryResult.success ? 'Sucesso' : 'Falha'}</p>
                <p className="mt-1">{retryResult.message}</p>
              </div>
            </div>
          )}

          {/* General Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Associations Section */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-500" /> Relacionamentos
              </h4>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-[4px] space-y-3">
                <div className="grid grid-cols-3 text-xs">
                  <span className="text-slate-400 font-medium">Tenant/Clínica:</span>
                  <span className="col-span-2 text-slate-200">
                    {tenantInfo.name ? (
                      <span className="font-semibold">{tenantInfo.name} <span className="text-[10px] text-slate-500 font-mono">({tenantInfo.id})</span></span>
                    ) : (
                      <span className="text-slate-500 font-mono">{renderText(notification.tenant_id, '-')}</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-3 text-xs border-t border-slate-800/50 pt-2">
                  <span className="text-slate-400 font-medium">Cliente:</span>
                  <span className="col-span-2 text-slate-200 font-semibold">
                    {clientInfo.name ? (
                      <span>{clientInfo.name} <span className="text-[10px] text-slate-500 font-mono">({clientInfo.id})</span></span>
                    ) : (
                      <span className="text-slate-500 font-mono">{renderText(notification.client_id, '-')}</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-3 text-xs border-t border-slate-800/50 pt-2">
                  <span className="text-slate-400 font-medium">Pet:</span>
                  <span className="col-span-2 text-slate-200">
                    {petInfo.name ? (
                      <span>{petInfo.name} <span className="text-[10px] text-slate-500 font-mono">({petInfo.id})</span></span>
                    ) : (
                      <span className="text-slate-500">-</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-3 text-xs border-t border-slate-800/50 pt-2">
                  <span className="text-slate-400 font-medium">Agendamento:</span>
                  <span className="col-span-2 text-slate-200">
                    {appointmentInfo.id ? (
                      <span>
                        <span className="font-mono text-[11px] text-teal-500 font-bold">#{appointmentInfo.id}</span>
                        {appointmentInfo.date && <span className="text-[10px] text-slate-400 ml-2">({formatDate(appointmentInfo.date)})</span>}
                      </span>
                    ) : (
                      <span className="text-slate-500 font-mono">{renderText(notification.appointment_id, '-')}</span>
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-3 text-xs border-t border-slate-800/50 pt-2">
                  <span className="text-slate-400 font-medium">Chave Template:</span>
                  <span className="col-span-2 text-slate-200 font-mono text-[11px]">
                    {renderText(notification.template_key, '-')}
                  </span>
                </div>
              </div>
            </div>

            {/* Timeline Section */}
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-teal-500" /> Linha do Tempo & Eventos
              </h4>

              <div className="bg-slate-950 border border-slate-800 p-4 rounded-[4px] space-y-3">
                <div className="grid grid-cols-3 text-xs">
                  <span className="text-slate-400 font-medium">Criado em:</span>
                  <span className="col-span-2 text-slate-200 font-mono">{formatDate(notification.created_at)}</span>
                </div>

                <div className="grid grid-cols-3 text-xs border-t border-slate-800/50 pt-2">
                  <span className="text-slate-400 font-medium">Enviado em:</span>
                  <span className="col-span-2 text-slate-200 font-mono">{formatDate(notification.sent_at)}</span>
                </div>

                <div className="grid grid-cols-3 text-xs border-t border-slate-800/50 pt-2">
                  <span className="text-slate-400 font-medium">Entregue em:</span>
                  <span className="col-span-2 text-slate-200 font-mono">{formatDate(notification.delivered_at)}</span>
                </div>

                <div className="grid grid-cols-3 text-xs border-t border-slate-800/50 pt-2">
                  <span className="text-slate-400 font-medium">Lido em:</span>
                  <span className="col-span-2 text-slate-200 font-mono">{formatDate(notification.read_at)}</span>
                </div>

                <div className="grid grid-cols-3 text-xs border-t border-slate-800/50 pt-2">
                  <span className="text-slate-400 font-medium">Falha em:</span>
                  <span className="col-span-2 text-slate-200 font-mono text-rose-400">{formatDate(notification.failed_at)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message if failed */}
          {notification.error && (
            <div className="bg-rose-950/20 border border-rose-500/30 p-4 rounded-[4px]" id="notification-error-block">
              <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
                <AlertCircle className="h-4 w-4" /> Detalhes do Erro
              </div>
              <p className="text-xs text-rose-300 font-mono leading-relaxed">{notification.error}</p>
            </div>
          )}

          {/* Payload block */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">Payload Enviado (Parâmetros da API)</div>
            <pre className="bg-slate-950 p-4 rounded-[4px] border border-slate-800 text-teal-400 font-mono text-xs overflow-auto max-h-60" id="notification-payload-code">
              {JSON.stringify(notification.payload || {}, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-between items-center">
          <div>
            {isRetryable ? (
              <span className="text-[10px] text-amber-500 uppercase tracking-wider font-bold">
                * Esta notificação falhou ou foi cancelada, você pode reenviá-la.
              </span>
            ) : (
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                * Reenvio desabilitado para este status.
              </span>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              id="btn-modal-close"
              variant="gray"
              onClick={onClose}
              className="text-xs font-bold uppercase tracking-wider"
            >
              Fechar
            </Button>
            {isRetryable && (
              <Button
                id="btn-modal-retry"
                variant="info"
                onClick={handleRetry}
                disabled={isRetrying}
                className="bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold uppercase tracking-wider"
              >
                {isRetrying ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                Reenviar Notificação
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
