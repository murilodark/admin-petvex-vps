import React from 'react';
import { Eye, ShieldAlert, ChevronLeft, ChevronRight } from 'lucide-react';
import { WhatsAppNotification } from '../types/whatsapp-notification.types';
import { Button } from '../../../shared/components/ui/Button';
import { WhatsappStatusBadge } from './WhatsappStatusBadge';

interface WhatsappNotificationTableProps {
  notifications: WhatsAppNotification[];
  total: number;
  page: number;
  lastPage: number;
  onPageChange: (newPage: number) => void;
  onSelect: (notification: WhatsAppNotification) => void;
  isLoading: boolean;
}

export const WhatsappNotificationTable: React.FC<WhatsappNotificationTableProps> = ({
  notifications,
  total,
  page,
  lastPage,
  onPageChange,
  onSelect,
  isLoading,
}) => {
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
      });
    } catch {
      return '-';
    }
  };

  const renderText = (value?: any, fallback: string = '-') => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  };

  return (
    <div id="whatsapp-notifications-table-wrapper" className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-[4px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="whatsapp-notifications-table">
            <thead>
              <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <th className="py-4 px-6">ID / Data</th>
                <th className="py-4 px-6">Telefone</th>
                <th className="py-4 px-6">Template</th>
                <th className="py-4 px-6">Clínica (Tenant)</th>
                <th className="py-4 px-6">Cliente</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    Carregando notificações...
                  </td>
                </tr>
              ) : notifications.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="h-6 w-6 text-slate-600" />
                      <span>Nenhuma notificação encontrada com os filtros selecionados.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                notifications.map((notif) => {
                  const clientInfo = (notif as any).client || {};
                  const tenantInfo = notif.tenant || {};

                  return (
                    <tr
                      key={notif.id}
                      id={`notification-row-${notif.id}`}
                      className="hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-mono text-[10px] text-slate-500">{notif.id}</div>
                        <div className="mt-1 font-mono text-slate-300">{formatDate(notif.created_at)}</div>
                      </td>
                      <td className="py-4 px-6 font-mono text-teal-500 font-semibold">
                        {renderText(notif.phone, '-')}
                      </td>
                      <td className="py-4 px-6 font-mono text-slate-400">
                        {renderText(notif.template_key, '-')}
                      </td>
                      <td className="py-4 px-6">
                        {tenantInfo.name ? (
                          <div className="font-semibold text-slate-200">{tenantInfo.name}</div>
                        ) : (
                          <div className="font-mono text-[10px] text-slate-500">{renderText(notif.tenant_id, 'N/A')}</div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {clientInfo.name ? (
                          <div className="font-semibold text-slate-200">{clientInfo.name}</div>
                        ) : (
                          <div className="font-mono text-[10px] text-slate-500">{renderText(notif.client_id, '-')}</div>
                        )}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <WhatsappStatusBadge status={notif.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Button
                          id={`btn-view-notif-${notif.id}`}
                          variant="gray"
                          onClick={() => onSelect(notif)}
                          className="p-2 h-8 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3 w-3" />
                          Ver Dossiê
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {lastPage > 1 && (
        <div className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-[4px]" id="table-pagination">
          <div className="text-xs text-slate-400">
            Página <span className="text-white font-semibold">{page}</span> de{' '}
            <span className="text-white font-semibold">{lastPage}</span>
            <span className="mx-2 text-slate-600">|</span>
            Total:{' '}
            <span className="text-white font-semibold">{total}</span> notificações
          </div>

          <div className="flex gap-2">
            <Button
              id="btn-pagination-prev"
              variant="gray"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1 || isLoading}
              className="h-8 px-3 text-xs"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Anterior
            </Button>
            <Button
              id="btn-pagination-next"
              variant="gray"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= lastPage || isLoading}
              className="h-8 px-3 text-xs"
            >
              Próximo
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
