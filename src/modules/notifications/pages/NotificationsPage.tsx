import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Bell,
  History,
  Activity,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { notificationService } from '../services/notification.service';
import { tenantsService } from '../../tenants/services/tenants.service';
import { NotificationStatsCards } from '../components/NotificationStatsCards';
import { NotificationTemplateList } from '../components/NotificationTemplateList';
import { NotificationTemplateForm } from '../components/NotificationTemplateForm';
import { NotificationTemplateTenantBlocks } from '../components/NotificationTemplateTenantBlocks';
import { NotificationDispatchList } from '../components/NotificationDispatchList';
import { NotificationDispatchDetails } from '../components/NotificationDispatchDetails';
import { NotificationTemplate, NotificationDispatch, ListTemplatesParams, ListDispatchesParams } from '../types/notification';

type TabType = 'templates' | 'history' | 'stats';

export const NotificationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('templates');

  // Templates list states
  const [templateFilters, setTemplateFilters] = useState<ListTemplatesParams>({
    page: 1,
    perPage: 10,
  });

  // Dispatches history states
  const [dispatchFilters, setDispatchFilters] = useState<ListDispatchesParams>({
    page: 1,
    perPage: 10,
  });

  // Modal / Editor States
  const [editingTemplate, setEditingTemplate] = useState<NotificationTemplate | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedTemplateForBlocks, setSelectedTemplateForBlocks] = useState<NotificationTemplate | null>(null);
  const [inspectingDispatch, setInspectingDispatch] = useState<NotificationDispatch | null>(null);

  // Status Alerts
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const triggerAlert = (type: 'success' | 'error', text: string) => {
    if (type === 'success') {
      setSuccessMsg(text);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setErrorMsg(text);
      setTimeout(() => setErrorMsg(null), 4000);
    }
  };

  // ----------------------------------------------------
  // React Queries
  // ----------------------------------------------------

  // 1. Tenants list (for filters and block modal)
  const { data: tenantsRes } = useQuery({
    queryKey: ['admin-tenants-simple'],
    queryFn: () => tenantsService.listarTenants({ perPage: 100 }),
  });
  const tenantsList = tenantsRes?.data || [];

  // 2. Templates Queries
  const {
    data: templatesRes,
    isLoading: isLoadingTemplates,
    isError: isErrorTemplates,
    error: errorTemplates,
    refetch: refetchTemplates,
  } = useQuery({
    queryKey: ['notification-templates', templateFilters],
    queryFn: () => notificationService.listTemplates(templateFilters),
    enabled: activeTab === 'templates',
  });

  // 3. Template Statistics
  const {
    data: templateStats,
    isLoading: isLoadingTemplateStats,
    refetch: refetchTemplateStats,
  } = useQuery({
    queryKey: ['notification-template-stats'],
    queryFn: () => notificationService.getTemplateStats(),
    enabled: activeTab === 'stats' || activeTab === 'templates',
  });

  // 4. Dispatches History Queries
  const {
    data: dispatchesRes,
    isLoading: isLoadingDispatches,
    isError: isErrorDispatches,
    error: errorDispatches,
    refetch: refetchDispatches,
  } = useQuery({
    queryKey: ['notification-dispatches', dispatchFilters],
    queryFn: () => notificationService.listDispatches(dispatchFilters),
    enabled: activeTab === 'history',
  });

  // 5. Dispatch Statistics
  const {
    data: dispatchStats,
    isLoading: isLoadingDispatchStats,
    refetch: refetchDispatchStats,
  } = useQuery({
    queryKey: ['notification-dispatch-stats'],
    queryFn: () => notificationService.getDispatchStats(),
    enabled: activeTab === 'stats',
  });

  // ----------------------------------------------------
  // Mutations / CRUD Handlers
  // ----------------------------------------------------

  // Save Template Mutation
  const saveTemplateMutation = useMutation({
    mutationFn: async (formData: any) => {
      if (editingTemplate) {
        return await notificationService.updateTemplate(editingTemplate.id, formData);
      } else {
        return await notificationService.createTemplate(formData);
      }
    },
    onSuccess: () => {
      triggerAlert('success', `Template gravado com sucesso.`);
      setIsFormOpen(false);
      setEditingTemplate(null);
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      queryClient.invalidateQueries({ queryKey: ['notification-template-stats'] });
    },
    onError: (err: any) => {
      triggerAlert('error', err?.response?.data?.message || 'Falha ao salvar o template. Verifique se os dados são válidos.');
    },
  });

  // Toggle Active/Inactive Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      if (active) {
        return await notificationService.deactivateTemplate(id);
      } else {
        return await notificationService.activateTemplate(id);
      }
    },
    onSuccess: (_, variables) => {
      const action = variables.active ? 'desativado' : 'ativado';
      triggerAlert('success', `Template ${action} com sucesso.`);
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      queryClient.invalidateQueries({ queryKey: ['notification-template-stats'] });
    },
    onError: () => {
      triggerAlert('error', 'Erro ao alterar o status do template.');
    },
  });

  // Delete Template Mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      return await notificationService.deleteTemplate(id);
    },
    onSuccess: () => {
      triggerAlert('success', 'Template excluído com sucesso.');
      queryClient.invalidateQueries({ queryKey: ['notification-templates'] });
      queryClient.invalidateQueries({ queryKey: ['notification-template-stats'] });
    },
    onError: (err: any) => {
      triggerAlert('error', err?.response?.data?.message || 'Erro ao excluir o template.');
    },
  });

  // ----------------------------------------------------
  // UX Interaction Actions
  // ----------------------------------------------------

  const handleEditClick = (template: NotificationTemplate) => {
    setEditingTemplate(template);
    setIsFormOpen(true);
  };

  const handleAddNewClick = () => {
    setEditingTemplate(null);
    setIsFormOpen(true);
  };

  const handleToggleActiveClick = (id: string, currentlyActive: boolean) => {
    toggleActiveMutation.mutate({ id, active: currentlyActive });
  };

  const handleDeleteClick = (id: string) => {
    if (window.confirm('Atenção: Tem certeza de que deseja excluir este template de notificação permanentemente? Esta ação não pode ser desfeita.')) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const handleRefreshClick = () => {
    if (activeTab === 'templates') {
      refetchTemplates();
      refetchTemplateStats();
    } else if (activeTab === 'history') {
      refetchDispatches();
    } else if (activeTab === 'stats') {
      refetchTemplateStats();
      refetchDispatchStats();
    }
  };

  return (
    <div className="space-y-6 text-white" id="notifications-management-page">
      
      {/* Title Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800 p-6 rounded-[4px] shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-teal-500/10 border border-teal-500/20 rounded-[4px]">
            <Bell className="h-6 w-6 text-teal-500" />
          </div>
          <div>
            <h1 className="text-xl font-sans font-medium tracking-tight uppercase text-slate-100">
              Gerenciamento de Notificações
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Configure templates de sistema, controle disparos automáticos de eventos e monitore os logs de envio por e-mail, SMS e WhatsApp.
            </p>
          </div>
        </div>

        <button
          onClick={handleRefreshClick}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-300 rounded-[4px] transition-all"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Atualizar Dados
        </button>
      </div>

      {/* Floating Status Alerts */}
      {successMsg && (
        <div className="fixed top-4 right-4 bg-emerald-950/90 border border-emerald-500 text-emerald-300 p-3.5 rounded-[4px] shadow-2xl flex items-center gap-2 z-50 animate-bounce text-xs font-semibold">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="fixed top-4 right-4 bg-rose-950/90 border border-rose-500 text-rose-300 p-3.5 rounded-[4px] shadow-2xl flex items-center gap-2 z-50 animate-shake text-xs font-semibold">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs Menu Selection Bar */}
      <div className="flex overflow-x-auto whitespace-nowrap border-b border-slate-800 bg-slate-950 p-1 rounded-[4px] gap-2 no-scrollbar" id="notifications-tabs-bar" style={{ WebkitOverflowScrolling: 'touch' }}>
        <button
          onClick={() => setActiveTab('templates')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-bold rounded-[4px] transition-all cursor-pointer shrink-0 ${
            activeTab === 'templates'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <FileText className="h-4 w-4 shrink-0" /> Templates Gerais
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-bold rounded-[4px] transition-all cursor-pointer shrink-0 ${
            activeTab === 'history'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <History className="h-4 w-4 shrink-0" /> Histórico de Disparos
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`flex items-center gap-2 px-5 py-3 text-xs uppercase tracking-wider font-bold rounded-[4px] transition-all cursor-pointer shrink-0 ${
            activeTab === 'stats'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
        >
          <Activity className="h-4 w-4 shrink-0" /> Relatórios & Estatísticas
        </button>
      </div>

      {/* Tab Panels */}
      <div className="space-y-6" id="notifications-tab-panels">
        
        {/* TAB 1: TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            {isErrorTemplates ? (
              <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-[4px] flex items-start gap-3 text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Falha de conexão com a API de Templates</p>
                  <p className="mt-1 font-mono text-[11px]">
                    {(errorTemplates as any)?.response?.data?.message || (errorTemplates as any)?.message || 'Erro de rede ou permissão.'}
                  </p>
                </div>
              </div>
            ) : (
              <NotificationTemplateList
                templates={templatesRes?.data || []}
                total={templatesRes?.total || 0}
                page={templateFilters.page || 1}
                perPage={templateFilters.perPage || 10}
                isLoading={isLoadingTemplates}
                onPageChange={(p) => setTemplateFilters({ ...templateFilters, page: p })}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                onToggleActive={handleToggleActiveClick}
                onOpenBlocks={(tpl) => setSelectedTemplateForBlocks(tpl)}
                onAddNew={handleAddNewClick}
                filters={templateFilters}
                onFiltersChange={setTemplateFilters}
              />
            )}
          </div>
        )}

        {/* TAB 2: DISPATCH HISTORY */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {isErrorDispatches ? (
              <div className="p-6 bg-rose-950/20 border border-rose-500/30 rounded-[4px] flex items-start gap-3 text-rose-400">
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold">Falha de conexão com a API de Histórico</p>
                  <p className="mt-1 font-mono text-[11px]">
                    {(errorDispatches as any)?.response?.data?.message || (errorDispatches as any)?.message || 'Erro de comunicação.'}
                  </p>
                </div>
              </div>
            ) : (
              <NotificationDispatchList
                dispatches={dispatchesRes?.data || []}
                total={dispatchesRes?.total || 0}
                page={dispatchFilters.page || 1}
                perPage={dispatchFilters.perPage || 10}
                isLoading={isLoadingDispatches}
                onPageChange={(p) => setDispatchFilters({ ...dispatchFilters, page: p })}
                onViewDetails={(disp) => setInspectingDispatch(disp)}
                filters={dispatchFilters}
                onFiltersChange={setDispatchFilters}
                tenants={tenantsList}
              />
            )}
          </div>
        )}

        {/* TAB 3: STATS & DASHBOARDS */}
        {activeTab === 'stats' && (
          <NotificationStatsCards
            templateStats={templateStats || null}
            dispatchStats={dispatchStats || null}
            isLoading={isLoadingTemplateStats || isLoadingDispatchStats}
          />
        )}

      </div>

      {/* ----------------------------------------------------
          MODALS & DRAWERS MOUNTPOINT
         ---------------------------------------------------- */}

      {/* Template Create / Edit Form Drawer */}
      {isFormOpen && (
        <NotificationTemplateForm
          template={editingTemplate}
          onSave={(data) => saveTemplateMutation.mutate(data)}
          onClose={() => {
            setIsFormOpen(false);
            setEditingTemplate(null);
          }}
          isSaving={saveTemplateMutation.isPending}
        />
      )}

      {/* Tenant Blocks Restriction Modal */}
      {selectedTemplateForBlocks && (
        <NotificationTemplateTenantBlocks
          template={selectedTemplateForBlocks}
          onClose={() => setSelectedTemplateForBlocks(null)}
          onUpdateCount={() => {
            refetchTemplates();
            refetchTemplateStats();
          }}
        />
      )}

      {/* Dispatch Details Inspector Modal */}
      {inspectingDispatch && (
        <NotificationDispatchDetails
          dispatch={inspectingDispatch}
          onClose={() => setInspectingDispatch(null)}
        />
      )}

    </div>
  );
};
export default NotificationsPage;
