import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, AlertTriangle, HelpCircle, Search, ShieldAlert, Check, X } from 'lucide-react';
import { WhatsAppSettings } from '../types/whatsapp-notification.types';
import { Button } from '../../../shared/components/ui/Button';
import { whatsappNotificationService } from '../services/whatsapp-notification.service';

interface WhatsappSettingsFormProps {
  settingsList: WhatsAppSettings[] | null;
  onSaved: () => void;
  isLoading: boolean;
}

export const WhatsappSettingsForm: React.FC<WhatsappSettingsFormProps> = ({
  settingsList = [],
  onSaved,
  isLoading,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingTenantId, setUpdatingTenantId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ success: boolean; message: string } | null>(null);

  const handleToggle = async (tenantId: string | undefined, currentStatus: boolean | undefined) => {
    if (!tenantId) return;
    setUpdatingTenantId(tenantId);
    setFeedback(null);

    try {
      const payload: WhatsAppSettings = {
        appointment_reminder_confirmation: !currentStatus,
      };
      await whatsappNotificationService.updateSettings(tenantId, payload);
      setFeedback({
        success: true,
        message: `Configurações da clínica atualizadas com sucesso!`,
      });
      onSaved();
    } catch (err: any) {
      setFeedback({
        success: false,
        message: err?.response?.data?.message || err?.message || 'Falha ao atualizar configurações.',
      });
    } finally {
      setUpdatingTenantId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-slate-900 border border-slate-800 p-8 rounded-[4px] text-center text-slate-500 font-medium">
        Carregando configurações das clínicas...
      </div>
    );
  }

  const list = settingsList || [];
  const filteredList = list.filter((item) => {
    const tenantName = item.tenant?.name?.toLowerCase() || '';
    const tenantEmail = item.tenant?.email?.toLowerCase() || '';
    const id = item.tenant_id?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return tenantName.includes(search) || tenantEmail.includes(search) || id.includes(search);
  });

  return (
    <div className="space-y-6" id="whatsapp-settings-container">
      <div className="bg-slate-900 border border-slate-800 rounded-[4px] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="font-sans font-medium text-xs uppercase tracking-widest text-slate-400">
              Configurações do WhatsApp por Clínica (Tenant)
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Habilite ou desabilite os disparos automáticos de confirmação de consultas individualmente para cada clínica parceira.
            </p>
          </div>

          {/* Local Search Input */}
          <div className="relative max-w-xs w-full" id="settings-search-wrapper">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar clínica..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 text-white pl-9 pr-4 py-1.5 border border-slate-800 rounded-[4px] text-xs focus:outline-none focus:border-teal-500 font-medium"
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 text-white">
          {/* Feedback message */}
          {feedback && (
            <div
              id="settings-feedback-alert"
              className={`p-4 rounded-[4px] border flex items-start gap-3 ${
                feedback.success
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {feedback.success ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-teal-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 shrink-0 text-rose-500 mt-0.5" />
              )}
              <div className="text-xs">
                <p className="font-bold">{feedback.success ? 'Atualizado' : 'Erro'}</p>
                <p className="mt-1">{feedback.message}</p>
              </div>
            </div>
          )}

          {/* Tenants Settings Table */}
          <div className="border border-slate-800 rounded-[4px] overflow-hidden bg-slate-950">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse" id="tenant-settings-table">
                <thead>
                  <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-3 px-6">Clínica / Tenant</th>
                    <th className="py-3 px-6">ID do Tenant</th>
                    <th className="py-3 px-6">Email de Contato</th>
                    <th className="py-3 px-6 text-center">Disparar Confirmação Automática</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
                  {filteredList.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-slate-500 font-medium">
                        {list.length === 0 ? 'Nenhuma configuração de clínica encontrada.' : 'Nenhuma clínica corresponde à pesquisa.'}
                      </td>
                    </tr>
                  ) : (
                    filteredList.map((item) => {
                      const isToggling = updatingTenantId === item.tenant_id;
                      const isEnabled = !!item.appointment_reminder_confirmation;

                      return (
                        <tr
                          key={item.tenant_id || item.id}
                          className="hover:bg-slate-900/60 transition-colors"
                        >
                          <td className="py-4 px-6 font-semibold text-slate-200">
                            {item.tenant?.name || 'Clínica Sem Nome'}
                          </td>
                          <td className="py-4 px-6 font-mono text-[11px] text-slate-400">
                            {item.tenant_id}
                          </td>
                          <td className="py-4 px-6 text-slate-400">
                            {item.tenant?.email || '-'}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-3">
                              {/* Display simple text label */}
                              <span
                                className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-[4px] border ${
                                  isEnabled
                                    ? 'bg-teal-500/10 text-teal-400 border-teal-500/20'
                                    : 'bg-slate-900 text-slate-500 border-slate-800'
                                }`}
                              >
                                {isEnabled ? 'Ativado' : 'Desativado'}
                              </span>

                              {/* Toggle switch button */}
                              <button
                                type="button"
                                disabled={isToggling}
                                onClick={() => handleToggle(item.tenant_id, isEnabled)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50 ${
                                  isEnabled ? 'bg-teal-500' : 'bg-slate-800'
                                }`}
                              >
                                <span className="sr-only">Toggle disparo automático</span>
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                                    isEnabled ? 'translate-x-4' : 'translate-x-0'
                                  }`}
                                >
                                  {isToggling && (
                                    <RefreshCw className="h-2 w-2 animate-spin text-teal-600 absolute inset-1 m-auto" />
                                  )}
                                </span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-[4px] flex gap-3 text-slate-400 text-xs">
            <HelpCircle className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />
            <div className="space-y-1 leading-relaxed">
              <p className="font-bold text-slate-300">Configuração Isolada por Tenant</p>
              <p>
                Os parâmetros de envio acima operam de forma isolada em nível de banco de dados por Tenant (Clínica). Nenhuma credencial do WhatsApp, tokens da Meta ou chaves de API do Facebook são exibidos ou alterados neste ambiente administrativo, garantindo a máxima segurança e conformidade operacional.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
