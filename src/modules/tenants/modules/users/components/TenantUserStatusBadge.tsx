import React from 'react';
import { Badge } from '../../../../../shared/components/ui/Badge';

interface TenantUserStatusBadgeProps {
  active: boolean;
}

export const TenantUserStatusBadge: React.FC<TenantUserStatusBadgeProps> = ({ active }) => {
  return (
    <Badge variant={active ? 'success' : 'gray'}>
      {active ? 'ATIVO' : 'INATIVO'}
    </Badge>
  );
};
