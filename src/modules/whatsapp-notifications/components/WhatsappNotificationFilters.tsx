import React, { useState } from 'react';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { ListWhatsAppNotificationsParams } from '../types/whatsapp-notification.types';
import { Search, Calendar, RefreshCw } from 'lucide-react';

interface WhatsappNotificationFiltersProps {
  onFilter: (filters: ListWhatsAppNotificationsParams) => void;
  isLoading: boolean;
}

export const WhatsappNotificationFilters: React.FC<WhatsappNotificationFiltersProps> = ({
  onFilter,
  isLoading,
}) => {
  const [status, setStatus] = useState<string>('all');
  const [clientId, setClientId] = useState<string>('');
  const [appointmentId, setAppointmentId] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const handleApplyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    onFilter({
      status: status === 'all' ? undefined : status,
      client_id: clientId.trim() || undefined,
      appointment_id: appointmentId.trim() || undefined,
      date_from: dateFrom || undefined,
      date_to: dateTo || undefined,
    });
  };

  const handleClearFilters = () => {
    setStatus('all');
    setClientId('');
    setAppointmentId('');
    setDateFrom('');
    setDateTo('');
    onFilter({});
  };

  return (
    <form
      id="whatsapp-notification-filters-form"
      onSubmit={handleApplyFilters}
      className="bg-slate-900 border border-slate-800 p-6 rounded-[4px] space-y-4"
    >
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Status
          </label>
          <select
            id="filter-status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 text-white rounded-[4px] px-3 py-2 text-xs focus:outline-none focus:border-teal-500 transition-colors"
          >
            <option value="all">Todos</option>
            <option value="pending">Pendente</option>
            <option value="queued">Na Fila</option>
            <option value="sent">Enviado</option>
            <option value="delivered">Entregue</option>
            <option value="read">Lido</option>
            <option value="failed">Falhou</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            ID do Cliente
          </label>
          <Input
            id="filter-client-id"
            placeholder="ID do cliente..."
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            ID do Agendamento
          </label>
          <Input
            id="filter-appointment-id"
            placeholder="ID do agendamento..."
            value={appointmentId}
            onChange={(e) => setAppointmentId(e.target.value)}
            className="bg-slate-950 border-slate-800 text-white text-xs"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            De (Data de Envio)
          </label>
          <div className="relative">
            <Input
              id="filter-date-from"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Até (Data de Envio)
          </label>
          <div className="relative">
            <Input
              id="filter-date-to"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-slate-950 border-slate-800 text-white text-xs"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          id="btn-clear-filters"
          type="button"
          variant="gray"
          onClick={handleClearFilters}
          disabled={isLoading}
          className="text-[10px] uppercase tracking-wider font-bold h-9"
        >
          <RefreshCw className="h-3 w-3 mr-2" />
          Limpar Filtros
        </Button>
        <Button
          id="btn-apply-filters"
          type="submit"
          variant="info"
          disabled={isLoading}
          className="bg-teal-600 hover:bg-teal-700 text-white text-[10px] uppercase tracking-wider font-bold h-9"
        >
          <Search className="h-3 w-3 mr-2" />
          Filtrar
        </Button>
      </div>
    </form>
  );
};
