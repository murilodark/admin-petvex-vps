import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  MessageSquare,
  History,
  Settings,
  FileText,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { WhatsappNotificationFilters } from '../components/WhatsappNotificationFilters';
import { WhatsappNotificationTable } from '../components/WhatsappNotificationTable';
import { WhatsappNotificationDetailsModal } from '../components/WhatsappNotificationDetailsModal';
import { WhatsappTemplateTable } from '../components/WhatsappTemplateTable';
import { WhatsappTemplateDetailsModal } from '../components/WhatsappTemplateDetailsModal';
import { WhatsappSettingsForm } from '../components/WhatsappSettingsForm';
import { whatsappNotificationService } from '../services/whatsapp-notification.service';
import { ListWhatsAppNotificationsParams, WhatsAppNotification, WhatsAppTemplate, WhatsAppSettings } from '../types/whatsapp-notification.types';

type TabType = 'history' | 'templates' | 'settings';

export const WhatsappNotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('history');

  // Notification states
  const [selectedNotification, setSelectedNotification] = useState<WhatsAppNotification | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [filters, setFilters] = useState<ListWhatsAppNotificationsParams>({
    page: 1,
    perPage: 10,
  });

  // Template states
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  // React Query - Notifications History
  const {
    data: notificationsRes,
    isLoading: isLoadingNotifications,
    isError: isErrorNotifications,
    error: errorNotifications,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ['whatsapp-notifications', filters],
    queryFn: () => whatsappNotificationService.listNotifications(filters),
    enabled: activeTab === 'history',
  });

  // React Query - Templates
  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    isError: isErrorTemplates,
    error: errorTemplates,
    refetch: refetchTemplates,
  } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: () => whatsappNotificationService.listTemplates(),
    enabled: activeTab === 'templates',
  });

  // React Query - Settings
  const {
    data: settingsData,
    isLoading: isLoadingSettings,
    isError: isErrorSettings,
    error: errorSettings,
    refetch: refetchSettings,
  } = useQuery({
    queryKey: ['whatsapp-settings'],
    queryFn: () => whatsappNotificationService.getSettings(),
    enabled: activeTab === 'settings',
  });

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = (newFilters: ListWhatsAppNotificationsParams) => {
    setFilters({
      ...newFilters,
      page: 1, // Reset page to 1 when filters change
      perPage: 10,
    });
  };

  const handleSelectNotification = (notification: WhatsAppNotification) => {
    setSelectedNotification(notification);
    setIsNotificationModalOpen(true);
  };

  const handleSelectTemplate = (template: WhatsAppTemplate) => {
    setSelectedTemplate(template);
    setIsTemplateModalOpen(true);
  };

  return (
    <div className="space-y-6 text-white" id="whatsapp-notifications-module-page">
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-[4px] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-[4px]">
            <MessageSquare className="h-6 w-6 text-teal-500" />
          </div>
          <div>
            <h1 className="text-xl font-sans font-medium tracking-tight uppercase text-slate-100">
              Notificações WhatsApp
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Gerencie templates, acompanhe o histórico de envios, analise falhas e controle as configurações de disparo do WhatsApp.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          {activeTab === 'history' && (
            <Button
              id="btn-refresh-history"
              variant="gray"
              onClick={() => refetchNotifications()}
              disabled={isLoadingNotifications}
              className="text-xs font-bold uppercase tracking-wider"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingNotifications ? 'animate-spin' : ''}`} />
              Atualizar Envios
            </Button>
          )}
          {activeTab === 'templates' && (
            <Button
              id="btn-refresh-templates"
              variant="gray"
              onClick={() => refetchTemplates()}
              disabled={isLoadingTemplates}
              className="text-xs font-bold uppercase tracking-wider"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingTemplates ? 'animate-spin' : ''}`} />
              Atualizar Templates
            </Button>
          )}
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-800 bg-slate-950 p-1 rounded-[4px] gap-2 no-scrollbar" id="whatsapp-tabs-bar" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          id="tab-btn-history"
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-bold rounded-[4px] transition-all cursor-pointer shrink-0 ${
            activeTab === 'history'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <History className="h-4 w-4 shrink-0" />
          Histórico de Envios
        </button>

        <button
          id="tab-btn-templates"
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-bold rounded-[4px] transition-all cursor-pointer shrink-0 ${
            activeTab === 'templates'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="h-4 w-4 shrink-0" />
          Templates cadastrados
        </button>

        <button
          id="tab-btn-settings"
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-bold rounded-[4px] transition-all cursor-pointer shrink-0 ${
            activeTab === 'settings'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Settings className="h-4 w-4 shrink-0" />
          Configurações
        </button>
      </div>

      {/* Tabs Content */}
      <div className="space-y-6" id="whatsapp-tabs-content">
        {/* TAB 1: HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6" id="tab-content-history">
            <WhatsappNotificationFilters
              onFilter={handleFilterChange}
              isLoading={isLoadingNotifications}
            />

            {isErrorNotifications ? (
              <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-[4px] flex items-start gap-3 text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Falha ao carregar histórico de notificações</p>
                  <p className="mt-1 font-mono text-[11px]">
                    {(errorNotifications as any)?.response?.data?.message || (errorNotifications as any)?.message || 'Erro inesperado'}
                  </p>
                </div>
              </div>
            ) : (
              <WhatsappNotificationTable
                notifications={notificationsRes?.data || []}
                total={notificationsRes?.total || 0}
                page={notificationsRes?.page || 1}
                lastPage={notificationsRes?.lastPage || 1}
                onPageChange={handlePageChange}
                onSelect={handleSelectNotification}
                isLoading={isLoadingNotifications}
              />
            )}
          </div>
        )}

        {/* TAB 2: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-6" id="tab-content-templates">
            {isErrorTemplates ? (
              <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-[4px] flex items-start gap-3 text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Falha ao carregar templates do WhatsApp</p>
                  <p className="mt-1 font-mono text-[11px]">
                    {(errorTemplates as any)?.response?.data?.message || (errorTemplates as any)?.message || 'Erro inesperado'}
                  </p>
                </div>
              </div>
            ) : (
              <WhatsappTemplateTable
                templates={templatesData || []}
                isLoading={isLoadingTemplates}
                onSelect={handleSelectTemplate}
              />
            )}
          </div>
        )}

        {/* TAB 3: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="space-y-6" id="tab-content-settings">
            {isErrorSettings ? (
              <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-[4px] flex items-start gap-3 text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Falha ao carregar as configurações do WhatsApp</p>
                  <p className="mt-1 font-mono text-[11px]">
                    {(errorSettings as any)?.response?.data?.message || (errorSettings as any)?.message || 'Erro inesperado'}
                  </p>
                </div>
              </div>
            ) : (
              <WhatsappSettingsForm
                settingsList={settingsData || null}
                onSaved={() => refetchSettings()}
                isLoading={isLoadingSettings}
              />
            )}
          </div>
        )}
      </div>

      {/* MODALS */}
      <WhatsappNotificationDetailsModal
        notification={selectedNotification}
        isOpen={isNotificationModalOpen}
        onClose={() => {
          setSelectedNotification(null);
          setIsNotificationModalOpen(false);
        }}
        onRefresh={() => {
          refetchNotifications();
          // Update the open dossier details from refetched data if it is open
          if (selectedNotification) {
            whatsappNotificationService.getNotification(selectedNotification.id).then((fresh) => {
              setSelectedNotification(fresh);
            }).catch(() => {});
          }
        }}
      />

      <WhatsappTemplateDetailsModal
        template={selectedTemplate}
        isOpen={isTemplateModalOpen}
        onClose={() => {
          setSelectedTemplate(null);
          setIsTemplateModalOpen(false);
        }}
      />
    </div>
  );
};
export default WhatsappNotificationsPage;
