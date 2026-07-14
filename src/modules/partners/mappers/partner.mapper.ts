import { Partner as ApiPartner } from '../../../core/http/generated/models/admin-partners/partner';
import { PartnerCoupon as ApiPartnerCoupon } from '../../../core/http/generated/models/admin-partners/partnerCoupon';
import { PartnerCouponDiscountType } from '../../../core/http/generated/models/admin-partners/partnerCouponDiscountType';
import { Partner, PartnerCoupon } from '../types/partner.types';

export const partnerMapper = {
  toUiPartner(apiData: ApiPartner): Partner {
    return {
      id: apiData.id,
      name: apiData.name || '',
      company_name: apiData.company_name || null,
      document: apiData.document || null,
      email: apiData.email || null,
      phone: apiData.phone || null,
      website: apiData.website || null,
      instagram: apiData.instagram || null,
      notes: apiData.notes || null,
      is_active: !!apiData.is_active,
      coupons_count: typeof apiData.coupons_count === 'number' ? apiData.coupons_count : (apiData.coupons?.length || 0),
      created_at: apiData.created_at || null,
      updated_at: apiData.updated_at || null,
    };
  },

  toUiCoupon(apiData: ApiPartnerCoupon): PartnerCoupon {
    return {
      id: apiData.id,
      partner_id: apiData.partner_id,
      partner_name: apiData.partner?.name || undefined,
      code: apiData.code || '',
      name: apiData.name || '',
      description: apiData.description || null,
      discount_type: (apiData.discount_type as PartnerCouponDiscountType) || PartnerCouponDiscountType.fixed,
      discount_value: apiData.discount_value || '0.00',
      starts_at: apiData.starts_at || null,
      expires_at: apiData.expires_at || null,
      usage_limit: apiData.usage_limit || null,
      usage_limit_per_tenant: apiData.usage_limit_per_tenant || null,
      is_active: !!apiData.is_active,
      created_at: apiData.created_at || null,
      updated_at: apiData.updated_at || null,
    };
  }
};
