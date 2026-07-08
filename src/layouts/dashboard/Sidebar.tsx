import React from 'react';
import { useAuth } from '../../core/auth/auth.store';
import { LayoutDashboard, User, LogOut, Loader2, Users, CreditCard, ShieldCheck, Wallet, ClipboardList, DollarSign, Receipt } from 'lucide-react';
import { cn } from '../../shared/lib/cn';

interface SidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPath, onNavigate, isOpen, onClose }) => {
  const { logout, isLoading } = useAuth();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Clientes SaaS',
      path: '/clientes',
      icon: Users,
    },
    {
      name: 'Usuários Globais',
      path: '/usuarios',
      icon: ShieldCheck,
    },
    {
      name: 'Planos',
      path: '/planos',
      icon: CreditCard,
    },
    {
      isHeader: true,
      name: 'Cobranças',
    },
    {
      name: 'Assinaturas',
      path: '/admin/billing/subscriptions',
      icon: ClipboardList,
    },
    {
      name: 'Pagamentos',
      path: '/admin/billing/payments',
      icon: DollarSign,
    },
    {
      name: 'Faturas',
      path: '/admin/billing/invoices',
      icon: Receipt,
    },
    {
      name: 'Notificações WhatsApp',
      path: '/admin/whatsapp/whatsapp-notifications',
      icon: MessageSquare,
    },
    {
      name: 'Gateways de Pagamento',
      path: '/admin/billing/payment-gateways',
      icon: Wallet,
    },
    {
      isHeader: true,
      name: 'Sistema',
    },
    {
      name: 'Perfil',
      path: '/profile',
      icon: User,
    },
  ];

  const handleNavigateClick = (path: string) => {
    onNavigate(path);
    onClose();
  };

  return (
    <>
      {isOpen ? (
        <div
          id="sidebar-overlay"
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-30 lg:hidden"
        />
      ) : null}

      <aside
        id="dashboard-sidebar"
        className={cn(
          'fixed inset-y-0 left-0 bg-slate-900 text-white w-64 transform transition-transform duration-250 ease-in-out z-40 lg:translate-x-0 lg:static flex flex-col',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="p-8 pb-10 border-b border-slate-800 bg-slate-950" id="sidebar-brand">
          <div className="text-teal-500 font-black text-2xl tracking-tighter">PETVEX</div>
          <div className="text-[10px] opacity-40 uppercase tracking-[0.2em] mt-1">Global Admin</div>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2 overflow-y-auto" id="sidebar-nav">
          {menuItems.map((item, index) => {
            if (item.isHeader) {
              return (
                <div
                  key={`header-${index}`}
                  className="px-4 pt-4 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest"
                >
                  {item.name}
                </div>
              );
            }

            const isActive = 
              currentPath === item.path || 
              (item.path === '/clientes' && currentPath.startsWith('/clientes')) ||
              (item.path === '/usuarios' && currentPath.startsWith('/usuarios')) ||
              (item.path === '/planos' && currentPath.startsWith('/planos')) ||
              (item.path === '/admin/billing/payment-gateways' && currentPath.startsWith('/admin/billing/payment-gateways')) ||
              (item.path === '/admin/billing/subscriptions' && currentPath.startsWith('/admin/billing/subscriptions')) ||
              (item.path === '/admin/billing/payments' && currentPath.startsWith('/admin/billing/payments')) ||
              (item.path === '/admin/billing/invoices' && currentPath.startsWith('/admin/billing/invoices')) ||
              (item.path === '/admin/whatsapp/whatsapp-notifications' && currentPath.startsWith('/admin/whatsapp/whatsapp-notifications')) ||
              (currentPath === '/me' && item.path === '/profile');

            const Icon = item.icon!;
            return (
              <button
                key={item.path}
                id={`sidebar-link-${item.path.substring(1).replace(/\//g, '-')}`}
                onClick={() => handleNavigateClick(item.path!)}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-[4px] text-xs uppercase tracking-wider font-bold transition-all cursor-pointer text-left',
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
                )}
              >
                <Icon className="h-4 w-4 text-teal-500" />
                {item.name}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950" id="sidebar-footer">
          <button
            id="sidebar-logout-btn"
            disabled={isLoading}
            onClick={() => {
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 text-rose-400 text-xs font-bold tracking-widest rounded-[4px] hover:bg-rose-600 hover:text-white transition-all cursor-pointer text-center disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
            LOGOUT
          </button>
        </div>
      </aside>
    </>
  );
};
