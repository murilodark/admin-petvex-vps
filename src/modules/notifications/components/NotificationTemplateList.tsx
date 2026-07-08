import React, { useState } from 'react';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Shield,
  FileText,
  ToggleLeft,
  ToggleRight,
  Filter,
  Eye,
  Info,
} from 'lucide-react';
import { NotificationTemplate } from '../types/notification';

interface NotificationTemplateListProps {
  templates: NotificationTemplate[];
  total: number;
  page: number;
  perPage: number;
  isLoading: boolean;
  onPageChange: (newPage: number) => void;
  onEdit: (template: NotificationTemplate) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, currentlyActive: boolean) => void;
  onOpenBlocks: (template: NotificationTemplate) => void;
  onAddNew: () => void;
  filters: any;
  onFiltersChange: (newFilters: any) => void;
}

export const NotificationTemplateList: React.FC<NotificationTemplateListProps> = ({
  templates,
  total,
  page,
  perPage,
  isLoading,
  onPageChange,
  onEdit,
  onDelete,
  onToggleActive,
  onOpenBlocks,
  onAddNew,
  filters,
  onFiltersChange,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({ ...filters, search: e.target.value, page: 1 });
  };

  const handleFilterChange = (key: string, value: any) => {
    onFiltersChange({ ...filters, [key]: value, page: 1 });
  };

  const getModuleBadge = (mod: string) => {
    const map: any = {
      appointments: { label: 'Consultas', bg: 'bg-purple-950/40 text-purple-400 border border-purple-900/40' },
      clients: { label: 'Clientes', bg: 'bg-blue-950/40 text-blue-400 border border-blue-900/40' },
      sales: { label: 'Vendas', bg: 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/40' },
      billing: { label: 'Faturamento', bg: 'bg-amber-950/40 text-amber-400 border border-amber-900/40' },
      stock: { label: 'Estoque', bg: 'bg-cyan-950/40 text-cyan-400 border border-cyan-900/40' },
      system: { label: 'Sistema', bg: 'bg-slate-950/40 text-slate-400 border border-slate-900/40' },
    };
    const item = map[mod] || { label: mod, bg: 'bg-slate-850 text-slate-300' };
    return <span className={`px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase rounded ${item.bg}`}>{item.label}</span>;
  };

  const getEventBadge = (evt: string) => {
    const map: any = {
      confirmation: { label: 'Confirmação', bg: 'bg-emerald-950/20 text-emerald-300' },
      cancellation: { label: 'Cancelamento', bg: 'bg-rose-950/20 text-rose-300' },
      reminder: { label: 'Lembrete', bg: 'bg-orange-950/20 text-orange-300' },
      payment_pending: { label: 'Fat. Pendente', bg: 'bg-amber-950/20 text-amber-300' },
      sale_finished: { label: 'Venda Concluída', bg: 'bg-indigo-950/20 text-indigo-300' },
      custom: { label: 'Customizado', bg: 'bg-slate-850 text-slate-300' },
    };
    const item = map[evt] || { label: evt, bg: 'bg-slate-850 text-slate-300' };
    return <span className={`px-2 py-0.5 text-[10px] rounded ${item.bg}`}>{item.label}</span>;
  };

  const getChannelBadge = (chan: string) => {
    const map: any = {
      whatsapp_manual: { label: 'WhatsApp', bg: 'bg-teal-500/10 text-teal-400 border border-teal-500/20' },
      email: { label: 'E-mail', bg: 'bg-blue-500/10 text-blue-400 border border-blue-500/20' },
      sms: { label: 'SMS', bg: 'bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20' },
      push: { label: 'Push', bg: 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' },
      system: { label: 'Sistema', bg: 'bg-slate-500/10 text-slate-400 border border-slate-500/20' },
    };
    const item = map[chan] || { label: chan, bg: 'bg-slate-850 text-slate-300 border border-slate-700' };
    return <span className={`px-2 py-0.5 text-[10px] font-mono font-medium rounded ${item.bg}`}>{item.label}</span>;
  };

  const getSendTypeBadge = (st: string) => {
    const map: any = {
      manual: { label: 'Manual', bg: 'text-amber-400 border border-amber-900/40 bg-amber-950/20' },
      automatic: { label: 'Automático', bg: 'text-indigo-400 border border-indigo-900/40 bg-indigo-950/20' },
      both: { label: 'Misto', bg: 'text-cyan-400 border border-cyan-900/40 bg-cyan-950/20' },
    };
    const item = map[st] || { label: st, bg: 'bg-slate-800 text-slate-400 border border-slate-700' };
    return <span className={`px-2 py-0.5 text-[10px] rounded font-medium ${item.bg}`}>{item.label}</span>;
  };

  const lastPage = Math.ceil(total / perPage) || 1;

  return (
    <div className="space-y-4" id="notifications-template-list-container">
      {/* Search and Filters Header */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por chave ou nome..."
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
            <Filter className="h-3.5 w-3.5" /> Filtros
          </button>
          <button
            onClick={onAddNew}
            className="flex items-center gap-1.5 px-3 py-2 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-[4px] text-xs font-semibold tracking-wide transition-all"
          >
            <Plus className="h-4 w-4" /> Novo Template
          </button>
        </div>
      </div>

      {/* Advanced Filters Drawer/Row */}
      {showAdvanced && (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-[4px] grid grid-cols-2 md:grid-cols-4 gap-4 transition-all">
          {/* Module Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Módulo</label>
            <select
              value={filters.module || 'all'}
              onChange={(e) => handleFilterChange('module', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-[4px] p-2 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Todos os Módulos</option>
              <option value="appointments">Consultas</option>
              <option value="clients">Clientes</option>
              <option value="sales">Vendas</option>
              <option value="billing">Faturamento</option>
              <option value="stock">Estoque</option>
              <option value="system">Sistema</option>
            </select>
          </div>

          {/* Event Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Evento de Disparo</label>
            <select
              value={filters.event || 'all'}
              onChange={(e) => handleFilterChange('event', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-[4px] p-2 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Todos os Eventos</option>
              <option value="confirmation">Confirmação</option>
              <option value="cancellation">Cancelamento</option>
              <option value="reminder">Lembrete</option>
              <option value="payment_pending">Faturamento Pendente</option>
              <option value="sale_finished">Venda Concluída</option>
              <option value="custom">Customizado</option>
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
              <option value="whatsapp_manual">WhatsApp Manual</option>
              <option value="email">E-mail</option>
              <option value="sms">SMS</option>
              <option value="push">Push</option>
              <option value="system">Sistema</option>
            </select>
          </div>

          {/* Send Type Filter */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tipo de Envio</label>
            <select
              value={filters.send_type || 'all'}
              onChange={(e) => handleFilterChange('send_type', e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-[4px] p-2 focus:outline-none focus:border-teal-500"
            >
              <option value="all">Todos os Tipos</option>
              <option value="manual">Manual</option>
              <option value="automatic">Automático</option>
              <option value="both">Misto</option>
            </select>
          </div>
        </div>
      )}

      {/* Templates Table Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-[4px] overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold">
            Carregando lista de templates de notificações...
          </div>
        ) : templates.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs font-semibold">
            Nenhum template encontrado com os filtros aplicados.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/40">
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Template / Chave</th>
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] hidden md:table-cell">Módulo / Evento</th>
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px]">Canal / Envio</th>
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] text-center">Status</th>
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] text-center">Padrão</th>
                  <th className="p-3 text-slate-500 font-bold uppercase tracking-widest text-[10px] text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {templates.map((template) => (
                  <tr key={template.id} className="hover:bg-slate-950/30 transition-all">
                    {/* Name and Key */}
                    <td className="p-3">
                      <div className="space-y-0.5">
                        <span className="font-semibold text-slate-200 text-xs block">{template.name}</span>
                        <code className="text-[10px] text-teal-400 font-mono font-medium block">{template.key}</code>
                        {template.description && (
                          <span className="text-[10px] text-slate-500 block truncate max-w-xs">{template.description}</span>
                        )}
                      </div>
                    </td>

                    {/* Module and Event */}
                    <td className="p-3 hidden md:table-cell">
                      <div className="flex flex-col gap-1 items-start">
                        {getModuleBadge(template.module)}
                        {getEventBadge(template.event)}
                      </div>
                    </td>

                    {/* Channel and Send Type */}
                    <td className="p-3">
                      <div className="flex flex-col gap-1 items-start">
                        {getChannelBadge(template.channel)}
                        {getSendTypeBadge(template.send_type)}
                      </div>
                    </td>

                    {/* Active Toggle */}
                    <td className="p-3 text-center">
                      <button
                        onClick={() => onToggleActive(template.id, !!template.is_active)}
                        className={`inline-flex items-center justify-center p-1 rounded transition-all ${
                          template.is_active ? 'text-teal-400 hover:text-teal-300' : 'text-slate-600 hover:text-slate-500'
                        }`}
                        title={template.is_active ? 'Desativar template' : 'Ativar template'}
                      >
                        {template.is_active ? <ToggleRight className="h-6 w-6" /> : <ToggleLeft className="h-6 w-6" />}
                      </button>
                    </td>

                    {/* Default Indicator */}
                    <td className="p-3 text-center">
                      {template.is_default ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-blue-500/15 text-blue-400 border border-blue-500/25">
                          Sim
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px]">—</span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="p-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Tenant Blocks button */}
                        <button
                          onClick={() => onOpenBlocks(template)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-850 rounded text-rose-400 hover:text-rose-300 transition-all flex items-center gap-1"
                          title="Gerenciar Bloqueios por Clínica"
                        >
                          <Shield className="h-3.5 w-3.5" />
                          <span className="text-[10px] font-bold hidden xl:inline">Clínicas</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          onClick={() => onEdit(template)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-slate-300 hover:text-teal-400 transition-all"
                          title="Editar Template"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => onDelete(template.id)}
                          className="p-1.5 bg-slate-950 hover:bg-slate-850 border border-slate-800 rounded text-slate-500 hover:text-rose-500 transition-all"
                          title="Excluir Template"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {!isLoading && lastPage > 1 && (
          <div className="bg-slate-950/60 border-t border-slate-800 p-3 flex justify-between items-center text-[11px] text-slate-400">
            <span>
              Mostrando página <strong>{page}</strong> de <strong>{lastPage}</strong> (Total: {total} registros)
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
