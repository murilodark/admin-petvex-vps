import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { X, Loader2 } from 'lucide-react';
import { couponSchema } from '../schemas/partner.schema';
import { Partner, PartnerCoupon, PartnerCouponFormData } from '../types/partner.types';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { ApiErrorAlert } from '../../../shared/components/ui/ApiErrorAlert';
import { PartnerCouponDiscountType } from '../../../core/http/generated/models/admin-partners/partnerCouponDiscountType';

interface CouponFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PartnerCouponFormData) => Promise<void>;
  coupon?: PartnerCoupon | null;
  partners: Partner[];
  preselectedPartnerId?: number;
  isLoading?: boolean;
  error?: any;
}

export const CouponFormDrawer: React.FC<CouponFormDrawerProps> = ({
  isOpen,
  onClose,
  onSubmit,
  coupon,
  partners,
  preselectedPartnerId,
  isLoading = false,
  error,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<PartnerCouponFormData>({
    resolver: zodResolver(couponSchema) as any,
    defaultValues: {
      partner_id: preselectedPartnerId || 0,
      code: '',
      name: '',
      description: '',
      discount_type: PartnerCouponDiscountType.fixed,
      discount_value: 0,
      starts_at: '',
      expires_at: '',
      usage_limit: null as any,
      usage_limit_per_tenant: null as any,
      is_active: true,
    },
  });

  const selectedDiscountType = watch('discount_type');

  // helper to format dates from API to datetime-local input string
  const formatDateForInput = (isoString: string | null | undefined): string => {
    if (!isoString) return '';
    try {
      const date = new Date(isoString);
      // Format to YYYY-MM-DDThh:mm
      const tzoffset = date.getTimezoneOffset() * 60000; //offset in milliseconds
      const localISOTime = (new Date(date.getTime() - tzoffset)).toISOString().slice(0, 16);
      return localISOTime;
    } catch {
      return '';
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (coupon) {
        reset({
          partner_id: coupon.partner_id,
          code: coupon.code,
          name: coupon.name,
          description: coupon.description || '',
          discount_type: coupon.discount_type,
          discount_value: Number(coupon.discount_value),
          starts_at: coupon.starts_at ? formatDateForInput(coupon.starts_at) : '',
          expires_at: coupon.expires_at ? formatDateForInput(coupon.expires_at) : '',
          usage_limit: coupon.usage_limit || null as any,
          usage_limit_per_tenant: coupon.usage_limit_per_tenant || null as any,
          is_active: coupon.is_active,
        });
      } else {
        reset({
          partner_id: preselectedPartnerId || 0,
          code: '',
          name: '',
          description: '',
          discount_type: PartnerCouponDiscountType.fixed,
          discount_value: 0,
          starts_at: '',
          expires_at: '',
          usage_limit: null as any,
          usage_limit_per_tenant: null as any,
          is_active: true,
        });
      }
    }
  }, [isOpen, coupon, preselectedPartnerId, reset]);

  if (!isOpen) return null;

  return (
    <div id="coupon-drawer-overlay" className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        id="coupon-drawer-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Content */}
      <div
        id="coupon-drawer-content"
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 animate-slide-in-right border-l border-slate-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              {coupon ? 'Editar Cupom' : 'Novo Cupom de Parceiro'}
            </h3>
            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
              {coupon ? `Cupom ID #${coupon.id}` : 'Distribua descontos vinculados a um parceiro'}
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
          id="coupon-form"
        >
          {error && <ApiErrorAlert error={error} className="mb-4" />}

          {/* Parceiro */}
          {preselectedPartnerId || coupon ? (
            <div className="flex flex-col gap-1.5" id="coupon-form-partner-read-only">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parceiro Vinculado</span>
              <div className="px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-xs font-bold text-slate-800">
                {coupon?.partner_name || partners.find(p => p.id === (preselectedPartnerId || coupon?.partner_id))?.name || 'Parceiro Selecionado'}
              </div>
              <input type="hidden" value={preselectedPartnerId || coupon?.partner_id} {...register('partner_id')} />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5" id="coupon-form-partner-select-container">
              <label htmlFor="coupon-form-partner-id" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Parceiro *
              </label>
              <select
                id="coupon-form-partner-id"
                className="w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                {...register('partner_id')}
              >
                <option value={0}>Selecione um parceiro...</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.company_name ? `(${p.company_name})` : ''}
                  </option>
                ))}
              </select>
              {errors.partner_id && (
                <span className="text-xs text-rose-600 font-medium">
                  {errors.partner_id.message}
                </span>
              )}
            </div>
          )}

          {/* Código do Cupom */}
          <Input
            id="coupon-form-code"
            label="Código do Cupom * (Apenas letras, números, hífen ou underline)"
            placeholder="Ex: PARCEIRO10, PETVEX-VIP"
            error={errors.code?.message}
            onChange={(e) => {
              setValue('code', e.target.value.toUpperCase());
            }}
            {...register('code')}
          />

          {/* Nome */}
          <Input
            id="coupon-form-name"
            label="Nome / Título da Campanha *"
            placeholder="Ex: Campanha de Boas-vindas"
            error={errors.name?.message}
            {...register('name')}
          />

          {/* Descrição */}
          <div className="flex flex-col gap-1.5" id="coupon-form-description-container">
            <label htmlFor="coupon-form-description" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Descrição
            </label>
            <textarea
              id="coupon-form-description"
              rows={2}
              placeholder="Descreva as condições, regulamento ou finalidade deste cupom..."
              className="w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow resize-none"
              {...register('description')}
            />
          </div>

          {/* Tipo e Valor de Desconto */}
          <div className="grid grid-cols-2 gap-4" id="coupon-form-discount-grid">
            <div className="flex flex-col gap-1.5" id="coupon-form-discount-type-container">
              <label htmlFor="coupon-form-discount-type" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tipo de Desconto *
              </label>
              <select
                id="coupon-form-discount-type"
                className="w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                {...register('discount_type')}
              >
                <option value={PartnerCouponDiscountType.fixed}>Fixo (R$)</option>
                <option value={PartnerCouponDiscountType.percentage}>Porcentagem (%)</option>
              </select>
            </div>

            <Input
              id="coupon-form-discount-value"
              label={selectedDiscountType === PartnerCouponDiscountType.percentage ? 'Porcentagem (%) *' : 'Valor Fixo (R$) *'}
              type="number"
              step="any"
              placeholder={selectedDiscountType === PartnerCouponDiscountType.percentage ? '15' : '50.00'}
              error={errors.discount_value?.message}
              {...register('discount_value')}
            />
          </div>

          {/* Datas de Vigência */}
          <div className="grid grid-cols-2 gap-4" id="coupon-form-dates-grid">
            <div className="flex flex-col gap-1.5" id="coupon-form-starts-at-container">
              <label htmlFor="coupon-form-starts-at" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Início da Vigência
              </label>
              <input
                id="coupon-form-starts-at"
                type="datetime-local"
                className="w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                {...register('starts_at')}
              />
            </div>

            <div className="flex flex-col gap-1.5" id="coupon-form-expires-at-container">
              <label htmlFor="coupon-form-expires-at" className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Fim / Expiração
              </label>
              <input
                id="coupon-form-expires-at"
                type="datetime-local"
                className="w-full px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
                {...register('expires_at')}
              />
            </div>
          </div>

          {/* Limites de Uso */}
          <div className="grid grid-cols-2 gap-4" id="coupon-form-limits-grid">
            <Input
              id="coupon-form-usage-limit"
              label="Limite Geral de Usos"
              type="number"
              placeholder="Ex: 100 (Opcional)"
              error={errors.usage_limit?.message}
              {...register('usage_limit')}
            />

            <Input
              id="coupon-form-usage-limit-per-tenant"
              label="Limite de Usos por Cliente"
              type="number"
              placeholder="Ex: 1 (Opcional)"
              error={errors.usage_limit_per_tenant?.message}
              {...register('usage_limit_per_tenant')}
            />
          </div>

          {/* Status Ativo/Inativo */}
          <div className="flex items-center gap-2 pt-2" id="coupon-form-status-container">
            <input
              type="checkbox"
              id="coupon-form-is-active"
              className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-slate-300 rounded-[4px]"
              {...register('is_active')}
            />
            <label htmlFor="coupon-form-is-active" className="text-xs text-slate-700 font-bold uppercase tracking-wider select-none">
              Cupom Ativo para uso
            </label>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3 shrink-0">
          <Button
            id="coupon-form-cancel-btn"
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            id="coupon-form-submit-btn"
            type="submit"
            onClick={handleSubmit(onSubmit)}
            isLoading={isLoading}
          >
            {coupon ? 'Salvar Alterações' : 'Criar Cupom'}
          </Button>
        </div>
      </div>
    </div>
  );
};
