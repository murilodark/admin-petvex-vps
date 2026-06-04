import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { TenantDashboardHeader } from './components/TenantDashboardHeader';
import { TenantDashboardSidebar } from './components/TenantDashboardSidebar';
import { TenantDashboardSummary } from './components/TenantDashboardSummary';
import { TenantDashboardTabs } from './components/TenantDashboardTabs';
import { TenantForm } from '../components/TenantForm';
import { tenantsService } from '../services/tenants.service';
import { Tenant, TenantFormData } from '../types/tenant.types';
import { Loading } from '../../../shared/components/ui/Loading';
import { Card } from '../../../shared/components/ui/Card';
import { TenantUsersPage } from '../modules/users';

interface TenantDashboardPageProps {
  tenantId: string;
  onBack: () => void;
}

export const TenantDashboardPage: React.FC<TenantDashboardPageProps> = ({
  tenantId,
  onBack,
}) => {
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [activeTab, setActiveTab] = useState('cadastro');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadTenant = async () => {
    setLoading(true);
    try {
      const data = await tenantsService.buscarTenantPorId(tenantId);
      setTenant(data);
    } catch (err) {
      console.error('Error loading tenant in dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTenant();
  }, [tenantId]);

  const handleFormSubmit = async (formData: TenantFormData) => {
    setIsSubmitting(true);
    setSaveSuccess(false);
    try {
      const updated = await tenantsService.atualizarTenant(tenantId, formData);
      setTenant(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading fullPage label="Sincronizando banco de dados de tenant..." />;
  }

  if (!tenant) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-800 p-8 text-center rounded-[4px]" id="tenant-not-found-layout">
        <h2 className="text-sm font-black uppercase tracking-wider">Tenant Não Encontrado</h2>
        <p className="text-xs text-slate-500 mt-2">O tenant com identificador de tenant "{tenantId}" não consta no cluster central.</p>
        <button onClick={onBack} className="mt-4 px-4 py-2 bg-slate-900 text-white rounded-[4px] text-xs font-bold pointer-events-auto cursor-pointer">
          VOLTAR AO PAINEL GLOBAL
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in" id="tenant-dashboard-inside-panel">
      {/* Header bar back-action and controls */}
      <TenantDashboardHeader tenant={tenant} onBack={onBack} />

      {/* Contract & Node KPI summary cards */}
      <TenantDashboardSummary tenant={tenant} />

      {/* Grid containing workspace and menus */}
      <div className="flex flex-col lg:flex-row gap-6 items-start" id="tenant-workspace-grid">
        <TenantDashboardSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        {/* Active Module Panel Container */}
        <div className="flex-1 w-full space-y-6 animate-scale-up" id="tenant-workspace-content">
          {activeTab === 'cadastro' ? (
            <Card
              id="workspace-content-card"
              title="Dados Cadastrais & Chaves"
              subtitle="Modifique os dados operacionais, status de tenant ou plano SaaS contratado no banco global."
            >
              <div className="p-6 space-y-6" id="workspace-sub-content">
                {/* Horizontal aesthetics tab selector */}
                <TenantDashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />

                {saveSuccess ? (
                  <div className="p-4 bg-teal-50 border border-teal-200 text-teal-800 rounded-[4px] text-xs flex items-center gap-2 animate-fade-in" id="alert-save-success">
                    <ShieldCheck className="h-5 w-5 text-teal-600" />
                    <div>
                      <span className="font-black uppercase block text-[10px] tracking-widest leading-none mb-1">CONTRATO ATUALIZADO COM SUCESSO!</span>
                      <span className="text-slate-500 block leading-normal text-[11px]">As novas diretrizes cadastrais foram propagadas com sucesso na base de dados global.</span>
                    </div>
                  </div>
                ) : null}

                <div id="cadastro-module-wrapper" className="pt-2">
                  <TenantForm
                    tenant={tenant}
                    onSubmit={handleFormSubmit}
                    onCancel={onBack}
                    isSubmitting={isSubmitting}
                  />
                </div>
              </div>
            </Card>
          ) : activeTab === 'usuarios' ? (
            <TenantUsersPage tenantId={tenantId} />
          ) : null}
        </div>
      </div>
    </div>
  );
};
