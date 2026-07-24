import React, { useEffect, useState } from 'react';
import { ClipboardList, CheckCircle, ShieldAlert, RefreshCw } from 'lucide-react';
import { Subscription, ListarSubscriptionsParams } from '../types/billing-admin.types';
import { billingAdminService } from '../services/billing-admin.service';
import { SubscriptionFilters } from '../components/SubscriptionFilters';
import { SubscriptionTable } from '../components/SubscriptionTable';
import { SubscriptionDetailsModal } from '../components/SubscriptionDetailsModal';
import { SuspendSubscriptionModal } from '../components/SuspendSubscriptionModal';
import { CancelSubscriptionModal } from '../components/CancelSubscriptionModal';
import { ReactivateSubscriptionModal } from '../components/ReactivateSubscriptionModal';

interface SubscriptionsPageProps {
  onNavigate: (path: string) => void;
}

export const SubscriptionsPage: React.FC<SubscriptionsPageProps> = ({ onNavigate }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<ListarSubscriptionsParams>({
    page: 1,
    tenant_id: '',
    plan_id: 'all',
    status: 'all',
    billing_cycle: 'all',
    gateway: 'all',
  });

  // Dialog States
  const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
  
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isReactivateOpen, setIsReactivateOpen] = useState(false);

  // Toast indicator state
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const triggerToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  const fetchSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await billingAdminService.listarSubscriptions(filters);
      setSubscriptions(res.data);
      setTotal(res.total);
    } catch (err: any) {
      console.error('Failed to load subscriptions', err);
      setError(err?.message || 'Falha ao sincronizar lista de assinaturas com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      tenant_id: '',
      plan_id: 'all',
      status: 'all',
      billing_cycle: 'all',
      gateway: 'all',
    });
  };

  // Action confirmations
  const handleConfirmSuspend = async (id: string, reason: string) => {
    try {
      const response = await billingAdminService.suspenderSubscription(id, reason);
      triggerToast(response.message || 'Assinatura suspensa administrativamente com sucesso!');
      fetchSubscriptions();
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Não foi possível suspender esta assinatura.', 'error');
      throw err;
    }
  };

  const handleConfirmCancel = async (id: string, reason: string) => {
    try {
      const response = await billingAdminService.cancelarSubscription(id, reason);
      triggerToast(response.message || 'Assinatura cancelada definitivamente com sucesso!');
      fetchSubscriptions();
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Não foi possível cancelar esta assinatura.', 'error');
      throw err;
    }
  };

  const handleConfirmReactivate = async (id: string) => {
    try {
      const response = await billingAdminService.reativarSubscription(id);
      triggerToast(response.message || 'Assinatura reativada integralmente com sucesso!');
      fetchSubscriptions();
    } catch (err: any) {
      console.error(err);
      triggerToast(err?.message || 'Não foi possível reativar esta assinatura.', 'error');
      throw err;
    }
  };

  return (
    <div className="space-y-6 font-sans" id="subscriptions-page-root">
      {/* Toast Alert Indicator */}
      {toastMessage && (
        <div 
          className={`p-4 border rounded-[4px] text-xs flex gap-3 items-start animate-fade-in fixed top-4 right-4 z-[9999] shadow-2xl max-w-md ${
            toastMessage.type === 'success' 
              ? 'bg-teal-50 border-teal-200 text-teal-800 animate-slide-in' 
              : 'bg-rose-50 border-rose-200 text-rose-800 animate-slide-in'
          }`} 
          id="global-toast-indicator"
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-extrabold uppercase tracking-wide text-[10px] m-0 leading-none">Global Admin Cobranças</p>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-normal">{toastMessage.text}</p>
          </div>
        </div>
      )}

      {/* Toolbar heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-[4px]" id="subscriptions-module-toolbar">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 rounded-[4px] border border-teal-100 flex items-center justify-center shrink-0">
              <ClipboardList className="h-4.5 w-4.5 text-teal-600" />
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Gerenciamento de Assinaturas Ativas
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-1.5 pl-9">
            Visualize assinaturas, gerencie prazos operacionais, aplique suspensões e cancele contratos de estabelecimentos
          </p>
        </div>

        <button
          id="btn-sync-subscriptions"
          onClick={fetchSubscriptions}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-[4px] cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          SINCROINIZAR DADOS
        </button>
      </div>

      {/* Errors display */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-[4px] flex items-center gap-2" id="subscriptions-error-banner">
          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Subscription Filter cards */}
      <SubscriptionFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
      />

      {/* Table listing */}
      <SubscriptionTable
        data={subscriptions}
        total={total}
        page={filters.page || 1}
        lastPage={Math.ceil(total / 10) || 1}
        onPageChange={handlePageChange}
        onView={(sub) => {
          setSelectedSub(sub);
          setIsDetailOpen(true);
        }}
        onSuspend={(sub) => {
          setSelectedSub(sub);
          setIsSuspendOpen(true);
        }}
        onCancel={(sub) => {
          setSelectedSub(sub);
          setIsCancelOpen(true);
        }}
        onReactivate={(sub) => {
          setSelectedSub(sub);
          setIsReactivateOpen(true);
        }}
      />

      {/* Dialog Modals */}
      <SubscriptionDetailsModal
        subscription={selectedSub}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedSub(null);
        }}
      />

      <SuspendSubscriptionModal
        subscription={selectedSub}
        isOpen={isSuspendOpen}
        onClose={() => {
          setIsSuspendOpen(false);
          setSelectedSub(null);
        }}
        onConfirm={handleConfirmSuspend}
      />

      <CancelSubscriptionModal
        subscription={selectedSub}
        isOpen={isCancelOpen}
        onClose={() => {
          setIsCancelOpen(false);
          setSelectedSub(null);
        }}
        onConfirm={handleConfirmCancel}
      />

      <ReactivateSubscriptionModal
        subscription={selectedSub}
        isOpen={isReactivateOpen}
        onClose={() => {
          setIsReactivateOpen(false);
          setSelectedSub(null);
        }}
        onConfirm={handleConfirmReactivate}
      />
    </div>
  );
};
