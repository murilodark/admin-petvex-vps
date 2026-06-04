import React from 'react';
import { X } from 'lucide-react';
import { TenantForm } from './TenantForm';
import { Tenant, TenantFormData } from '../types/tenant.types';

interface TenantFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenant?: Tenant;
  onSubmit: (data: TenantFormData) => Promise<void>;
  isSubmitting: boolean;
}

export const TenantFormModal: React.FC<TenantFormModalProps> = ({
  isOpen,
  onClose,
  tenant,
  onSubmit,
  isSubmitting,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" id="tenant-form-modal-overlay">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200" 
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative bg-white border border-slate-200 rounded-[4px] shadow-xl w-full max-w-2xl overflow-hidden z-10 animate-scale-up" id="tenant-form-modal-content">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              {tenant ? 'EDITAR TENANT DO SAAS' : 'CADASTRAR NOVO TENANT'}
            </h3>
            <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">
              {tenant ? `EDIÇÃO DO CONTRATO • ID: ${tenant.id}` : 'CRIAÇÃO DE TENANT E CHAVES NO SISTEMA'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            id="close-modal-btn"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="px-6 py-5 max-h-[80vh] overflow-y-auto">
          <TenantForm
            tenant={tenant}
            onSubmit={onSubmit}
            onCancel={onClose}
            isSubmitting={isSubmitting}
          />
        </div>
      </div>
    </div>
  );
};
