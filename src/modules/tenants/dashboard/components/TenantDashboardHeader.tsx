import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../../../shared/components/ui/Button';
import { Tenant } from '../../types/tenant.types';
import { TenantStatusBadge } from '../../components/TenantStatusBadge';

interface TenantDashboardHeaderProps {
  tenant: Tenant;
  onBack: () => void;
}

export const TenantDashboardHeader: React.FC<TenantDashboardHeaderProps> = ({ tenant, onBack }) => {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 pb-6 border-b border-slate-200" id="tenant-inner-header">
      <div className="flex items-center gap-4">
        <Button
          id="btn-back-to-list"
          variant="outline"
          size="sm"
          onClick={onBack}
          className="flex items-center gap-1.5 h-8 py-0"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          VOLTAR
        </Button>

        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
              {tenant.name}
            </h2>
            <TenantStatusBadge status={tenant.status} />
            <span className="text-[10px] uppercase font-black tracking-wider bg-teal-50 text-teal-800 px-2 py-0.5 border border-teal-100 rounded-[4px]">
              {tenant.plano}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wide flex items-center gap-1">
            <span>ID: {tenant.id}</span>
            <span>•</span>
            <span>{tenant.email}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full lg:w-auto" id="header-domain-status">
        <div className="px-3.5 py-1.5 bg-slate-100 border border-slate-200 text-slate-700 text-xs font-mono font-bold rounded-[4px] flex items-center gap-2 uppercase tracking-tight">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          TENANT ALOCADO • db_cluster_{tenant.id}
        </div>
      </div>
    </div>
  );
};
