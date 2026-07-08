import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  Calendar,
  RefreshCw,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  Building,
} from 'lucide-react';
import { NotificationDispatch } from '../types/notification';

interface NotificationDispatchListProps {
  dispatches: NotificationDispatch[];
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onViewDetails: (dispatch: NotificationDispatch) => void;
  filters: any;
  onFiltersChange: (newFilters: any) => void;
  tenants: any[];
}

export const NotificationDispatchList: React.FC<NotificationDispatchListProps> = ({
  dispatches,
  total,
  page,
  perPage,
  isLoading,
  onPageChange,
  onViewDetails,
  filters,
  onFiltersChange,
  tenants,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

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
    return <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded ${item.bg}`}>{item.label}</span>;
  };

  const getChannelBadge = (chan: string) => {
    const map: any = {
      whatsapp_manual: { label: 'WhatsApp', bg: 'text-teal-400' },
      email: { label: 'E-mail', bg: 'text-blue-400' },
      sms: { label: 'SMS', bg: 'text-fuchsia-400' },
      push: { label: 'Push', bg: 'text-indigo-400' },
      system: { label: 'Sistema', bg: 'text-slate-400' },
    };
    const item = map[chan] || { label: chan, bg: 'text-slate-400' };
    return <span className={`font-mono text-[10px] font-semibold ${item.bg}`}>{item.label}</span>;
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return '—';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const lastPage = Math.ceil(total / perPage) || 1;

  return (
    <div className="space-y-4" id="notifications-dispatch-list-container">
      {/* Filters bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por destinatário, contato, conteúdo..."
            value={filters.search || ''}
            onChange={handleSearchChange}
            className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-[4px] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto shrink-0 justify-end">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-2 border rounded-[4px] text-xs font-semibold tracking-wide transition-all ${
              showAdvanced
                ? 'border-teal-500/30 bg-teal-500/10 text-teal-400'
                : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
            }`}
          >
            <Filter className="h-3.5 w-3.5" /> Filtros Avançados
          </button>
          <button
            onClick={() => onFiltersChange({ ...filters, page: 1 })}
            className="p-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 rounded-[4px] text-slate-400 hover:text-white transition-all"
            title="Recarregar"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Advanced filters drawer */}
      {showAdvanced && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] grid grid-cols-2 md:grid-cols-5 gap-4 transition-all">
          {/* Tenant Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Clínica</label>
            <select
              value={filters.tenant_id || 'all'}
              onChange={(e) => handleFilterChange('tenant_id', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-[4px] p-2 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Todas as Clínicas</option>
              {tenants.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Channel Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Canal</label>
            <select
              value={filters.channel || 'all'}
              onChange={(e) => handleFilterChange('channel', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-[4px] p-2 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Todos os Canais</option>
              <option value="whatsapp_manual">WhatsApp</option>
              <option value="email">E-mail</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
              <option value="system">Sistema</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Status</label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-[4px] p-2 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Todos os Status</option>
              <option value="generated">Gerado</option>
              <option value="pending">Pendente</option>
              <option value="queued">Em Fila</option>
              <option value="sent">Enviado</option>
              <option value="failed">Falhou</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>

          {/* Date From */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> De
            </label>
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => handleFilterChange('date_from', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-[4px] p-2 focus:outline-none focus:border-teal-500"
            />
          </div>

          {/* Date To */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Até
            </label>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => handleFilterChange('date_to', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-[4px] p-2 focus:outline-none focus:border-teal-500"
            />
          </div>
        </div>
      )}

      {/* Dispatches Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-[4px] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold">
            Carregando histórico de envios...
          </div>
        ) : dispatches.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold">
            Nenhum disparo registrado com os filtros informados.
          </div>
        ) : (
          <div className="overflow-x-auto animate-fade-in">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Destinatário / Contato</th>
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Clínica (Tenant)</th>
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] hidden md:table-cell">Mensagem / Canal</th>
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] text-center">Status</th>
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Data Envio</th>
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] text-right">Detalhamento</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {dispatches.map((dispatch) => (
                  <tr key={dispatch.id} className="hover:bg-slate-950/30 transition-all">
                    {/* Recipient */}
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200 text-xs block">{dispatch.recipient || 'Destinatário'}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">{dispatch.contact || '—'}</span>
                      </div>
                    </td>

                    {/* Clinic/Tenant */}
                    <td className="p-3">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Building className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span className="truncate max-w-[150px] font-medium" title={dispatch.tenant?.name}>
                          {dispatch.tenant?.name || `Clínica ID: ${dispatch.tenant_id}`}
                        </span>
                      </div>
                    </td>

                    {/* Message Preview */}
                    <td className="p-3 hidden md:table-cell">
                      <div className="space-y-0.5 max-w-sm">
                        <span className="text-slate-400 block truncate text-[11px] leading-relaxed">{dispatch.body}</span>
                        <div className="flex gap-2 items-center text-[10px]">
                          {getChannelBadge(dispatch.channel)}
                          <span className="text-slate-600 font-bold">•</span>
                          <span className="text-slate-500 font-mono text-[9px] uppercase">{dispatch.module} / {dispatch.event}</span>
                        </div>
                      </div>
                    </td>

                    {/* Status badge */}
                    <td className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        {getStatusBadge(dispatch.status)}
                        {dispatch.error_message && (
                          <span className="text-[9px] text-rose-400 max-w-[120px] truncate block" title={dispatch.error_message}>
                            {dispatch.error_message}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Sent Date */}
                    <td className="p-3 font-mono text-slate-400 text-[10px]">
                      {formatDateTime(dispatch.created_at)}
                    </td>

                    {/* Inspect button */}
                    <td className="p-3 text-right">
                      <button
                        onClick={() => onViewDetails(dispatch)}
                        className="px-2.5 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded text-teal-400 hover:text-teal-300 font-bold text-[10px] uppercase tracking-wide transition-all flex items-center gap-1 ml-auto"
                      >
                        <Eye className="h-3.5 w-3.5" /> Inspetor
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!isLoading && lastPage > 1 && (
          <div className="bg-slate-950/60 border-t border-slate-800 p-3 flex justify-between items-center text-[11px] text-slate-400">
            <span>
              Mostrando disparos <strong>{page}</strong> de <strong>{lastPage}</strong> (Total: {total} logs)
            </span>
            <div className="flex gap-1.5">
              <button
                disabled={page <= 1}
                onClick={() => onPageChange(page - 1)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-white disabled:opacity-30 transition-all"
              >
                Anterior
              </button>
              <button
                disabled={page >= lastPage}
                onClick={() => onPageChange(page + 1)}
                className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-slate-300 hover:text-white disabled:opacity-30 transition-all"
              >
                Próxima
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
