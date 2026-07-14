import { PartnerCouponDiscountType } from '../../../core/http/generated/models/admin-partners/partnerCouponDiscountType';

export interface Partner {
  id: number;
  name: string;
  company_name: string | null;
  document: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  instagram: string | null;
  notes: string | null;
  is_active: boolean;
  coupons_count: number;
  created_at: string | null;
  updated_at: string | null;
}

export interface PartnerFormData {
  name: string;
  company_name?: string | null;
  document?: string | null;
  email?: string | null;
  phone?: string | null;
  website?: string | null;
  instagram?: string | null;
  notes?: string | null;
  is_active?: boolean;
}

export interface PartnerCoupon {
  id: number;
  partner_id: number;
  partner_name?: string;
  code: string;
  name: string;
  description: string | null;
  discount_type: PartnerCouponDiscountType;
  discount_value: string; // Keep as string for precision in input/display
  starts_at: string | null;
  expires_at: string | null;
  usage_limit: number | null;
  usage_limit_per_tenant: number | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface PartnerCouponFormData {
  partner_id: number;
  code: string;
  name: string;
  description?: string | null;
  discount_type: PartnerCouponDiscountType;
  discount_value: number;
  starts_at?: string | null;
  expires_at?: string | null;
  usage_limit?: number | null;
  usage_limit_per_tenant?: number | null;
  is_active?: boolean;
}

export interface ListPartnersParams {
  search?: string;
  is_active?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface ListPartnersResult {
  data: Partner[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}

export interface ListCouponsParams {
  search?: string;
  partner_id?: number;
  discount_type?: PartnerCouponDiscountType;
  is_active?: boolean;
  starts_at?: string;
  expires_at?: string;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  page?: number;
  per_page?: number;
}

export interface ListCouponsResult {
  data: PartnerCoupon[];
  total: number;
  page: number;
  per_page: number;
  last_page: number;
}
