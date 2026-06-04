import React from 'react';
import { X } from 'lucide-react';
import { TenantUserForm } from './TenantUserForm';
import { TenantUser, TenantUserFormData } from '../types/tenant-user.types';

interface TenantUserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: TenantUser;
  onSubmit: (data: TenantUserFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const TenantUserFormModal: React.FC<TenantUserFormModalProps> = ({
  isOpen,
  onClose,
  user,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="tenant-user-form-modal-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white border border-slate-200 rounded-[4px] shadow-xl w-full max-w-2xl overflow-hidden z-10 animate-scale-up" id="tenant-user-form-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              {user ? 'EDITAR USUÁRIO DO TENANT' : 'CADASTRAR NOVO USUÁRIO'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">
              {user ? `EDIÇÃO DE PERFIL • ID: ${user.id}` : 'CRIAÇÃO DE CREDENCIAIS DE ACESSO AO SISTEMA'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            id="close-user-modal-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          <TenantUserForm
            user={user}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
