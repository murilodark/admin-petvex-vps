import React from 'react';
import { Users, UserCheck, ShieldAlert, Award } from 'lucide-react';

interface TenantsDashboardProps {
  totalCount: number;
  activeCount: number;
  inactiveCount: number;
  enterpriseCount: number;
}

export const TenantsDashboard: React.FC<TenantsDashboardProps> = ({
  totalCount,
  activeCount,
  inactiveCount,
  enterpriseCount,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in" id="tenants-stats-dashboard">
      <div className="bg-white border border-slate-205 rounded-[4px] p-6 shadow-xs flex flex-col justify-between" id="stat-card-total">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Total Tenants</span>
          <Users className="h-4 w-4 text-teal-600 animate-pulse" />
        </div>
        <div className="mt-4">
          <span className="text-4xl font-black text-slate-905 font-mono tracking-tighter">{totalCount}</span>
          <div className="text-[10px] text-teal-600 font-bold mt-2 uppercase tracking-wide">ESTÁVEL NESTE MÊS</div>
        </div>
      </div>

      <div className="bg-white border border-slate-205 rounded-[4px] p-6 shadow-xs flex flex-col justify-between" id="stat-card-active">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Tenants Ativos</span>
          <UserCheck className="h-4 w-4 text-teal-500" />
        </div>
        <div className="mt-4">
          <span className="text-4xl font-black text-slate-905 font-mono tracking-tighter">{activeCount}</span>
          <div className="text-[10px] text-teal-600 font-bold mt-2 uppercase tracking-wide">99.9% UPTIME AUTOMÁTICO</div>
        </div>
      </div>

      <div className="bg-white border border-slate-205 rounded-[4px] p-6 shadow-xs flex flex-col justify-between" id="stat-card-inactive">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Bloqueados</span>
          <ShieldAlert className="h-4 w-4 text-rose-500" />
        </div>
        <div className="mt-4">
          <span className="text-4xl font-black text-slate-905 font-mono tracking-tighter">{inactiveCount}</span>
          <div className="text-[10px] text-rose-505 font-bold mt-2 uppercase tracking-wide">ACESSOS CANCELADOS</div>
        </div>
      </div>

      <div className="bg-white border border-slate-205 rounded-[4px] p-6 shadow-xs flex flex-col justify-between" id="stat-card-enterprise">
        <div className="flex justify-between items-start">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Enterprise</span>
          <Award className="h-4 w-4 text-amber-500" />
        </div>
        <div className="mt-4">
          <span className="text-4xl font-black text-slate-905 font-mono tracking-tighter">{enterpriseCount}</span>
          <div className="text-[10px] text-teal-600 font-bold mt-2 uppercase tracking-wide">CLIENTES CORPORATIVOS</div>
        </div>
      </div>
    </div>
  );
};
