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
import { GlobalUsersPage } from './modules/admin/global-users/pages/GlobalUsersPage';
import { GlobalUserFormPage } from './modules/admin/global-users/pages/GlobalUserFormPage';
import { GlobalUserDetailsPage } from './modules/admin/global-users/pages/GlobalUserDetailsPage';
import { PaymentGatewaysPage } from './modules/admin/payment-gateways/pages/PaymentGatewaysPage';
import { PaymentGatewayFormPage } from './modules/admin/payment-gateways/pages/PaymentGatewayFormPage';
import { PaymentGatewayDetailsPage } from './modules/admin/payment-gateways/pages/PaymentGatewayDetailsPage';
import { SubscriptionsPage } from './modules/admin/billing/pages/SubscriptionsPage';
import { PaymentsPage } from './modules/admin/billing/pages/PaymentsPage';
import { InvoicesPage } from './modules/admin/billing/pages/InvoicesPage';

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

  if (isAuthenticated && currentPath.startsWith('/usuarios')) {
    const parts = currentPath.split('/');
    const isNovo = currentPath.endsWith('/novo');
    const isEdit = currentPath.includes('/editar/');
    
    let pageTitle = 'Usuários Globais';
    if (isNovo) pageTitle = 'Novo Usuário Global';
    else if (isEdit) pageTitle = 'Editar Usuário Global';
    else if (parts[2]) pageTitle = 'Vínculos de Acesso do Usuário';

    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title={pageTitle}
      >
        {isNovo || isEdit ? (
          <GlobalUserFormPage onNavigate={handleNavigate} />
        ) : parts[2] ? (
          <GlobalUserDetailsPage onNavigate={handleNavigate} />
        ) : (
          <GlobalUsersPage onNavigate={handleNavigate} />
        )}
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/admin/billing/payment-gateways')) {
    const parts = currentPath.split('/');
    const isNovo = currentPath.endsWith('/create');
    const isEdit = currentPath.endsWith('/edit');
    
    let pageTitle = 'Gateways de Pagamento';
    if (isNovo) pageTitle = 'Cadastrar Gateway de Pagamento';
    else if (isEdit) pageTitle = 'Editar Gateway de Pagamento';
    else if (parts[4]) pageTitle = 'Detalhes do Gateway';

    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title={pageTitle}
      >
        {isNovo || isEdit ? (
          <PaymentGatewayFormPage onNavigate={handleNavigate} />
        ) : parts[4] ? (
          <PaymentGatewayDetailsPage onNavigate={handleNavigate} />
        ) : (
          <PaymentGatewaysPage onNavigate={handleNavigate} />
        )}
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

  if (isAuthenticated && currentPath.startsWith('/admin/billing/payments')) {
    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title="Gerenciamento de Transações Financeiras"
      >
        <PaymentsPage onNavigate={handleNavigate} />
      </DashboardLayout>
    );
  }

  if (isAuthenticated && currentPath.startsWith('/admin/billing/invoices')) {
    return (
      <DashboardLayout
        currentPath={currentPath}
        onNavigate={handleNavigate}
        title="Gerenciamento de Faturas Emitidas"
      >
        <InvoicesPage onNavigate={handleNavigate} />
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
