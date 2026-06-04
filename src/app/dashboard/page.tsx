import React from 'react';
import { DashboardSummary } from '../../modules/dashboard/components/DashboardSummary';
import { useAuth } from '../../core/auth/auth.store';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div id="dashboard-page" className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-6 border-b border-slate-200" id="dashboard-massive-header">
        <div>
          <div id="massive-title" className="text-[54px] sm:text-[72px] lg:text-[84px] leading-[0.9] font-black tracking-tighter uppercase text-slate-900">
            GLOBAL<br/>ADMIN
          </div>
          <p id="massive-subtitle" className="text-xs text-slate-500 mt-4 max-w-xl font-medium leading-relaxed">
            Olá, {user?.name || 'Administrador'}. Seja bem-vindo ao Painel de Controle Administrativo Global da Petvex. Sincronização direta com Sanctum e endpoints do spec OpenAPI.
          </p>
        </div>
        <div className="text-left md:text-right" id="header-api-monitor">
          <div className="text-[10px] uppercase tracking-[0.15em] text-slate-400 mb-2 font-black">
            API Health Monitor
          </div>
          <div className="flex items-center md:justify-end font-mono text-xs text-slate-700 bg-teal-50/70 border border-teal-100 px-3.5 py-1.5 rounded-[4px]">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block mr-2 animate-pulse" />
            api.petvex.com.br: ONLINE
          </div>
        </div>
      </div>

      <DashboardSummary />
    </div>
  );
};

export default DashboardPage;
