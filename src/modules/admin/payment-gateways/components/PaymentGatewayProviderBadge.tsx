import React from 'react';
import { PaymentGatewayProvider } from '../../../../core/http/generated/models';

interface PaymentGatewayProviderBadgeProps {
  provider: PaymentGatewayProvider;
}

export const PaymentGatewayProviderBadge: React.FC<PaymentGatewayProviderBadgeProps> = ({ provider }) => {
  const configs: Record<PaymentGatewayProvider, { label: string; className: string }> = {
    mercado_pago: {
      label: 'Mercado Pago',
      className: 'bg-blue-50 text-blue-700 border-blue-200/50',
    },
    pagseguro: {
      label: 'PagSeguro',
      className: 'bg-green-50 text-green-700 border-green-200/50',
    },
    iugu: {
      label: 'Iugu',
      className: 'bg-amber-50 text-amber-700 border-amber-200/50',
    },
    stripe: {
      label: 'Stripe',
      className: 'bg-indigo-50 text-indigo-700 border-indigo-200/50',
    },
    asaas: {
      label: 'Asaas',
      className: 'bg-purple-50 text-purple-700 border-purple-200/50',
    },
  };

  const config = configs[provider] || { label: provider, className: 'bg-slate-50 text-slate-700 border-slate-200/50' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold border font-mono tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
};
