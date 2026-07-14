import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListAdminPartners,
  useCreateAdminPartner,
  useUpdateAdminPartner,
  useDeleteAdminPartner,
  useActivateAdminPartnerActivate,
  useDeactivateAdminPartnerDeactivate,
  useListAdminPartnerCoupons,
  useCreateAdminPartnerCoupon,
  useUpdateAdminPartnerCoupon,
  useDeleteAdminPartnerCoupon,
  useActivateAdminPartnerCouponActivate,
  useDeactivateAdminPartnerCouponDeactivate
} from '../../../core/http/generated/endpoints/admin-partners/admin-partners';
import { Partner as ApiPartner } from '../../../core/http/generated/models/admin-partners/partner';
import { PartnerCoupon as ApiPartnerCoupon } from '../../../core/http/generated/models/admin-partners/partnerCoupon';
import { PartnerCouponDiscountType } from '../../../core/http/generated/models/admin-partners/partnerCouponDiscountType';
import { partnerMapper } from '../mappers/partner.mapper';
import { Partner, PartnerCoupon, PartnerFormData, PartnerCouponFormData } from '../types/partner.types';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';
import { Card } from '../../../shared/components/ui/Card';
import { Input } from '../../../shared/components/ui/Input';
import { ApiErrorAlert } from '../../../shared/components/ui/ApiErrorAlert';
import { PartnerFormDrawer } from '../components/PartnerFormDrawer';
import { CouponFormDrawer } from '../components/CouponFormDrawer';
import { PartnerDetailsModal } from '../components/PartnerDetailsModal';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import {
  Tag,
  PlusCircle,
  Search,
  Filter,
  CheckCircle,
  Trash2,
  Edit,
  Eye,
  Building,
  Users,
  Grid,
  Percent,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  X,
  UserCheck
} from 'lucide-react';

