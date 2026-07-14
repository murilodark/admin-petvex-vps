import React from 'react';
import { useAuth } from '../../../core/auth/auth.store';
import { User, Menu } from 'lucide-react';

interface HeaderProps {
  onToggleSidebar: () => void;
  title: string;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, title }) => {
  const { user } = useAuth();

  return (
    <header id="dashboard-header" className="h-[72px] border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4" id="header-left">
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-[4px] text-slate-500 hover:bg-slate-100 lg:hidden cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-3" id="header-domain-info">
          <div className="text-xs font-mono text-slate-400 tracking-tighter">adm.petvex.com.br</div>
          <div className="px-2 py-1 bg-teal-50 text-teal-700 text-[10px] font-bold rounded-[4px] uppercase tracking-wider">PRODUCTION v1.0.0</div>
        </div>
      </div>

      <div className="flex items-center gap-4" id="header-right">
        <div className="flex flex-col text-right hidden sm:flex-col" id="header-user-info">
          <span className="text-xs font-bold text-slate-900">
            {user?.name || 'Rodrigo Admin'}
          </span>
          <span className="text-[10px] font-mono text-slate-400 mt-0.5">
            {user?.email || 'root@petvex.com.br'}
          </span>
        </div>

        <div className="h-10 w-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 font-bold text-xs tracking-wider" id="header-avatar">
          {user?.name ? user.name.split(' ').map((n: string) => n.charAt(0)).join('').substring(0, 2).toUpperCase() : 'RA'}
        </div>
      </div>
    </header>
  );
};
