import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from './core/auth/auth.store';
import { initInterceptors } from './core/http/interceptors';
import { Loading } from './shared/components/ui/Loading';
import LoginPage from './app/login/page';
import DashboardPage from './app/dashboard/page';
import ProfilePage from './app/profile/page';
import DashboardLayout from './layouts/dashboard';
import { TenantsPage } from './modules/tenants/pages/TenantsPage';
import { TenantPage } from './modules/tenants/pages/TenantPage';
import { PlansPage } from './modules/plans/pages/PlansPage';
import { PartnersPage } from './modules/partners/pages/PartnersPage';
import { SubscriptionsPage } from './modules/billing/pages/SubscriptionsPage';
import { InvoicesPage } from './modules/billing/pages/InvoicesPage';
import { PaymentsPage } from './modules/billing/pages/PaymentsPage';
import { PaymentGatewaysPage } from './modules/payment-gateways/pages/PaymentGatewaysPage';
import { PaymentGatewayFormPage } from './modules/payment-gateways/pages/PaymentGatewayFormPage';
import { PaymentGatewayDetailsPage } from './modules/payment-gateways/pages/PaymentGatewayDetailsPage';
import { GlobalUsersPage } from './modules/global-users/pages/GlobalUsersPage';
import { GlobalUserFormPage } from './modules/global-users/pages/GlobalUserFormPage';
import { GlobalUserDetailsPage } from './modules/global-users/pages/GlobalUserDetailsPage';

import { WhatsappNotificationsPage } from './modules/whatsapp-notifications/pages/WhatsappNotificationsPage';
import NotificationsPage from './modules/notifications';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

initInterceptors();

function AppContent() {
  const { isAuthenticated, isLoading, loadMe } = useAuth();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleNavigate = (path: string) => {
    window.history.pushState(null, '', path);
    setCurrentPath(path);
  };

  useEffect(() => {
    loadMe();
  }, []);

  const isLoginPage = currentPath === '/login' || currentPath.endsWith('/login');

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && isLoginPage) {
        window.history.replaceState(null, '', '/dashboard');
        setCurrentPath('/dashboard');
      } else if (!isAuthenticated && !isLoginPage) {
        window.history.replaceState(null, '', '/login');
        setCurrentPath('/login');
      }
    }
  }, [isAuthenticated, isLoginPage, isLoading]);

  if (isLoading) {
    return <Loading fullPage label="Sincronizando com Petvex API..." />;
  }

  if (isAuthenticated && isLoginPage) {
    return <Loading fullPage label="Sincronizando com Petvex API..." />;
  }
  if (!isAuthenticated && !isLoginPage) {
    return <Loading fullPage label="Sincronizando com Petvex API..." />;
  }

  if (isAuthenticated && currentPath.startsWith('/clientes')) {
    const parts = currentPath.split('/');
    const tenantId = parts[2];

    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title={tenantId ? `Gerenciar Tenant #${tenantId}` : 'Clientes SaaS'}
      >
        {tenantId ? (
          <TenantPage
            tenantId={tenantId}
            onBack={() => handleNavigate('/clientes')}
          />
        ) : (
          <TenantsPage
            onNavigateDetail={(id) => handleNavigate(`/clientes/${id}`)}
          />
        )}
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/planos')) {
    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title="Configurações de Planos SaaS"
      >
        <PlansPage />
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/admin/partners')) {
    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title="Gerenciamento de Parceiros e Cupons"
      >
        <PartnersPage />
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/admin/notifications')) {
    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title="Gerenciamento de Notificações"
      >
        <NotificationsPage />
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/admin/whatsapp/whatsapp-notifications')) {
    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title="Gerenciamento de Notificações WhatsApp"
      >
        <WhatsappNotificationsPage />
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/admin/billing/subscriptions')) {
    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title="Gerenciamento de Assinaturas"
      >
        <SubscriptionsPage onNavigate={handleNavigate} />
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/admin/billing/invoices')) {
    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title="Controle de Faturas SaaS"
      >
        <InvoicesPage onNavigate={handleNavigate} />
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/admin/billing/payments')) {
    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title="Histórico de Pagamentos"
      >
        <PaymentsPage onNavigate={handleNavigate} />
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/admin/billing/payment-gateways')) {
    const parts = currentPath.split('/');
    const isCreate = parts[4] === 'create';
    const isEdit = parts[5] === 'edit';
    
    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title={
          isCreate 
            ? 'Cadastrar Gateway de Pagamento' 
            : isEdit 
              ? 'Editar Gateway de Pagamento' 
              : parts[4] 
                ? 'Detalhes do Gateway' 
                : 'Gateways de Pagamento'
        }
      >
        {isCreate || isEdit ? (
          <PaymentGatewayFormPage onNavigate={handleNavigate} />
        ) : parts[4] ? (
          <PaymentGatewayDetailsPage onNavigate={handleNavigate} />
        ) : (
          <PaymentGatewaysPage onNavigate={handleNavigate} />
        )}
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/usuarios')) {
    const parts = currentPath.split('/');
    const isNew = parts[2] === 'novo';
    const isEdit = parts[2] === 'editar';
    const editId = isEdit ? parts[3] : undefined;
    const detailId = (!isNew && !isEdit) ? parts[2] : undefined;

    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title={
          isNew 
            ? 'Cadastrar Usuário Global' 
            : isEdit 
              ? `Editar Usuário Global #${editId}` 
              : detailId 
                ? `Detalhes do Usuário #${detailId}` 
                : 'Usuários Globais'
        }
      >
        {isNew || isEdit ? (
          <GlobalUserFormPage onNavigate={handleNavigate} />
        ) : detailId ? (
          <GlobalUserDetailsPage onNavigate={handleNavigate} />
        ) : (
          <GlobalUsersPage onNavigate={handleNavigate} />
        )}
      </DashboardLayout>
    );
  }

  switch (currentPath) {
    case '/login':
      return <LoginPage onSuccess={() => handleNavigate('/dashboard')} />;
    
    case '/dashboard':
    case '/':
      return (
        <DashboardPageWrapper
          currentPath="/dashboard"
          onNavigate={handleNavigate}
        />
      );

    case '/profile':
    case '/me':
      return (
        <ProfilePageWrapper
          currentPath="/profile"
          onNavigate={handleNavigate}
        />
      );

    default:
      if (isAuthenticated) {
        return (
          <DashboardPageWrapper
            currentPath="/dashboard"
            onNavigate={handleNavigate}
          />
        );
      } else {
        return <LoginPage onSuccess={() => handleNavigate('/dashboard')} />;
      }
  }
}

const DashboardPageWrapper: React.FC<{ currentPath: string; onNavigate: (path: string) => void }> = ({ currentPath, onNavigate }) => {
  return (
    <DashboardLayout
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="Dashboard Global"
    >
      <DashboardPage />
    </DashboardLayout>
  );
};

const ProfilePageWrapper: React.FC<{ currentPath: string; onNavigate: (path: string) => void }> = ({ currentPath, onNavigate }) => {
  return (
    <DashboardLayout
      currentPath={currentPath}
      onNavigate={onNavigate}
      title="Perfil do Administrador"
    >
      <ProfilePage />
    </DashboardLayout>
  );
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
