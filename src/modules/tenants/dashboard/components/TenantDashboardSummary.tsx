import React from 'react';
import { Network, Database, ShieldCheck, Link2 } from 'lucide-react';
import { Tenant } from '../../types/tenant.types';

interface TenantDashboardSummaryProps {
  tenant: Tenant;
}

export const TenantDashboardSummary: React.FC<TenantDashboardSummaryProps> = ({ tenant }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="tenant-inner-summary-hud">
      <div className="bg-white border border-slate-200 rounded-[4px] p-5 flex flex-col justify-between" id="summary-card-login">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">E-mail do Tenant</span>
          <ShieldCheck className="h-4 w-4 text-teal-600" />
        </div>
        <div className="mt-4">
          <span className="text-xs font-black text-slate-900 break-all font-mono uppercase">{tenant.email}</span>
          <div className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-wide">LOGIN DA ADMINISTRAÇÃO CENTRAL</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[4px] p-5 flex flex-col justify-between" id="summary-card-status">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Database Instância</span>
          <Database className="h-4 w-4 text-slate-400" />
        </div>
        <div className="mt-4">
          <span className="text-sm font-bold text-slate-900 font-mono uppercase">Node: db_cluster_{tenant.id}</span>
          <div className="text-[9px] text-teal-600 font-bold mt-2 uppercase tracking-wide">SP REGION: LATENCY 4MS</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[4px] p-5 flex flex-col justify-between" id="summary-card-plano">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Plano SaaS Vigente</span>
          <Network className="h-4 w-4 text-teal-500" />
        </div>
        <div className="mt-4">
          <span className="text-base font-black text-slate-900 tracking-tight uppercase">PLANO {tenant.plano}</span>
          <div className="text-[9px] text-slate-450 font-bold mt-2 uppercase tracking-wide">UPTIME ASSEGURADO SLA</div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-[4px] p-5 flex flex-col justify-between" id="summary-card-url">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Subdomínio Alocado</span>
          <Link2 className="h-4 w-4 text-slate-450" />
        </div>
        <div className="mt-4">
          <span className="text-xs font-bold text-slate-900 font-mono lowercase">{tenant.name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'app'}.petvex.com.br</span>
          <div className="text-[9px] text-teal-600 font-bold mt-2 uppercase tracking-wide">CERTIFICADO SSL ATIVO</div>
        </div>
      </div>
    </div>
  );
};
