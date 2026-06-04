import React from 'react';
import { Badge } from '../../../shared/components/ui/Badge';

interface TenantStatusBadgeProps {
  status: 'active' | 'inactive';
}

export const TenantStatusBadge: React.FC<TenantStatusBadgeProps> = ({ status }) => {
  return (
    <Badge variant={status === 'active' ? 'success' : 'gray'}>
      {status === 'active' ? 'Ativo' : 'Inativo'}
    </Badge>
  );
};
