import React from 'react';
import { PlusCircle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { TenantsDashboard } from './TenantsDashboard';
import { TenantsFilters } from './TenantsFilters';
import { TenantsTable } from './TenantsTable';
import { TenantFormModal } from './TenantFormModal';
import { ListarTenantsResult } from '../services/tenants.service';
import { Tenant, TenantFormData } from '../types/tenant.types';

interface TenantsListProps {
  onNavigateDetail: (id: string) => void;
  loading: boolean;
  dataResult: ListarTenantsResult;
  stats: {
    total: number;
    active: number;
    inactive: number;
    enterprise: number;
  };
  search: string;
  onSearchChange: (val: string) => void;
  status: string;
  onStatusChange: (val: string) => void;
  plano: string;
  onPlanoChange: (val: string) => void;
  onPageChange: (newPage: number) => void;
  
  // Modals & CRUD
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  selectedTenant: Tenant | undefined;
  setSelectedTenant: (tenant: Tenant | undefined) => void;
  isSubmitting: boolean;
  onToggleStatus: (tenant: Tenant) => void;
  onFormSubmit: (formData: TenantFormData) => Promise<void>;
}

export const TenantsList: React.FC<TenantsListProps> = ({
  onNavigateDetail,
  loading,
  dataResult,
  stats,
  search,
  onSearchChange,
  status,
  onStatusChange,
  plano,
  onPlanoChange,
  onPageChange,
  isModalOpen,
  setIsModalOpen,
  selectedTenant,
  setSelectedTenant,
  isSubmitting,
  onToggleStatus,
  onFormSubmit,
}) => {
  const handleOpenCreateModal = () => {
    setSelectedTenant(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (tenant: Tenant) => {
    setSelectedTenant(tenant);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in" id="tenants-list-container">
      {/* HUD Stats */}
      <TenantsDashboard
        totalCount={stats.total}
        activeCount={stats.active}
        inactiveCount={stats.inactive}
        enterpriseCount={stats.enterprise}
      />

      {/* Controls Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-205 p-5 rounded-[4px]" id="list-action-toolbar">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-905">
            CONTRATOS E TENANTS INTEGRADOS
          </h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
            PROVEDORES E MULTITENANTS REGISTRADOS NA BASE CENTRAL PETVEX
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto" id="toolbar-actions">
          <Button
            id="btn-new-tenant"
            variant="primary"
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 text-xs font-bold w-full sm:w-auto justify-center"
          >
            <PlusCircle className="h-4 w-4" />
            NOVO TENANT
          </Button>
        </div>
      </div>

      {/* Filter panel */}
      <TenantsFilters
        search={search}
        onSearchChange={onSearchChange}
        status={status}
        onStatusChange={onStatusChange}
        plano={plano}
        onPlanoChange={onPlanoChange}
      />

      {/* Table list */}
      <TenantsTable
        tenants={dataResult.data}
        loading={loading}
        onEdit={handleOpenEditModal}
        onNavigateDetail={onNavigateDetail}
        onToggleStatus={onToggleStatus}
        page={dataResult.page}
        lastPage={dataResult.lastPage}
        total={dataResult.total}
        perPage={dataResult.perPage}
        onPageChange={onPageChange}
      />

      {/* Modal Dialog */}
      <TenantFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tenant={selectedTenant}
        onSubmit={onFormSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
