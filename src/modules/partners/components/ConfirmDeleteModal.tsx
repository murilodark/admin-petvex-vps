import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  description: string;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <div id="confirm-delete-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="confirm-delete-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Modal */}
      <div
        id="confirm-delete-content"
        className="relative bg-white w-full max-w-md rounded-[4px] shadow-2xl overflow-hidden border border-slate-200 p-6 animate-fade-in"
      >
        <div className="flex items-start gap-4">
          <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0 border border-rose-100">
            <AlertTriangle className="h-5 w-5 text-rose-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {title}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 bg-slate-50 -mx-6 -mb-6 p-4 border-t border-slate-100">
          <Button
            id="confirm-delete-cancel-btn"
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            id="confirm-delete-submit-btn"
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Confirmar Exclusão
          </Button>
        </div>
      </div>
    </div>
  );
};
