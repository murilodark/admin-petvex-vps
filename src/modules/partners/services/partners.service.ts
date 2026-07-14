import {
  listAdminPartners,
  getAdminPartner,
  createAdminPartner,
  updateAdminPartner,
  deleteAdminPartner,
  activateAdminPartnerActivate,
  deactivateAdminPartnerDeactivate,
  listAdminPartnerCoupons,
  getAdminPartnerCoupon,
  createAdminPartnerCoupon,
  updateAdminPartnerCoupon,
  deleteAdminPartnerCoupon,
  activateAdminPartnerCouponActivate,
  deactivateAdminPartnerCouponDeactivate
} from '../../../core/http/generated/endpoints/admin-partners/admin-partners';
import { Partner as ApiPartner } from '../../../core/http/generated/models/admin-partners/partner';
import { PartnerCoupon as ApiPartnerCoupon } from '../../../core/http/generated/models/admin-partners/partnerCoupon';
import { StorePartnerRequest } from '../../../core/http/generated/models/admin-partners/storePartnerRequest';
import { UpdatePartnerRequest } from '../../../core/http/generated/models/admin-partners/updatePartnerRequest';
import { StorePartnerCouponRequest } from '../../../core/http/generated/models/admin-partners/storePartnerCouponRequest';
import { UpdatePartnerCouponRequest } from '../../../core/http/generated/models/admin-partners/updatePartnerCouponRequest';
import { partnerMapper } from '../mappers/partner.mapper';
import {
  ListPartnersParams,
  ListPartnersResult,
  Partner,
  PartnerFormData,
  ListCouponsParams,
  ListCouponsResult,
  PartnerCoupon,
  PartnerCouponFormData
} from '../types/partner.types';

