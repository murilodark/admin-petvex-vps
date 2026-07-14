import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import { partnerSchema } from '../schemas/partner.schema';
import { Partner, PartnerFormData } from '../types/partner.types';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { ApiErrorAlert } from '../../../shared/components/ui/ApiErrorAlert';

interface PartnerFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PartnerFormData) => Promise<void>;
  partner?: Partner | null;
  isLoading?: boolean;
  error?: any;
}

export const PartnerFormDrawer: React.FC<PartnerFormDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  partner,
  isLoading = false,
  error,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      name: '',
      company_name: '',
      document: '',
      email: '',
      phone: '',
      website: '',
      instagram: '',
      notes: '',
      is_active: true,
    },
  });

  useEffect(() => {
    if (isOpen) {
      if (partner) {
        reset({
          name: partner.name,
          company_name: partner.company_name || '',
          document: partner.document || '',
          email: partner.email || '',
          phone: partner.phone || '',
          website: partner.website || '',
          instagram: partner.instagram || '',
          notes: partner.notes || '',
          is_active: partner.is_active,
        });
      } else {
        reset({
          name: '',
          company_name: '',
          document: '',
          email: '',
          phone: '',
          website: '',
          instagram: '',
          notes: '',
          is_active: true,
        });
      }
    }
  }, [isOpen, partner, reset]);

  if (!isOpen) return null;

  return (
    <div id="partner-drawer-overlay" className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        id="partner-drawer-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Content */}
      <div
        id="partner-drawer-content"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right border-l border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {partner ? 'Editar Parceiro' : 'Novo Parceiro'}
            </h3>
            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
              {partner ? `Parceiro ID #${partner.id}` : 'Cadastrar novo parceiro na Petvex'}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded-sm text-slate-400 hover:text-slate-600 hover:bg-slate-150 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto p-6 space-y-5"
          id="partner-form"
        >
          {error && <ApiErrorAlert error={error} className="mb-4" />}

          {/* Nome */}
          <Input
            id="partner-form-name"
            label="Nome do Parceiro *"
            placeholder="Ex: João Silva ou Pet Shop Avenida"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Razão Social */}
          <Input
            id="partner-form-company-name"
            label="Razão Social / Empresa"
            placeholder="Ex: Pet Shop Avenida LTDA"
            error={errors.company_name?.message}
            {...register('company_name')}
          />

          {/* CNPJ / CPF */}
          <Input
            id="partner-form-document"
            label="CPF ou CNPJ"
            placeholder="Apenas números ou formatado"
            error={errors.document?.message}
            {...register('document')}
          />

          {/* Email */}
          <Input
            id="partner-form-email"
            label="E-mail"
            type="email"
            placeholder="Ex: parceiro@petshop.com"
            error={errors.email?.message}
            {...register('email')}
          />

          {/* Telefone */}
          <Input
            id="partner-form-phone"
            label="Telefone / WhatsApp"
            placeholder="Ex: (11) 99999-9999"
            error={errors.phone?.message}
            {...register('phone')}
          />

          {/* Website */}
          <Input
            id="partner-form-website"
            label="Website"
            placeholder="Ex: https://petshop.com"
            error={errors.website?.message}
            {...register('website')}
          />

          {/* Instagram */}
          <Input
            id="partner-form-instagram"
            label="Instagram Handle"
            placeholder="Ex: @petshopavenida"
            error={errors.instagram?.message}
            {...register('instagram')}
          />

          {/* Observações */}
          <div className="flex flex-col gap-1.5" id="partner-form-notes-container">
            <label htmlFor="partner-form-notes" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Observações / Notas Internas
            </label>
            <textarea
              id="partner-form-notes"
              rows={3}
              placeholder="Notas, detalhes de contrato, comissão ou observações gerais..."
              className="w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow resize-none"
              {...register('notes')}
            />
          </div>

          {/* Status Ativo/Inativo */}
          <div className="flex items-center gap-2 pt-2" id="partner-form-status-container">
            <input
              type="checkbox"
              id="partner-form-is-active"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded-[4px]"
              {...register('is_active')}
            />
            <label htmlFor="partner-form-is-active" className="text-xs text-slate-700 font-bold uppercase tracking-wider select-none">
              Parceiro Ativo para uso
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <Button
            id="partner-form-cancel-btn"
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            id="partner-form-submit-btn"
            type="submit"
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
          >
            {partner ? 'Salvar Alterações' : 'Criar Parceiro'}
          </Button>
        </div>
      </div>
    </div>
  );
};
