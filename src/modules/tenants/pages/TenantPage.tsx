import React from 'react';
import { TenantDashboardPage } from '../dashboard/TenantDashboardPage';

interface TenantPageProps {
  tenantId: string;
  onBack: () => void;
}

export const TenantPage: React.FC<TenantPageProps> = ({ tenantId, onBack }) => {
  return (
    <div id="tenant-detail-page-container">
      <TenantDashboardPage tenantId={tenantId} onBack={onBack} />
    </div>
  );
};
