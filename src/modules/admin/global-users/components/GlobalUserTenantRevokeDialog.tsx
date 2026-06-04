import React from 'react';
import { ShieldX, Loader2 } from 'lucide-react';
import { GlobalUserTenantAccess } from '../types/global-user.types';
import { Button } from '../../../../shared/components/ui/Button';

interface GlobalUserTenantRevokeDialogProps {
  isOpen: boolean;
  access: GlobalUserTenantAccess | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const GlobalUserTenantRevokeDialog: React.FC<GlobalUserTenantRevokeDialogProps> = ({
  isOpen,
  access,
  onConfirm,
  onClose,
  isLoading,
}) => {
  if (!isOpen || !access) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all" id="revoke-access-dialog-overlay">
      <div 
        className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-[4px] overflow-hidden transform scale-100 transition-transform duration-200"
        id="revoke-access-dialog-content"
      >
        <div className="p-6 bg-amber-50 border-b border-amber-100" id="revoke-dialog-header">
          <div className="flex items-center gap-3 text-amber-700">
            <ShieldX className="h-6 w-6 shrink-0" />
            <h3 className="text-sm font-black uppercase tracking-wider">Desvincular Tenant Parceiro</h3>
          </div>
        </div>

        <div className="p-6 space-y-4" id="revoke-dialog-body">
          <p className="text-xs text-slate-600 leading-relaxed">
            Tem certeza de que deseja revogar o acesso do usuário no tenant <span className="font-bold text-slate-900">{access.tenantName}</span>?
          </p>

          <p className="text-[11px] text-slate-500 leading-relaxed uppercase font-sans tracking-wide bg-slate-50 border border-slate-100 p-3.5 rounded-[4px]">
            O usuário perderá imediatamente qualquer tipo de habilitação e permissão para visualizar dados ou realizar vendas no tenant <span className="font-bold">/{access.tenantSlug || access.tenantId}</span>.
          </p>
        </div>

        <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3" id="revoke-dialog-footer">
          <Button
            id="btn-close-revoke-dialog"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            size="sm"
          >
            Voltar
          </Button>
          <Button
            id="btn-confirm-revoke-access"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500 text-white shadow-xs"
          >
            Confirmar Revogação
          </Button>
        </div>
      </div>
    </div>
  );
};