export const PartnersPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'partners' | 'coupons'>('partners');

  // --- QUERY & FILTER STATES ---
  // Partners Filters
  const [partnerSearch, setPartnerSearch] = useState('');
  const [partnerStatus, setPartnerStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [partnerPage, setPartnerPage] = useState(1);

  // Coupons Filters
  const [couponSearch, setCouponSearch] = useState('');
  const [couponStatus, setCouponStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [couponPartnerId, setCouponPartnerId] = useState<number | 'all'>('all');
  const [couponPage, setCouponPage] = useState(1);

  // Toast State
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- MODAL / DRAWER STATES ---
  // Partner Form Drawer
  const [isPartnerDrawerOpen, setIsPartnerDrawerOpen] = useState(false);
  const [selectedPartnerForEdit, setSelectedPartnerForEdit] = useState<Partner | null>(null);
  const [partnerFormError, setPartnerFormError] = useState<any>(null);

  // Coupon Form Drawer
  const [isCouponDrawerOpen, setIsCouponDrawerOpen] = useState(false);
  const [selectedCouponForEdit, setSelectedCouponForEdit] = useState<PartnerCoupon | null>(null);
  const [preselectedPartnerId, setPreselectedPartnerId] = useState<number | undefined>(undefined);
  const [couponFormError, setCouponFormError] = useState<any>(null);

  // Partner Details Modal
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPartnerForDetails, setSelectedPartnerForDetails] = useState<Partner | null>(null);

  // Delete Confirm Modal
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'partner' | 'coupon'; id: number; name: string } | null>(null);

  // --- API QUERIES ---
  // Debounced Search Strings
  const [debouncedPartnerSearch, setDebouncedPartnerSearch] = useState('');
  const [debouncedCouponSearch, setDebouncedCouponSearch] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedPartnerSearch(partnerSearch);
      setPartnerPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [partnerSearch]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCouponSearch(couponSearch);
      setCouponPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [couponSearch]);

  // Partners List Query (uses raw Orval hook)
  const is_active_partner = partnerStatus === 'all' ? undefined : partnerStatus === 'active';
  const {
    data: partnersQueryResult,
    isLoading: isPartnersLoading,
    error: partnersError,
    refetch: refetchPartners,
  } = useListAdminPartners(
    {
      search: debouncedPartnerSearch || undefined,
      is_active: is_active_partner,
      per_page: 15,
      // Pass page as query parameter inside params object
      ...({ page: partnerPage } as any),
    }
  );

  // Coupons List Query (uses raw Orval hook)
  const is_active_coupon = couponStatus === 'all' ? undefined : couponStatus === 'active';
  const {
    data: couponsQueryResult,
    isLoading: isCouponsLoading,
    error: couponsError,
    refetch: refetchCoupons,
  } = useListAdminPartnerCoupons(
    {
      search: debouncedCouponSearch || undefined,
      is_active: is_active_coupon,
      partner_id: couponPartnerId === 'all' ? undefined : couponPartnerId,
      per_page: 15,
      ...({ page: couponPage } as any),
    }
  );

  // We also want a lightweight list of ALL active partners to populate selection dropdowns
  const { data: allPartnersDropdownResult } = useListAdminPartners({
    per_page: 100, // Load enough for dropdown selections
  });

  // Extract Lists & Metadata safely based on Orval's response unboxing
  const extractPaginationData = (apiResult: any) => {
    let list: any[] = [];
    let total = 0;
    let page = 1;
    let lastPage = 1;

    if (apiResult) {
      if (Array.isArray(apiResult.data)) {
        list = apiResult.data;
        const meta = apiResult.meta;
        if (meta && typeof meta === 'object') {
          total = Number(meta.total || meta.total_records || list.length);
          page = Number(meta.current_page || meta.page || page);
          lastPage = Number(meta.last_page || lastPage);
        } else {
          total = list.length;
        }
      } else if (Array.isArray(apiResult)) {
        list = apiResult;
        total = list.length;
      }
    }

    return { list, total, page, lastPage };
  };

  const { list: rawPartnersList, total: partnersTotal, lastPage: partnersLastPage } = extractPaginationData(partnersQueryResult);
  const { list: rawCouponsList, total: couponsTotal, lastPage: couponsLastPage } = extractPaginationData(couponsQueryResult);
  const { list: rawDropdownPartnersList } = extractPaginationData(allPartnersDropdownResult);

  const partners: Partner[] = rawPartnersList.map(partnerMapper.toUiPartner);
  const coupons: PartnerCoupon[] = rawCouponsList.map(partnerMapper.toUiCoupon);
  const dropdownPartners: Partner[] = rawDropdownPartnersList.map(partnerMapper.toUiPartner);

  // Get specific coupons for the Details Modal partner (filtered from all coupons, or dynamic)
  // Let's filter client-side to ensure real-time consistency or trigger an isolated fetch
  const partnerCoupons = coupons.filter(c => c.partner_id === selectedPartnerForDetails?.id);

  // --- MUTATIONS ---
  // Partners Mutations
  const createPartnerMutation = useCreateAdminPartner();
  const updatePartnerMutation = useUpdateAdminPartner();
  const deletePartnerMutation = useDeleteAdminPartner();
  const activatePartnerMutation = useActivateAdminPartnerActivate();
  const deactivatePartnerMutation = useDeactivateAdminPartnerDeactivate();

  // Coupons Mutations
  const createCouponMutation = useCreateAdminPartnerCoupon();
  const updateCouponMutation = useUpdateAdminPartnerCoupon();
  const deleteCouponMutation = useDeleteAdminPartnerCoupon();
  const activateCouponMutation = useActivateAdminPartnerCouponActivate();
  const deactivateCouponMutation = useDeactivateAdminPartnerCouponDeactivate();

  // --- ACTIONS HANDLERS ---
  // Partner handlers
  const handleOpenCreatePartner = () => {
    setSelectedPartnerForEdit(null);
    setPartnerFormError(null);
    setIsPartnerDrawerOpen(true);
  };

  const handleOpenEditPartner = (partner: Partner, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSelectedPartnerForEdit(partner);
    setPartnerFormError(null);
    setIsPartnerDrawerOpen(true);
  };

  const handlePartnerFormSubmit = async (formData: PartnerFormData) => {
    setPartnerFormError(null);
    try {
      if (selectedPartnerForEdit) {
        await updatePartnerMutation.mutateAsync({
          partner: selectedPartnerForEdit.id,
          data: formData as any,
        });
        showToast(`Parceiro "${formData.name}" atualizado com sucesso!`, 'success');
      } else {
        await createPartnerMutation.mutateAsync({
          data: formData as any,
        });
        showToast(`Parceiro "${formData.name}" cadastrado com sucesso!`, 'success');
      }
      setIsPartnerDrawerOpen(false);
      // Invalidate query to trigger react query reload
      queryClient.invalidateQueries({ queryKey: [`/v1/admin/partners`] });
    } catch (err: any) {
      setPartnerFormError(err);
    }
  };

  const handleTogglePartnerStatus = async (partner: Partner, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (partner.is_active) {
        await deactivatePartnerMutation.mutateAsync({ partner: partner.id });
        showToast(`Parceiro "${partner.name}" desativado.`, 'info');
      } else {
        await activatePartnerMutation.mutateAsync({ partner: partner.id });
        showToast(`Parceiro "${partner.name}" ativado com sucesso!`, 'success');
      }
      queryClient.invalidateQueries({ queryKey: [`/v1/admin/partners`] });
    } catch (err) {
      showToast('Não foi possível alterar o status do parceiro.', 'error');
    }
  };

  // Coupon handlers
  const handleOpenCreateCoupon = () => {
    setSelectedCouponForEdit(null);
    setPreselectedPartnerId(undefined);
    setCouponFormError(null);
    setIsCouponDrawerOpen(true);
  };

  const handleOpenCreateCouponForPartner = (partnerId: number) => {
    setSelectedCouponForEdit(null);
    setPreselectedPartnerId(partnerId);
    setCouponFormError(null);
    setIsCouponDrawerOpen(true);
  };

  const handleOpenEditCoupon = (coupon: PartnerCoupon) => {
    setSelectedCouponForEdit(coupon);
    setPreselectedPartnerId(undefined);
    setCouponFormError(null);
    setIsCouponDrawerOpen(true);
  };

  const handleCouponFormSubmit = async (formData: PartnerCouponFormData) => {
    setCouponFormError(null);
    try {
      if (selectedCouponForEdit) {
        await updateCouponMutation.mutateAsync({
          coupon: selectedCouponForEdit.id,
          data: formData as any,
        });
        showToast(`Cupom "${formData.code}" atualizado com sucesso!`, 'success');
      } else {
        await createCouponMutation.mutateAsync({
          data: formData as any,
        });
        showToast(`Cupom "${formData.code}" gerado com sucesso!`, 'success');
      }
      setIsCouponDrawerOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/v1/admin/partner-coupons`] });
      queryClient.invalidateQueries({ queryKey: [`/v1/admin/partners`] });
    } catch (err: any) {
      setCouponFormError(err);
    }
  };

  const handleToggleCouponStatus = async (coupon: PartnerCoupon) => {
    try {
      if (coupon.is_active) {
        await deactivateCouponMutation.mutateAsync({ coupon: coupon.id });
        showToast(`Cupom "${coupon.code}" desativado.`, 'info');
      } else {
        await activateCouponMutation.mutateAsync({ coupon: coupon.id });
        showToast(`Cupom "${coupon.code}" ativado com sucesso!`, 'success');
      }
      queryClient.invalidateQueries({ queryKey: [`/v1/admin/partner-coupons`] });
      queryClient.invalidateQueries({ queryKey: [`/v1/admin/partners`] });
    } catch (err) {
      showToast('Não foi possível alterar o status do cupom.', 'error');
    }
  };

  // View Details Modal
  const handleOpenPartnerDetails = (partner: Partner) => {
    setSelectedPartnerForDetails(partner);
    setIsDetailsModalOpen(true);
  };

  // Delete Prompt
  const handleTriggerDeletePartner = (partner: Partner, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setDeleteTarget({
      type: 'partner',
      id: partner.id,
      name: partner.name,
    });
  };

  const handleTriggerDeleteCoupon = (couponId: number) => {
    const coupon = coupons.find(c => c.id === couponId);
    setDeleteTarget({
      type: 'coupon',
      id: couponId,
      name: coupon?.code || `#${couponId}`,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      if (deleteTarget.type === 'partner') {
        await deletePartnerMutation.mutateAsync({ partner: deleteTarget.id });
        showToast(`Parceiro "${deleteTarget.name}" excluído.`, 'success');
        queryClient.invalidateQueries({ queryKey: [`/v1/admin/partners`] });
      } else {
        await deleteCouponMutation.mutateAsync({ coupon: deleteTarget.id });
        showToast(`Cupom "${deleteTarget.name}" excluído com sucesso.`, 'success');
        queryClient.invalidateQueries({ queryKey: [`/v1/admin/partner-coupons`] });
        queryClient.invalidateQueries({ queryKey: [`/v1/admin/partners`] });
      }
      setDeleteTarget(null);
    } catch (err) {
      showToast('Erro de restrição na API: Não é possível excluir devido a registros vinculados.', 'error');
    }
  };

  // Helper formatting BRL discount
  const formatCurrency = (valStr: string) => {
    const val = parseFloat(valStr) || 0;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Page index helpers
  const handlePrevPage = () => {
    if (activeTab === 'partners') {
      if (partnerPage > 1) setPartnerPage(partnerPage - 1);
    } else {
      if (couponPage > 1) setCouponPage(couponPage - 1);
    }
  };

  const handleNextPage = () => {
    if (activeTab === 'partners') {
      if (partnerPage < partnersLastPage) setPartnerPage(partnerPage + 1);
    } else {
      if (couponPage < couponsLastPage) setCouponPage(couponPage + 1);
    }
  };

  return (
    <div className="space-y-6" id="partners-page-container">
      {/* Toast Alert Feedback */}
      {toast && (
        <div
          id="global-toast"
          className={`p-4 border rounded-[4px] text-xs flex gap-3 items-start animate-slide-in fixed top-4 right-4 z-[9999] shadow-2xl max-w-md ${
            toast.type === 'success'
              ? 'bg-teal-50 border-teal-200 text-teal-800'
              : toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
        >
          <CheckCircle className={`h-5 w-5 shrink-0 mt-0.5 ${toast.type === 'success' ? 'text-teal-600' : 'text-slate-500'}`} />
          <div>
            <p className="font-extrabold uppercase tracking-wide text-[10px] m-0">Parceiros & Cupons</p>
            <p className="text-[11px] text-slate-500 mt-1 font-medium leading-normal">{toast.text}</p>
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-[4px]" id="partners-toolbar">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 rounded-[4px] border border-teal-100 flex items-center justify-center shrink-0">
              <Tag className="h-4.5 w-4.5 text-teal-600" />
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              MÓDULO DE PARCEIROS E CUPONS
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-1.5 pl-9">
            Gerencie canais de parcerias da Petvex, emita cupons promocionais integrados, ative descontos comerciais e monitore campanhas
          </p>
        </div>

        <div className="flex gap-2 w-full sm:w-auto shrink-0">
          <Button
            id="btn-new-partner"
            variant="outline"
            className="text-xs"
            onClick={handleOpenCreatePartner}
          >
            <PlusCircle className="h-4 w-4 mr-2 text-teal-500" />
            CADASTRAR PARCEIRO
          </Button>
          <Button
            id="btn-new-coupon"
            variant="primary"
            className="text-xs"
            onClick={handleOpenCreateCoupon}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            GERAR CUPOM
          </Button>
        </div>
      </div>

      {/* Overview Stat Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="partners-stats-grid">
        <div className="bg-white border border-slate-200 rounded-[4px] p-5 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">TOTAL DE PARCEIROS</span>
            <Building className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 leading-none">{isPartnersLoading ? '...' : partnersTotal}</span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase mt-1">CANAIS DE DISTRIBUIÇÃO</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[4px] p-5 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">PARCEIROS EM ATIVIDADE</span>
            <span className="h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 leading-none">
              {isPartnersLoading ? '...' : partners.filter(p => p.is_active).length}
            </span>
            <span className="block text-[9px] text-teal-600 font-bold uppercase mt-1">CANAIS ATIVOS COM ACESSO</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[4px] p-5 text-left flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">CUPONS EXPEDIDOS</span>
            <Tag className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 leading-none">{isCouponsLoading ? '...' : couponsTotal}</span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase mt-1">CAMPANHAS DE DESCONTO</span>
          </div>
        </div>

        <div className="bg-slate-900 text-white border border-slate-950 rounded-[4px] p-5 text-left flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-24 h-24 text-teal-400" />
          </div>
          <div className="flex items-center justify-between relative z-1">
            <span className="text-[9px] font-mono font-black text-teal-400 uppercase tracking-widest font-bold">INTEGRAÇÃO LARAVEL</span>
            <Sparkles className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-3 relative z-1">
            <span className="text-xs font-black uppercase text-slate-200 flex items-center gap-1">
              Petvex Admin Core <RefreshCw className="h-3.5 w-3.5 text-teal-400" />
            </span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase mt-1 font-mono">CONTRATOS SINCRONIZADOS</span>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-4" id="partners-tabs-nav">
        <button
          onClick={() => setActiveTab('partners')}
          className={`pb-4 text-xs font-black uppercase tracking-wider border-b-2 px-1 cursor-pointer transition-colors ${
            activeTab === 'partners'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Parceiros ({partnersTotal})
        </button>
        <button
          onClick={() => setActiveTab('coupons')}
          className={`pb-4 text-xs font-black uppercase tracking-wider border-b-2 px-1 cursor-pointer transition-colors ${
            activeTab === 'coupons'
              ? 'border-teal-600 text-teal-700'
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          Cupons Promocionais ({couponsTotal})
        </button>
      </div>

      {/* --- TAB CONTENT: PARTNERS --- */}
      {activeTab === 'partners' && (
        <div className="space-y-4" id="partners-tab-content">
          {/* Filters Toolbar */}
          <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-4 border border-slate-200 rounded-[4px]" id="partners-filters-toolbar">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar parceiros por nome, razão social, documento, e-mail ou telefone..."
                value={partnerSearch}
                onChange={(e) => setPartnerSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto shrink-0">
              <Filter className="h-4 w-4 text-slate-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
              <select
                value={partnerStatus}
                onChange={(e) => setPartnerStatus(e.target.value as any)}
                className="px-3.5 py-2 border rounded-[4px] text-xs bg-slate-50 border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="all">Todos os Status</option>
                <option value="active">Apenas Ativos</option>
                <option value="inactive">Apenas Inativos</option>
              </select>
            </div>
          </div>

          {/* List Table or Loading State */}
          {isPartnersLoading ? (
            <Card className="flex items-center justify-center py-20 text-slate-500">
              <div className="inline-flex items-center gap-2 font-bold uppercase text-xs tracking-widest text-teal-600">
                <svg className="animate-spin h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Carregando parceiros...
              </div>
            </Card>
          ) : partners.length === 0 ? (
            <Card className="py-20 text-center border-dashed border-2 border-slate-200">
              <Building className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Nenhum Parceiro Encontrado</h4>
              <p className="text-xs text-slate-400 mt-1 uppercase max-w-sm mx-auto">
                {debouncedPartnerSearch || partnerStatus !== 'all'
                  ? 'Nenhum resultado corresponde aos filtros aplicados.'
                  : 'Cadastre os primeiros parceiros para começar a gerenciar cupons.'}
              </p>
              {(debouncedPartnerSearch || partnerStatus !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setPartnerSearch('');
                    setPartnerStatus('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </Card>
          ) : (
            <Card className="overflow-hidden p-0" id="partners-table-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" id="partners-table">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="py-4.5 px-6">Identificação / Empresa</th>
                      <th className="py-4.5 px-6">Contato</th>
                      <th className="py-4.5 px-6">Documento</th>
                      <th className="py-4.5 px-6 text-center">Cupons</th>
                      <th className="py-4.5 px-6">Status</th>
                      <th className="py-4.5 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {partners.map((p) => (
                      <tr
                        key={p.id}
                        onClick={() => handleOpenPartnerDetails(p)}
                        className="hover:bg-slate-50/50 cursor-pointer transition-colors"
                      >
                        <td className="py-4 px-6">
                          <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                          {p.company_name && (
                            <div className="text-[10px] font-mono text-slate-400 uppercase mt-1">
                              {p.company_name}
                            </div>
                          )}
                        </td>
                        <td className="py-4 px-6 space-y-1">
                          {p.email && <div className="font-semibold text-slate-600 break-all">{p.email}</div>}
                          {p.phone && <div className="text-slate-500 font-mono text-[10px]">{p.phone}</div>}
                        </td>
                        <td className="py-4 px-6 font-mono text-[11px] text-slate-600">
                          {p.document || '-'}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <span className="inline-flex items-center justify-center font-bold font-mono text-[11px] bg-teal-50 border border-teal-200 text-teal-800 rounded-full h-6 min-w-6 px-1.5 shadow-3xs">
                            {p.coupons_count}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            type="button"
                            onClick={(e) => handleTogglePartnerStatus(p, e)}
                            className="focus:outline-none cursor-pointer"
                            title="Alternar status do parceiro"
                          >
                            <Badge variant={p.is_active ? 'success' : 'gray'}>
                              {p.is_active ? 'ATIVO' : 'INATIVO'}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenPartnerDetails(p);
                              }}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-sm cursor-pointer transition-colors"
                              title="Visualizar detalhes"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleOpenEditPartner(p, e)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-sm cursor-pointer transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleTriggerDeletePartner(p, e)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm cursor-pointer transition-colors"
                              title="Excluir parceiro"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination bar */}
              {partnersLastPage > 1 && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs" id="partners-pagination">
                  <span className="font-medium text-slate-500">
                    Total: <strong className="text-slate-800">{partnersTotal}</strong> registros (Pág. {partnerPage} de {partnersLastPage})
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      id="partners-prev-page"
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={partnerPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      id="partners-next-page"
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={partnerPage === partnersLastPage}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: COUPONS --- */}
      {activeTab === 'coupons' && (
        <div className="space-y-4" id="coupons-tab-content">
          {/* Filters Toolbar */}
          <div className="flex flex-col md:flex-row gap-4 bg-white p-4 border border-slate-200 rounded-[4px]" id="coupons-filters-toolbar">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar cupons por código, nome, campanha ou parceiro..."
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div className="grid grid-cols-2 md:flex md:items-center gap-3 w-full md:w-auto shrink-0">
              <div className="flex items-center gap-1.5">
                <Filter className="h-4 w-4 text-slate-400 hidden sm:block" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Parceiro</span>
                <select
                  value={couponPartnerId}
                  onChange={(e) => {
                    const v = e.target.value;
                    setCouponPartnerId(v === 'all' ? 'all' : Number(v));
                  }}
                  className="px-2.5 py-2 border rounded-[4px] text-xs bg-slate-50 border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full"
                >
                  <option value="all">Todos</option>
                  {dropdownPartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</span>
                <select
                  value={couponStatus}
                  onChange={(e) => setCouponStatus(e.target.value as any)}
                  className="px-2.5 py-2 border rounded-[4px] text-xs bg-slate-50 border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 w-full"
                >
                  <option value="all">Todos</option>
                  <option value="active">Ativos</option>
                  <option value="inactive">Inativos</option>
                </select>
              </div>
            </div>
          </div>

          {/* List Table or Loading State */}
          {isCouponsLoading ? (
            <Card className="flex items-center justify-center py-20 text-slate-500">
              <div className="inline-flex items-center gap-2 font-bold uppercase text-xs tracking-widest text-teal-600">
                <svg className="animate-spin h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Carregando cupons...
              </div>
            </Card>
          ) : coupons.length === 0 ? (
            <Card className="py-20 text-center border-dashed border-2 border-slate-200">
              <Tag className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wide">Nenhum Cupom Encontrado</h4>
              <p className="text-xs text-slate-400 mt-1 uppercase max-w-sm mx-auto">
                {debouncedCouponSearch || couponStatus !== 'all' || couponPartnerId !== 'all'
                  ? 'Nenhum cupom promocional coincide com os parâmetros informados.'
                  : 'Nenhum cupom gerado na base. Clique em "Gerar Cupom" para criar.'}
              </p>
              {(debouncedCouponSearch || couponStatus !== 'all' || couponPartnerId !== 'all') && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setCouponSearch('');
                    setCouponStatus('all');
                    setCouponPartnerId('all');
                  }}
                >
                  Limpar Filtros
                </Button>
              )}
            </Card>
          ) : (
            <Card className="overflow-hidden p-0" id="coupons-table-card">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse" id="coupons-table">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      <th className="py-4.5 px-6">Código / Campanha</th>
                      <th className="py-4.5 px-6">Parceiro Vinculado</th>
                      <th className="py-4.5 px-6">Desconto</th>
                      <th className="py-4.5 px-6">Validade</th>
                      <th className="py-4.5 px-6">Limites</th>
                      <th className="py-4.5 px-6">Status</th>
                      <th className="py-4.5 px-6 text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                    {coupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-mono font-bold text-slate-900 bg-slate-100 px-2.5 py-1 border border-slate-200 rounded-[3px] inline-block text-[11px] tracking-wider">
                            {coupon.code}
                          </div>
                          <div className="text-slate-500 font-bold uppercase tracking-wider text-[9px] mt-1.5">{coupon.name}</div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-bold text-slate-800 text-[11px] uppercase tracking-wide">
                            {coupon.partner_name || 'ID Parceiro: #' + coupon.partner_id}
                          </span>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-black text-slate-900 text-sm">
                            {coupon.discount_type === 'percentage'
                              ? `${parseFloat(coupon.discount_value).toFixed(0)}%`
                              : formatCurrency(coupon.discount_value)}
                          </div>
                          <div className="text-[9px] font-mono text-slate-400 uppercase tracking-wider mt-0.5">
                            {coupon.discount_type === 'percentage' ? 'Percentual' : 'Fixo'}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[10px] font-mono text-slate-600 space-y-1">
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mr-1">DE:</span>
                            {coupon.starts_at ? new Date(coupon.starts_at).toLocaleDateString('pt-BR') : 'Imediato'}
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mr-1">ATÉ:</span>
                            {coupon.expires_at ? new Date(coupon.expires_at).toLocaleDateString('pt-BR') : 'Sem expiração'}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-[10px] font-mono text-slate-600 space-y-1">
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mr-1">Geral:</span>
                            {coupon.usage_limit || 'Ilimitado'}
                          </div>
                          <div>
                            <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider mr-1">SaaS:</span>
                            {coupon.usage_limit_per_tenant || 'Ilimitado'}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <button
                            type="button"
                            onClick={() => handleToggleCouponStatus(coupon)}
                            className="focus:outline-none cursor-pointer"
                            title="Alternar status do cupom"
                          >
                            <Badge variant={coupon.is_active ? 'success' : 'gray'}>
                              {coupon.is_active ? 'ATIVO' : 'INATIVO'}
                            </Badge>
                          </button>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleOpenEditCoupon(coupon)}
                              className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-sm cursor-pointer transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleTriggerDeleteCoupon(coupon.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-sm cursor-pointer transition-colors"
                              title="Excluir cupom"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination Bar */}
              {couponsLastPage > 1 && (
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs" id="coupons-pagination">
                  <span className="font-medium text-slate-500">
                    Total: <strong className="text-slate-800">{couponsTotal}</strong> cupons (Pág. {couponPage} de {couponsLastPage})
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      id="coupons-prev-page"
                      variant="outline"
                      size="sm"
                      onClick={handlePrevPage}
                      disabled={couponPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      id="coupons-next-page"
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={couponPage === couponsLastPage}
                    >
                      Próxima
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          )}
        </div>
      )}

      {/* --- FORM DRAWERS AND CONFIRM MODALS --- */}

      {/* Partner Form Drawer */}
      <PartnerFormDrawer
        isOpen={isPartnerDrawerOpen}
        onClose={() => setIsPartnerDrawerOpen(false)}
        onSubmit={handlePartnerFormSubmit}
        partner={selectedPartnerForEdit}
        isLoading={createPartnerMutation.isPending || updatePartnerMutation.isPending}
        error={partnerFormError}
      />

      {/* Coupon Form Drawer */}
      <CouponFormDrawer
        isOpen={isCouponDrawerOpen}
        onClose={() => setIsCouponDrawerOpen(false)}
        onSubmit={handleCouponFormSubmit}
        coupon={selectedCouponForEdit}
        partners={dropdownPartners}
        preselectedPartnerId={preselectedPartnerId}
        isLoading={createCouponMutation.isPending || updateCouponMutation.isPending}
        error={couponFormError}
      />

      {/* Partner Details Modal */}
      <PartnerDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        partner={selectedPartnerForDetails}
        coupons={partnerCoupons}
        isLoadingCoupons={isCouponsLoading}
        onAddCoupon={handleOpenCreateCouponForPartner}
        onEditCoupon={handleOpenEditCoupon}
        onToggleCouponStatus={handleToggleCouponStatus}
        onDeleteCoupon={handleTriggerDeleteCoupon}
      />

      {/* Deletion Confirm Modal */}
      <ConfirmDeleteModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDeleteConfirm}
        title={deleteTarget?.type === 'partner' ? 'Excluir Parceiro' : 'Excluir Cupom Promocional'}
        description={
          deleteTarget?.type === 'partner'
            ? `Tem certeza que deseja excluir permanentemente o parceiro "${deleteTarget?.name}"? Isso removerá o parceiro da base de dados e impedirá que seus cupons sejam consultados ou aplicados.`
            : `Tem certeza que deseja desativar ou excluir permanentemente o código de cupom "${deleteTarget?.name}"? Esta ação removerá a possibilidade de novos tenants utilizarem o desconto.`
        }
        isLoading={deletePartnerMutation.isPending || deleteCouponMutation.isPending}
      />
    </div>
  );
};

export default PartnersPage;
