import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TenantsList } from '../components/TenantsList';
import { tenantsService, ListarTenantsResult } from '../services/tenants.service';
import { Tenant, TenantFormData } from '../types/tenant.types';

interface TenantsPageProps {
  onNavigateDetail: (id: string) => void;
}

export const TenantsPage: React.FC<TenantsPageProps> = ({ onNavigateDetail }) => {
  const [loading, setLoading] = useState(true);
  const [dataResult, setDataResult] = useState<ListarTenantsResult>({
    data: [],
    total: 0,
    page: 1,
    perPage: 5,
    lastPage: 1,
  });

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [plano, setPlano] = useState('all');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Debounce search state
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const queryParams = useMemo(() => ({
    search: debouncedSearch || undefined,
    status: status,
    plano: plano,
    page,
  }), [debouncedSearch, status, plano, page]);

  const loadTenants = useCallback(async () => {
    setLoading(true);
    try {
      const result = await tenantsService.listarTenants(queryParams);
      setDataResult(result);
    } catch (err) {
      console.error('Error fetching tenants in page:', err);
    } finally {
      setLoading(false);
    }
  }, [queryParams]);

  useEffect(() => {
    loadTenants();
  }, [loadTenants]);

  const stats = useMemo(() => {
    return {
      total: dataResult.total,
      active: dataResult.data.filter((c) => c.status === 'active').length,
      inactive: dataResult.data.filter((c) => c.status === 'inactive').length,
      enterprise: dataResult.data.filter((c) => c.plano === 'Enterprise').length,
    };
  }, [dataResult]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  const handlePlanoChange = (val: string) => {
    setPlano(val);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleToggleStatus = async (tenant: Tenant) => {
    const nextStatus = tenant.status === 'active' ? 'inactive' : 'active';
    try {
      await tenantsService.atualizarTenant(tenant.id, { status: nextStatus });
      loadTenants();
    } catch (err) {
      console.error('Error toggling status:', err);
    }
  };

  const handleFormSubmit = async (formData: TenantFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedTenant) {
        await tenantsService.atualizarTenant(selectedTenant.id, formData);
      } else {
        await tenantsService.cadastrarTenant(formData);
      }
      setIsModalOpen(false);
      loadTenants();
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="tenants-page-container" className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200" id="tenants-massive-header">
        <div>
          <div id="massive-title" className="text-[54px] sm:text-[72px] lg:text-[84px] leading-[0.9] font-black tracking-tighter uppercase text-slate-900">
            TENANTS<br/>SaaS
          </div>
          <p id="massive-subtitle" className="text-xs text-slate-500 mt-4 max-w-xl font-medium leading-relaxed font-sans">
            Gerenciamento geral de clientes, clínicas credenciadas, faturamentos, planos contratados e status operacionais dos tenants do ecossistema Petvex.
          </p>
        </div>
        <div className="text-left md:text-right font-sans" id="tenants-module-indicator">
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-2 font-black">
            Core Tenant Module
          </div>
          <div className="flex items-center md:justify-end font-mono text-xs text-teal-700 bg-teal-50/70 border border-teal-100 px-3.5 py-1.5 rounded-[4px] font-bold">
            GET /api/v1/openapi/types : SYSTEM_OK
          </div>
        </div>
      </div>

      <TenantsList
        onNavigateDetail={onNavigateDetail}
        loading={loading}
        dataResult={dataResult}
        stats={stats}
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        plano={plano}
        onPlanoChange={handlePlanoChange}
        onPageChange={handlePageChange}
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
        selectedTenant={selectedTenant}
        setSelectedTenant={setSelectedTenant}
        isSubmitting={isSubmitting}
        onToggleStatus={handleToggleStatus}
        onFormSubmit={handleFormSubmit}
      />
    </div>
  );
};
