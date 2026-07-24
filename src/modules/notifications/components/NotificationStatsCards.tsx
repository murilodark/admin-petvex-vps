import React from 'react';
import {
  Bell,
  CheckCircle,
  XCircle,
  MousePointerClick,
  Zap,
  MessageSquare,
  Mail,
  ShieldAlert,
  Send,
  AlertTriangle,
  History,
  Activity,
} from 'lucide-react';
import { NotificationTemplateStats, NotificationDispatchStats } from '../types/notification';

interface NotificationStatsCardsProps {
  templateStats: NotificationTemplateStats | null;
  dispatchStats: NotificationDispatchStats | null;
  isLoading: boolean;
}

export const NotificationStatsCards: React.FC<NotificationStatsCardsProps> = ({
  templateStats,
  dispatchStats,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[4px] text-center text-slate-500 font-medium">
        Carregando estatísticas de notificações...
      </div>
    );
  }

  // Fallbacks
  const tStats = templateStats || {
    total_templates: 0,
    active_templates: 0,
    inactive_templates: 0,
    manual_templates: 0,
    automatic_templates: 0,
    whatsapp_manual_templates: 0,
    email_templates: 0,
    blocked_tenants_count: 0,
  };

  const dStats = dispatchStats || {
    total_dispatches: 0,
    generated_count: 0,
    pending_count: 0,
    queued_count: 0,
    sent_count: 0,
    failed_count: 0,
    cancelled_count: 0,
    by_channel: {},
    by_module: {},
    by_event: {},
  };

  const sentRate = dStats.total_dispatches > 0
    ? Math.round((dStats.sent_count / dStats.total_dispatches) * 100)
    : 0;

  const failedRate = dStats.total_dispatches > 0
    ? Math.round((dStats.failed_count / dStats.total_dispatches) * 100)
    : 0;

  return (
    <div className="space-y-8" id="notifications-stats-container">
      {/* 1. Templates Summary */}
      <div>
        <h4 className="font-sans font-medium text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-teal-500" /> Estatísticas de Templates de Notificação
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-[4px] text-teal-400 shrink-0">
              <Bell className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total de Templates</p>
              <p className="text-2xl font-bold text-white mt-1">{tStats.total_templates}</p>
            </div>
          </div>

          {/* Card 2: Ativos vs Inativos */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] flex items-center gap-4">
            <div className="p-3 bg-emerald-500/10 rounded-[4px] text-emerald-400 shrink-0">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Status dos Templates</p>
              <p className="text-lg font-bold text-white mt-1">
                <span className="text-emerald-400">{tStats.active_templates}</span>
                <span className="text-slate-600 px-1">/</span>
                <span className="text-slate-400">{tStats.inactive_templates}</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Ativos / Inativos</p>
            </div>
          </div>

          {/* Card 3: Envio Manual vs Automático */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-[4px] text-indigo-400 shrink-0">
              <Zap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Tipo de Envio</p>
              <p className="text-lg font-bold text-white mt-1">
                <span className="text-indigo-400">{tStats.automatic_templates}</span>
                <span className="text-slate-600 px-1">/</span>
                <span className="text-slate-400">{tStats.manual_templates}</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Automáticos / Manuais</p>
            </div>
          </div>

          {/* Card 4: Bloqueios */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-[4px] text-rose-400 shrink-0">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Bloqueios de Clínica</p>
              <p className="text-2xl font-bold text-white mt-1">{tStats.blocked_tenants_count}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Total de restrições de Tenants</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Dispatches Summary */}
      <div>
        <h4 className="font-sans font-medium text-xs uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
          <History className="h-4 w-4 text-teal-500" /> Estatísticas de Disparos (Histórico)
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Total Dispatches */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-[4px] text-blue-400 shrink-0">
              <Send className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Total de Disparos</p>
              <p className="text-2xl font-bold text-white mt-1">{dStats.total_dispatches}</p>
            </div>
          </div>

          {/* Card 2: Success Rate */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] flex items-center gap-4">
            <div className="p-3 bg-teal-500/10 rounded-[4px] text-teal-400 shrink-0">
              <Activity className="h-6 w-6" />
            </div>
            <div className="w-full">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Taxa de Sucesso</p>
              <p className="text-2xl font-bold text-white mt-1">{sentRate}%</p>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-teal-500 h-1.5"
                  style={{ width: `${Math.min(100, Math.max(0, sentRate))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 3: Failed Dispatches */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] flex items-center gap-4">
            <div className="p-3 bg-rose-500/10 rounded-[4px] text-rose-400 shrink-0">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="w-full">
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Falhas de Envio</p>
              <p className="text-2xl font-bold text-white mt-1">
                {dStats.failed_count} <span className="text-xs text-slate-500 font-medium">({failedRate}%)</span>
              </p>
              <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-1.5"
                  style={{ width: `${Math.min(100, Math.max(0, failedRate))}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 4: Pending / Queued */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-[4px] text-amber-400 shrink-0">
              <History className="h-6 w-6" />
            </div>
            <div>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Fila de Espera</p>
              <p className="text-lg font-bold text-white mt-1">
                <span className="text-amber-400">{dStats.pending_count || 0}</span>
                <span className="text-slate-600 px-1">/</span>
                <span className="text-blue-400">{dStats.queued_count || 0}</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">Pendentes / Em Fila</p>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Detailed break-downs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Module Break-down */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[4px]">
          <h5 className="font-sans font-medium text-xs uppercase tracking-widest text-slate-300 mb-4 border-b border-slate-800 pb-2">
            Disparos por Módulo
          </h5>
          <div className="space-y-4">
            {Object.keys(dStats.by_module || {}).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center font-medium">Sem dados por módulo.</p>
            ) : (
              Object.entries(dStats.by_module || {}).map(([mod, count]: [string, any]) => {
                const percentage = dStats.total_dispatches > 0 ? Math.round((count / dStats.total_dispatches) * 100) : 0;
                return (
                  <div key={mod} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="capitalize font-semibold text-slate-300">{mod}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-1.5" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Channel Break-down */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[4px]">
          <h5 className="font-sans font-medium text-xs uppercase tracking-widest text-slate-300 mb-4 border-b border-slate-800 pb-2">
            Disparos por Canal
          </h5>
          <div className="space-y-4">
            {Object.keys(dStats.by_channel || {}).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center font-medium">Sem dados por canal.</p>
            ) : (
              Object.entries(dStats.by_channel || {}).map(([chan, count]: [string, any]) => {
                const percentage = dStats.total_dispatches > 0 ? Math.round((count / dStats.total_dispatches) * 100) : 0;
                return (
                  <div key={chan} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="uppercase font-mono text-[10px] font-bold text-slate-300">{chan}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-1.5" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Event Break-down */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-[4px]">
          <h5 className="font-sans font-medium text-xs uppercase tracking-widest text-slate-300 mb-4 border-b border-slate-800 pb-2">
            Disparos por Evento
          </h5>
          <div className="space-y-4">
            {Object.keys(dStats.by_event || {}).length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center font-medium">Sem dados por evento.</p>
            ) : (
              Object.entries(dStats.by_event || {}).map(([evt, count]: [string, any]) => {
                const percentage = dStats.total_dispatches > 0 ? Math.round((count / dStats.total_dispatches) * 100) : 0;
                return (
                  <div key={evt} className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span className="capitalize font-semibold text-slate-300">{evt.replace('_', ' ')}</span>
                      <span>{count} ({percentage}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-teal-500 h-1.5" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
