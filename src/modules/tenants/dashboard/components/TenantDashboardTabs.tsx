import React from 'react';

interface TenantDashboardTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TenantDashboardTabs: React.FC<TenantDashboardTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="flex border-b border-slate-200 gap-6" id="tenant-dashboard-horizontal-tabs">
      <button
        onClick={() => onTabChange('cadastro')}
        className={`pb-3.5 text-xs font-black uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
          activeTab === 'cadastro'
            ? 'border-b-4 border-teal-500 text-slate-900'
            : 'border-transparent text-slate-400 hover:text-slate-600'
        }`}
      >
        Dados de Login & Cadastro
      </button>

      <button
        disabled
        className="pb-3.5 text-xs font-black uppercase tracking-wider border-b-2 border-transparent text-slate-300 opacity-60 cursor-not-allowed flex items-center gap-1"
      >
        Assinaturas & Faturas
        <span className="text-[7px] bg-slate-55 border border-slate-200 text-slate-400 px-1 py-0.5 rounded uppercase">Breve</span>
      </button>

      <button
        disabled
        className="pb-3.5 text-xs font-black uppercase tracking-wider border-b-2 border-transparent text-slate-300 opacity-60 cursor-not-allowed flex items-center gap-1"
      >
        Auditoria & Logs
        <span className="text-[7px] bg-slate-55 border border-slate-200 text-slate-400 px-1 py-0.5 rounded uppercase">Breve</span>
      </button>
    </div>
  );
};
