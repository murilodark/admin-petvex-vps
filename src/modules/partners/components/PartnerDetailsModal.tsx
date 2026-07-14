import React from 'react';
import { X, Globe, Instagram, Mail, Phone, FileText, Calendar, Plus, Edit, Trash2, ShieldCheck, ShieldAlert, Tag, HelpCircle, ArrowRight } from 'lucide-react';
import { Partner, PartnerCoupon } from '../types/partner.types';
import { Badge } from '../../../shared/components/ui/Badge';
import { Button } from '../../../shared/components/ui/Button';

interface PartnerDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  coupons: PartnerCoupon[];
  isLoadingCoupons?: boolean;
  onAddCoupon: (partnerId: number) => void;
  onEditCoupon: (coupon: PartnerCoupon) => void;
  onToggleCouponStatus: (coupon: PartnerCoupon) => Promise<void>;
  onDeleteCoupon: (couponId: number) => void;
}

export const PartnerDetailsModal: React.FC<PartnerDetailsModalProps> = ({
  isOpen,
  onClose,
  partner,
  coupons,
  isLoadingCoupons = false,
  onAddCoupon,
  onEditCoupon,
  onToggleCouponStatus,
  onDeleteCoupon,
}) => {
  if (!isOpen || !partner) return null;

  const formatDate = (isoString: string | null) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getDiscountDisplay = (type: string, value: string) => {
    if (type === 'percentage') {
      return `${parseFloat(value).toFixed(0)}%`;
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(parseFloat(value));
  };

  return (
    <div id="partner-details-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        id="partner-details-backdrop"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
      />

      {/* Content Container */}
      <div
        id="partner-details-content"
        className="relative bg-white w-full max-w-4xl rounded-[4px] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] border border-slate-200 animate-fade-in"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-150 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div>
            <span className="text-[9px] font-bold uppercase tracking-widest text-teal-400 bg-teal-950 px-2.5 py-1 rounded-[2px] border border-teal-800/55">
              Visualização de Parceiro
            </span>
            <h3 className="text-sm font-bold uppercase tracking-wider mt-2 flex items-center gap-2">
              {partner.name}
              <Badge variant={partner.is_active ? 'success' : 'gray'} className="normal-case">
                {partner.is_active ? 'ATIVO' : 'INATIVO'}
              </Badge>
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-sm text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6" id="partner-details-body">
          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="partner-details-grid">
            {/* Info Column 1 */}
            <div className="space-y-4 bg-slate-50 p-4 border border-slate-200 rounded-[3px]">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                Dados Empresariais
              </h4>
              <div className="space-y-2.5 text-xs">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Razão Social</span>
                  <span className="font-semibold text-slate-800">{partner.company_name || '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">CNPJ / CPF</span>
                  <span className="font-semibold text-slate-800">{partner.document || '-'}</span>
                </div>
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide block">Cadastrado em</span>
                  <span className="font-mono text-slate-600">{formatDate(partner.created_at)}</span>
                </div>
              </div>
            </div>

            {/* Info Column 2 - Contacts */}
            <div className="space-y-4 bg-slate-50 p-4 border border-slate-200 rounded-[3px]">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                Canais de Contato
              </h4>
              <div className="space-y-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="h-4 w-4 text-slate-400 shrink-0" />
                  {partner.email ? (
                    <a href={`mailto:${partner.email}`} className="hover:text-teal-600 hover:underline font-semibold break-all">
                      {partner.email}
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Phone className="h-4 w-4 text-slate-400 shrink-0" />
                  {partner.phone ? (
                    <span className="font-semibold">{partner.phone}</span>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Globe className="h-4 w-4 text-slate-400 shrink-0" />
                  {partner.website ? (
                    <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 hover:underline font-semibold flex items-center gap-1">
                      Website
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Instagram className="h-4 w-4 text-slate-400 shrink-0" />
                  {partner.instagram ? (
                    <a href={`https://instagram.com/${partner.instagram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 hover:underline font-semibold">
                      {partner.instagram}
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
              </div>
            </div>

            {/* Info Column 3 - Notes */}
            <div className="space-y-4 bg-slate-50 p-4 border border-slate-200 rounded-[3px]">
              <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200 pb-2">
                Observações
              </h4>
              <div className="text-xs text-slate-700 leading-relaxed font-medium">
                {partner.notes ? (
                  <p className="whitespace-pre-line">{partner.notes}</p>
                ) : (
                  <span className="text-slate-400 italic">Sem observações salvas.</span>
                )}
              </div>
            </div>
          </div>

          {/* Coupons Section */}
          <div className="space-y-4" id="partner-details-coupons-section">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <h4 className="text-[11px] font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Tag className="h-4 w-4 text-teal-600" />
                Cupons Vinculados ({partner.coupons_count})
              </h4>
              <Button
                id={`add-coupon-for-partner-${partner.id}`}
                variant="primary"
                size="sm"
                className="gap-1.5"
                onClick={() => onAddCoupon(partner.id)}
              >
                <Plus className="h-3.5 w-3.5" />
                Criar Cupom
              </Button>
            </div>

            {isLoadingCoupons ? (
              <div className="py-12 text-center text-slate-500" id="partner-details-coupons-loading">
                <div className="inline-flex items-center gap-2 font-bold uppercase text-[10px] tracking-wider text-teal-600">
                  <svg className="animate-spin h-4 w-4 text-teal-600" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Buscando cupons...
                </div>
              </div>
            ) : coupons.length === 0 ? (
              <div className="py-12 border border-dashed border-slate-200 rounded-[4px] text-center bg-slate-50" id="partner-details-coupons-empty">
                <Tag className="h-8 w-8 text-slate-300 mx-auto mb-3" />
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nenhum cupom gerado</h5>
                <p className="text-[10px] text-slate-400 mt-1 uppercase">Crie o primeiro cupom de desconto para este parceiro</p>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-[4px] overflow-hidden" id="partner-details-coupons-table-wrapper">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" id="partner-details-coupons-table">
                    <thead>
                      <tr className="bg-slate-100 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <th className="py-3 px-4">Código / Nome</th>
                        <th className="py-3 px-4">Desconto</th>
                        <th className="py-3 px-4">Validade</th>
                        <th className="py-3 px-4">Limites</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {coupons.map((coupon) => (
                        <tr key={coupon.id} className="hover:bg-slate-50/50">
                          <td className="py-3 px-4">
                            <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-[3px] inline-block border border-slate-200 text-[11px]">
                              {coupon.code}
                            </div>
                            <div className="font-medium text-slate-500 mt-1 uppercase text-[10px] tracking-wide">{coupon.name}</div>
                          </td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-950">
                              {getDiscountDisplay(coupon.discount_type, coupon.discount_value)}
                            </div>
                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                              {coupon.discount_type === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[10px] font-mono text-slate-600">
                            <div>
                              <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider mr-1">DE:</span>
                              {coupon.starts_at ? formatDate(coupon.starts_at).split(',')[0] : 'Imediato'}
                            </div>
                            <div className="mt-1">
                              <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider mr-1">ATÉ:</span>
                              {coupon.expires_at ? formatDate(coupon.expires_at).split(',')[0] : 'Sem limite'}
                            </div>
                          </td>
                          <td className="py-3 px-4 text-[10px] font-mono text-slate-600">
                            <div>
                              <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider mr-1">Geral:</span>
                              {coupon.usage_limit || 'Ilimitado'}
                            </div>
                            <div className="mt-1">
                              <span className="text-slate-400 uppercase text-[9px] font-bold tracking-wider mr-1">SaaS Client:</span>
                              {coupon.usage_limit_per_tenant || 'Ilimitado'}
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => onToggleCouponStatus(coupon)}
                              className="focus:outline-none cursor-pointer"
                              title="Clique para alternar o status"
                            >
                              <Badge variant={coupon.is_active ? 'success' : 'gray'}>
                                {coupon.is_active ? 'ATIVO' : 'INATIVO'}
                              </Badge>
                            </button>
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => onEditCoupon(coupon)}
                                className="p-1 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-sm cursor-pointer transition-colors"
                                title="Editar cupom"
                              >
                                <Edit className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => onDeleteCoupon(coupon.id)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm cursor-pointer transition-colors"
                                title="Excluir cupom"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4.5 border-t border-slate-150 bg-slate-50 flex items-center justify-end shrink-0">
          <Button
            id="close-partner-details-modal"
            variant="secondary"
            onClick={onClose}
          >
            Fechar Janela
          </Button>
        </div>
      </div>
    </div>
  );
};
