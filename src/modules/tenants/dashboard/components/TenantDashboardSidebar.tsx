import React from 'react';
import { User, CreditCard, Users, Building, DollarSign, Shield, History, Settings } from 'lucide-react';

interface TenantDashboardSidebarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TenantDashboardSidebar: React.FC<TenantDashboardSidebarProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'cadastro', label: 'Cadastro e Edição', icon: User, active: true },
    { id: 'assinatura', label: 'Assinaturas', icon: CreditCard, active: false },
    { id: 'usuarios', label: 'Usuários Locais', icon: Users, active: true },
    { id: 'unidades', label: 'Unidades / Clínicas', icon: Building, active: false },
    { id: 'faturamento', label: 'Faturamento', icon: DollarSign, active: false },
    { id: 'permissoes', label: 'Níveis de Permissão', icon: Shield, active: false },
    { id: 'historico', label: 'Histórico de Logs', icon: History, active: false },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, active: false },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] p-4 flex flex-col gap-2 shrink-0 w-full lg:w-64" id="inner-dash-sidebar">
      <div className="px-3 py-2 border-b border-slate-100 mb-1">
        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest block font-sans">
          MÓDULOS INTERNOS
        </span>
      </div>

      <div className="space-y-1.5 flex flex-col sm:flex-row lg:flex-col" id="inner-sidebar-tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              disabled={!tab.active}
              onClick={() => tab.active && onTabChange(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-[4px] text-[11px] font-black uppercase tracking-wider text-left transition-all ${
                !tab.active 
                  ? 'text-slate-300 opacity-60 cursor-not-allowed bg-transparent'
                  : isSelected
                    ? 'bg-slate-900 border-l-4 border-l-teal-500 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 cursor-pointer'
              }`}
              id={`tab-button-${tab.id}`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className={`h-4 w-4 ${isSelected ? 'text-teal-400' : 'text-slate-400'}`} />
                {tab.label}
              </span>
              
              {!tab.active ? (
                <span className="text-[8px] bg-slate-50 border border-slate-200 text-slate-400 px-1 py-0.5 rounded-[4px] tracking-tight">
                  BREVE
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
};
