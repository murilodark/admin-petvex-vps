import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';
import { GlobalUser } from '../types/global-user.types';
import { Button } from '../../../../shared/components/ui/Button';

interface GlobalUserDeleteDialogProps {
  isOpen: boolean;
  user: GlobalUser | null;
  onConfirm: () => Promise<void>;
  onClose: () => void;
  isLoading: boolean;
}

export const GlobalUserDeleteDialog: React.FC<GlobalUserDeleteDialogProps> = ({
  isOpen,
  user,
  onConfirm,
  onClose,
  isLoading,
}) => {
  if (!isOpen || !user) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all" id="delete-user-dialog-overlay">
      <div 
        className="w-full max-w-md bg-white border border-slate-200 shadow-xl rounded-[4px] overflow-hidden transform scale-100 transition-transform duration-200"
        id="delete-user-dialog-content"
      >
        <div className="p-6 bg-rose-50 border-b border-rose-100" id="delete-dialog-header">
          <div className="flex items-center gap-3 text-rose-600">
            <AlertCircle className="h-6 w-6 shrink-0" />
            <h3 className="text-sm font-black uppercase tracking-wider">Aviso de Exclusão Definitiva</h3>
          </div>
        </div>

        <div className="p-6 space-y-4" id="delete-dialog-body">
          <p className="text-xs text-slate-600 leading-relaxed">
            Você está prestes a excluir a conta de <span className="font-bold text-slate-900">{user.name}</span> (<span className="font-mono text-xs">{user.email}</span>) do sistema Petvex de forma permanente.
          </p>

          <div className="p-4 bg-slate-50 border border-slate-100 rounded-[4px] space-y-2">
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">O que irá acontecer:</h4>
            <ul className="list-disc pl-4 text-[11px] text-slate-600 space-y-1">
              <li>O Logon do usuário será bloqueado imediatamente.</li>
              <li>Todas as permissões e vínculos ativos em Clínicas SaaS serão revogados.</li>
              <li>Esta ação não poderá ser desfeita ou restaurada posterior.</li>
            </ul>
          </div>
        </div>

        <div className="px-6 py-4.5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3" id="delete-dialog-footer">
          <Button
            id="btn-close-delete-dialog"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            size="sm"
          >
            Cancelar
          </Button>
          <Button
            id="btn-confirm-delete-user"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            size="sm"
          >
            Sim, Excluir Usuário
          </Button>
        </div>
      </div>
    </div>
  );
};
