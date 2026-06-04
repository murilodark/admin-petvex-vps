import React from 'react';
import { PaymentGatewayStatus } from '../../../../core/http/generated/models';

interface PaymentGatewayStatusBadgeProps {
  status: PaymentGatewayStatus;
}

export const PaymentGatewayStatusBadge: React.FC<PaymentGatewayStatusBadgeProps> = ({ status }) => {
  const configs: Record<PaymentGatewayStatus, { label: string; className: string }> = {
    active: {
      label: 'Ativo',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200/50',
    },
    inactive: {
      label: 'Inativo',
      className: 'bg-slate-50 text-slate-500 border-slate-200/50',
    },
    testing: {
      label: 'Em Testes',
      className: 'bg-sky-50 text-sky-700 border-sky-200/50',
    },
    error: {
      label: 'Erro',
      className: 'bg-rose-50 text-rose-700 border-rose-200/50',
    },
  };

  const config = configs[status] || { label: status, className: 'bg-slate-50 text-slate-500 border-slate-200/50' };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold border font-mono tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
};

interface EnvironmentBadgeProps {
  isSandbox: boolean;
}

export const EnvironmentBadge: React.FC<EnvironmentBadgeProps> = ({ isSandbox }) => {
  return isSandbox ? (
    <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold border font-mono tracking-wide bg-orange-50 text-orange-700 border-orange-200/50">
      Homologação (Sandbox)
    </span>
  ) : (
    <span className="inline-flex items-center px-2 py-0.5 rounded-[4px] text-[11px] font-bold border font-mono tracking-wide bg-teal-50 text-teal-700 border-teal-200/50">
      Produção
    </span>
  );
};
