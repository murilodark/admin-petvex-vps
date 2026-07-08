import React from 'react';
import { Badge } from '../../../shared/components/ui/Badge';

interface WhatsappStatusBadgeProps {
  status: string;
}

export const WhatsappStatusBadge: React.FC<WhatsappStatusBadgeProps> = ({ status }) => {
  const normalized = (status || '').toLowerCase();

  let variant: 'success' | 'warn' | 'danger' | 'info' | 'gray' = 'gray';
  let label = status;

  switch (normalized) {
    case 'pending':
      variant = 'gray';
      label = 'Pendente';
      break;
    case 'queued':
      variant = 'info';
      label = 'Na Fila';
      break;
    case 'sent':
      variant = 'info';
      label = 'Enviado';
      break;
    case 'delivered':
      variant = 'success';
      label = 'Entregue';
      break;
    case 'read':
      variant = 'success';
      label = 'Lido';
      break;
    case 'failed':
      variant = 'danger';
      label = 'Falhou';
      break;
    case 'cancelled':
      variant = 'warn';
      label = 'Cancelado';
      break;
    default:
      variant = 'gray';
      label = status || 'N/A';
  }

  return <Badge variant={variant}>{label}</Badge>;
};
