import React from 'react';
import {
  X,
  History,
  Building,
  Terminal,
  AlertTriangle,
  CheckCircle,
  FileText,
  User,
  ExternalLink,
} from 'lucide-react';
import { NotificationDispatch } from '../types/notification';

interface NotificationDispatchDetailsProps {
  dispatch: NotificationDispatch;
  onClose: () => void;
}

export const NotificationDispatchDetails: React.FC<NotificationDispatchDetailsProps> = ({
  dispatch,
  onClose,
}) => {
  const getStatusBadge = (status: string) => {
    const map: any = {
      generated: { label: 'Gerado', bg: 'bg-slate-900 text-slate-400 border border-slate-800' },
      pending: { label: 'Pendente', bg: 'bg-amber-950/40 text-amber-400 border border-amber-900/40' },
      queued: { label: 'Em Fila', bg: 'bg-blue-950/40 text-blue-400 border border-blue-900/40' },
      sent: { label: 'Enviado', bg: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' },
      failed: { label: 'Falhou', bg: 'bg-rose-950/40 text-rose-400 border border-rose-900/40' },
      cancelled: { label: 'Cancelado', bg: 'bg-slate-950 text-slate-500 border border-slate-900' },
    };
    const item = map[status] || { label: status, bg: 'bg-slate-800 text-slate-300' };
    return <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded ${item.bg}`}>{item.label}</span>;
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const formattedPayload = JSON.stringify(dispatch.payload || {}, null, 2);

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex justify-center items-center z-50 animate-fade-in" id="dispatch-details-backdrop">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-3xl rounded-[4px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-teal-400" />
            <div className="space-y-0.5">
              <h3 className="font-sans font-bold text-sm text-white">
                Inspetor de Disparo de Notificação
              </h3>
              <p className="text-[10px] text-slate-500">ID de Log: {dispatch.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-850 text-slate-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Status and core information block */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-[4px] space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Destinatário</p>
              <p className="text-xs font-bold text-white truncate">{dispatch.recipient || '—'}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{dispatch.contact || '—'}</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-[4px] space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Status de Envio</p>
              <div className="pt-0.5">{getStatusBadge(dispatch.status)}</div>
              <p className="text-[9px] text-slate-500 font-mono">Gerado: {formatDateTime(dispatch.created_at)}</p>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 p-3 rounded-[4px] space-y-1">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Módulo / Evento</p>
              <p className="text-xs font-bold text-slate-300 capitalize">{dispatch.module}</p>
              <p className="text-[10px] text-slate-400 font-mono uppercase">{dispatch.event.replace('_', ' ')}</p>
            </div>
          </div>

          {/* Associated clinic & template */}
          <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-[4px] grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-2.5">
              <Building className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">Clínica Origem</span>
                <span className="text-xs font-semibold text-slate-200 block">
                  {dispatch.tenant?.name || 'Clínica Desconhecida'}
                </span>
                <span className="text-[10px] text-slate-500 block">ID: {dispatch.tenant_id}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <FileText className="h-4 w-4 text-slate-500 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">Template Associado</span>
                <span className="text-xs font-semibold text-slate-200 block">
                  {dispatch.template?.name || 'Template Desconhecido'}
                </span>
                <code className="text-[10px] text-teal-400 font-mono font-medium block">
                  {dispatch.template?.key || dispatch.notification_template_id}
                </code>
              </div>
            </div>
          </div>

          {/* Fail Reason (conditional) */}
          {dispatch.error_message && (
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-[4px] flex gap-3">
              <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="text-xs font-bold text-rose-400">Falha no Processamento</h5>
                <p className="text-xs text-slate-300 leading-normal">{dispatch.error_message}</p>
              </div>
            </div>
          )}

          {/* Message content body */}
          <div className="space-y-2">
            <h4 className="font-sans font-bold text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-teal-400" /> Conteúdo Enviado
            </h4>
            {dispatch.subject && (
              <div className="p-3 bg-slate-900 border border-slate-800 rounded-t-[4px] border-b-0">
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Assunto:</p>
                <p className="text-xs font-bold text-white mt-0.5">{dispatch.subject}</p>
              </div>
            )}
            <div className={`p-4 bg-slate-900 border border-slate-800 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line ${dispatch.subject ? 'rounded-b-[4px]' : 'rounded-[4px]'}`}>
              {dispatch.body}
            </div>
          </div>

          {/* RAW Dynamic Payload */}
          <div className="space-y-2">
            <h4 className="font-sans font-bold text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-slate-500" /> Payload JSON de Entrada
            </h4>
            <div className="bg-slate-950 p-4 border border-slate-900 rounded-[4px] overflow-x-auto max-h-52">
              <pre className="font-mono text-[10px] text-teal-400/90 leading-relaxed">{formattedPayload}</pre>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 p-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-semibold text-slate-300 rounded-[4px] transition-all"
          >
            Fechar Inspetor
          </button>
        </div>

      </div>
    </div>
  );
};