export const partnersService = {
  async listarParceiros(params: ListPartnersParams = {}): Promise<ListPartnersResult> {
    const rawParams: any = {
      search: params.search || undefined,
      is_active: params.is_active !== undefined ? params.is_active : undefined,
      sort_by: params.sort_by || undefined,
      sort_direction: params.sort_direction || undefined,
      page: params.page,
      per_page: params.per_page,
    };

    const cleanParams = Object.fromEntries(
      Object.entries(rawParams).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    const apiResponse = (await listAdminPartners(cleanParams)) as any;

    const partnersArray: ApiPartner[] = Array.isArray(apiResponse?.data) ? apiResponse.data : [];
    const meta = apiResponse?.meta && typeof apiResponse.meta === 'object' ? apiResponse.meta : undefined;

    const total = Number(meta?.total ?? partnersArray.length);
    const page = Number(meta?.current_page ?? params.page ?? 1);
    const perPage = Number(meta?.per_page ?? params.per_page ?? 15);
    const lastPage = Number(meta?.last_page ?? 1);

    return {
      data: partnersArray.map(partnerMapper.toUiPartner),
      total,
      page,
      per_page: perPage,
      last_page: lastPage,
    };
  },

  async buscarParceiroPorId(id: number): Promise<Partner> {
    const apiResponse = await getAdminPartner(id);
    let apiPartner: ApiPartner;

    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      apiPartner = apiResponse.data as unknown as ApiPartner;
    } else {
      apiPartner = apiResponse as unknown as ApiPartner;
    }

    return partnerMapper.toUiPartner(apiPartner);
  },

  async cadastrarParceiro(formData: PartnerFormData): Promise<Partner> {
    const payload: StorePartnerRequest = {
      name: formData.name,
      company_name: formData.company_name || null,
      document: formData.document || null,
      email: formData.email || null,
      phone: formData.phone || null,
      website: formData.website || null,
      instagram: formData.instagram || null,
      notes: formData.notes || null,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
    };

    const apiResponse = await createAdminPartner(payload);
    let apiPartner: ApiPartner;

    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      apiPartner = apiResponse.data as unknown as ApiPartner;
    } else {
      apiPartner = apiResponse as unknown as ApiPartner;
    }

    return partnerMapper.toUiPartner(apiPartner);
  },

  async atualizarParceiro(id: number, formData: Partial<PartnerFormData>): Promise<Partner> {
    const payload: UpdatePartnerRequest = {
      name: formData.name,
      company_name: formData.company_name || null,
      document: formData.document || null,
      email: formData.email || null,
      phone: formData.phone || null,
      website: formData.website || null,
      instagram: formData.instagram || null,
      notes: formData.notes || null,
      is_active: formData.is_active !== undefined ? formData.is_active : undefined,
    };

    const apiResponse = await updateAdminPartner(id, payload);
    let apiPartner: ApiPartner;

    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      apiPartner = apiResponse.data as unknown as ApiPartner;
    } else {
      apiPartner = apiResponse as unknown as ApiPartner;
    }

    return partnerMapper.toUiPartner(apiPartner);
  },

  async excluirParceiro(id: number): Promise<void> {
    await deleteAdminPartner(id);
  },

  async ativarParceiro(id: number): Promise<void> {
    await activateAdminPartnerActivate(id);
  },

  async desativarParceiro(id: number): Promise<void> {
    await deactivateAdminPartnerDeactivate(id);
  },

  // --- CUPONS ---
  async listarCupons(params: ListCouponsParams = {}): Promise<ListCouponsResult> {
    const rawParams: any = {
      search: params.search || undefined,
      partner_id: params.partner_id || undefined,
      discount_type: params.discount_type || undefined,
      is_active: params.is_active !== undefined ? params.is_active : undefined,
      starts_at: params.starts_at || undefined,
      expires_at: params.expires_at || undefined,
      sort_by: params.sort_by || undefined,
      sort_direction: params.sort_direction || undefined,
      page: params.page,
      per_page: params.per_page,
    };

    const cleanParams = Object.fromEntries(
      Object.entries(rawParams).filter(([, value]) => value !== undefined && value !== null && value !== '')
    );

    const apiResponse = (await listAdminPartnerCoupons(cleanParams)) as any;

    const couponsArray: ApiPartnerCoupon[] = Array.isArray(apiResponse?.data) ? apiResponse.data : [];
    const meta = apiResponse?.meta && typeof apiResponse.meta === 'object' ? apiResponse.meta : undefined;

    const total = Number(meta?.total ?? couponsArray.length);
    const page = Number(meta?.current_page ?? params.page ?? 1);
    const perPage = Number(meta?.per_page ?? params.per_page ?? 15);
    const lastPage = Number(meta?.last_page ?? 1);

    return {
      data: couponsArray.map(partnerMapper.toUiCoupon),
      total,
      page,
      per_page: perPage,
      last_page: lastPage,
    };
  },

  async buscarCupomPorId(id: number): Promise<PartnerCoupon> {
    const apiResponse = await getAdminPartnerCoupon(id);
    let apiCoupon: ApiPartnerCoupon;

    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      apiCoupon = apiResponse.data as unknown as ApiPartnerCoupon;
    } else {
      apiCoupon = apiResponse as unknown as ApiPartnerCoupon;
    }

    return partnerMapper.toUiCoupon(apiCoupon);
  },

  async cadastrarCupom(formData: PartnerCouponFormData): Promise<PartnerCoupon> {
    const payload: StorePartnerCouponRequest = {
      partner_id: Number(formData.partner_id),
      code: formData.code.toUpperCase().trim(),
      name: formData.name,
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: Number(formData.discount_value),
      starts_at: formData.starts_at || null,
      expires_at: formData.expires_at || null,
      usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
      usage_limit_per_tenant: formData.usage_limit_per_tenant ? Number(formData.usage_limit_per_tenant) : null,
      is_active: formData.is_active !== undefined ? formData.is_active : true,
    };

    const apiResponse = await createAdminPartnerCoupon(payload);
    let apiCoupon: ApiPartnerCoupon;

    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      apiCoupon = apiResponse.data as unknown as ApiPartnerCoupon;
    } else {
      apiCoupon = apiResponse as unknown as ApiPartnerCoupon;
    }

    return partnerMapper.toUiCoupon(apiCoupon);
  },

  async atualizarCupom(id: number, formData: Partial<PartnerCouponFormData>): Promise<PartnerCoupon> {
    const payload: UpdatePartnerCouponRequest = {
      partner_id: formData.partner_id ? Number(formData.partner_id) : undefined,
      code: formData.code ? formData.code.toUpperCase().trim() : undefined,
      name: formData.name,
      description: formData.description || null,
      discount_type: formData.discount_type,
      discount_value: formData.discount_value !== undefined ? Number(formData.discount_value) : undefined,
      starts_at: formData.starts_at || null,
      expires_at: formData.expires_at || null,
      usage_limit: formData.usage_limit !== undefined ? (formData.usage_limit ? Number(formData.usage_limit) : null) : undefined,
      usage_limit_per_tenant: formData.usage_limit_per_tenant !== undefined ? (formData.usage_limit_per_tenant ? Number(formData.usage_limit_per_tenant) : null) : undefined,
      is_active: formData.is_active !== undefined ? formData.is_active : undefined,
    };

    const apiResponse = await updateAdminPartnerCoupon(id, payload);
    let apiCoupon: ApiPartnerCoupon;

    if (apiResponse && typeof apiResponse === 'object' && 'data' in apiResponse) {
      apiCoupon = apiResponse.data as unknown as ApiPartnerCoupon;
    } else {
      apiCoupon = apiResponse as unknown as ApiPartnerCoupon;
    }

    return partnerMapper.toUiCoupon(apiCoupon);
  },

  async excluirCupom(id: number): Promise<void> {
    await deleteAdminPartnerCoupon(id);
  },

  async ativarCupom(id: number): Promise<void> {
    await activateAdminPartnerCouponActivate(id);
  },

  async desativarCupom(id: number): Promise<void> {
    await deactivateAdminPartnerCouponDeactivate(id);
  }
};
