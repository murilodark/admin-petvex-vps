import React, { useState, useEffect } from 'react';
import { PlusCircle, ShieldAlert, CheckCircle, Trash2, CreditCard, Sparkles, ArrowUpRight } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { PlansFilters } from '../components/PlansFilters';
import { PlansGrid } from '../components/PlansGrid';
import { PlanFormModal } from '../components/PlanFormModal';
import { plansService, ListarPlansResult } from '../services/plans.service';
import { Plan, PlanFormData, CapabilityCatalogData } from '../types/plans.types';

export const PlansPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [catalog, setCatalog] = useState<CapabilityCatalogData | undefined>(undefined);

  const [dataResult, setDataResult] = useState<ListarPlansResult>({
    data: [],
    total: 0,
    page: 1,
    perPage: 10,
    lastPage: 1,
  });

  // Query parameters States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [page, setPage] = useState(1);

  // Layout view style: Default to 'grid' to showcase clean pricing cards
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Form modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Delete Prompt verification modal state
  const [deleteTarget, setDeleteTarget] = useState<Plan | null>(null);

  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Fetch catalog on mount
  useEffect(() => {
    let active = true;
    plansService
      .obterCatalogoCapabilities()
      .then((catData) => {
        if (active) setCatalog(catData);
      })
      .catch((err) => {
        console.error('Error fetching catalog in page:', err);
      });
    return () => {
      active = false;
    };
  }, []);

  const loadPlans = async (searchVal = search) => {
    setLoading(true);
    try {
      const result = await plansService.listarPlanos({
        page,
        status,
        search: searchVal,
      });
      setDataResult(result);
    } catch (err) {
      console.error('Error loading plans:', err);
      triggerToast('Falha ao sincronizar lista de planos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Debounced search trigger
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Combined query loop
  useEffect(() => {
    let active = true;
    const fetchList = async () => {
      setLoading(true);
      try {
        const result = await plansService.listarPlanos({
          page,
          status,
          search: debouncedSearch,
        });
        if (active) {
          setDataResult(result);
        }
      } catch (err) {
        console.error('Error in combined effect:', err);
        if (active) {
          triggerToast('Falha ao sincronizar lista de planos.', 'error');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchList();
    return () => {
      active = false;
    };
  }, [page, status, debouncedSearch]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusChange = (val: string) => {
    setStatus(val);
    setPage(1);
  };

  // Actions
  const handleOpenCreateModal = () => {
    setSelectedPlan(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (plan: Plan) => {
    try {
      if (plan.is_active) {
        await plansService.desativarPlano(plan.id);
        triggerToast(`O plano "${plan.name}" foi desativado das ofertas comerciais.`, 'info');
      } else {
        await plansService.ativarPlano(plan.id);
        triggerToast(`O plano "${plan.name}" foi ativado com sucesso!`, 'success');
      }
      loadPlans(debouncedSearch);
    } catch (e) {
      console.error('Error toggling plan status:', e);
      triggerToast('Não foi possível alterar o status do plano.', 'error');
    }
  };

  const handleDeletePrompt = (plan: Plan) => {
    setDeleteTarget(plan);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await plansService.excluirPlano(deleteTarget.id);
      triggerToast(`Plano "${deleteTarget.name}" removido permanentemente da base.`, 'success');
      setDeleteTarget(null);

      if (dataResult.data.length <= 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadPlans(debouncedSearch);
      }
    } catch (err) {
      console.error('Error deleting plan:', err);
      triggerToast('Inabilidade técnica ao excluir plano devido a vínculos.', 'error');
    }
  };

  const handleFormSubmit = async (formData: PlanFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedPlan) {
        // Edit Mode
        await plansService.atualizarPlano(selectedPlan.id, formData, catalog);
        triggerToast(`Configurações do plano "${formData.name}" gravadas com sucesso!`, 'success');
      } else {
        // Create Mode
        await plansService.cadastrarPlano(formData, catalog);
        triggerToast(`O plano "${formData.name}" foi configurado e adicionado à grade SaaS!`, 'success');
      }
      setIsModalOpen(false);
      loadPlans(debouncedSearch);
    } catch (err) {
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // Stats summaries
  const totalPlansCount = dataResult.total || 0;
  const activePlansCount = dataResult.data.filter((p) => !!p.is_active).length || 0;

  const rawData = dataResult.data;
  const averagePrice =
    rawData.length > 0 ? rawData.reduce((acc, curr) => acc + (curr.monthly_price || 0), 0) / rawData.length : 0;

  return (
    <div className="space-y-6" id="plans-page-container">
      {/* Toast Feedback Panel */}
      {toastMessage ? (
        <div
          className={`p-4 border rounded-[4px] text-xs flex gap-3 items-start animate-fade-in fixed top-4 right-4 z-[9999] shadow-2xl max-w-md ${
            toastMessage.type === 'success'
              ? 'bg-teal-50 border-teal-200 text-teal-800 animate-slide-in'
              : toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-slate-50 border-slate-200 text-slate-800'
          }`}
          id="global-toast-indicator"
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-extrabold uppercase tracking-wide text-[10px] m-0 leading-none">Global Admin SaaS</p>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-normal">{toastMessage.text}</p>
          </div>
        </div>
      ) : null}

      {/* Main Title Toolbar */}
      <div
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-[4px]"
        id="plans-module-toolbar"
      >
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 rounded-[4px] border border-teal-100 flex items-center justify-center shrink-0">
              <CreditCard className="h-4.5 w-4.5 text-teal-600" />
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              GERENCIAMENTO DE PLANOS E PRECIFICAÇÃO
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-1.5 pl-9">
            Defina planos comerciais, limites operacionais, valores de faturamento e ofertas de mercado do ecossistema
            Petvex
          </p>
        </div>

        <Button
          id="btn-trigger-new-plan"
          variant="primary"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 text-xs font-bold w-full sm:w-auto shrink-0 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          NOVO PLANO COMERCIAL
        </Button>
      </div>

      {/* Stats Widgets Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="plans-numerical-stats-panel">
        <div className="bg-white border border-slate-200 rounded-[4px] p-5 flex flex-col justify-between shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
              PLANOS CADASTRADOS
            </span>
            <div className="w-6 h-6 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 text-xs">
              #
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 leading-none">{totalPlansCount}</span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase mt-1 font-mono">
              MODELOS CONFIGURADOS
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[4px] p-5 flex flex-col justify-between shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
              OFERTAS EM ATIVIDADE
            </span>
            <div className="w-6 h-6 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-500 text-xs">
              ●
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 leading-none">{activePlansCount}</span>
            <span className="block text-[9px] text-teal-600 font-bold uppercase mt-1 font-mono">
              DISPONÍVEL P/ ASSINATURAS
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-[4px] p-5 flex flex-col justify-between shadow-xs text-left">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase tracking-widest">
              TICKET SAAS MÉDIO
            </span>
            <span className="text-[9px] font-black uppercase text-indigo-500 bg-indigo-50 px-1 border border-indigo-100 rounded">
              R$
            </span>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-slate-900 leading-none">
              {
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
                  .format(averagePrice)
                  .split(',')[0]
              }
            </span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase mt-1 font-mono font-bold">
              VALOR MENSAL MÉDIO
            </span>
          </div>
        </div>

        <div className="bg-slate-900 text-slate-100 rounded-[4px] p-5 flex flex-col justify-between border border-slate-950 relative overflow-hidden text-left">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <Sparkles className="w-24 h-24 text-teal-500" />
          </div>
          <div className="flex items-center justify-between relative z-1">
            <span className="text-[9px] font-mono font-black text-teal-400 uppercase tracking-widest font-bold">
              COMPLIANCE DE RECEITA
            </span>
            <Sparkles className="h-4 w-4 text-teal-400" />
          </div>
          <div className="mt-3 relative z-1">
            <span className="text-xs font-black uppercase tracking-wider text-slate-200 flex items-center gap-1">
              Petvex Checkout <ArrowUpRight className="h-3.5 w-3.5 text-teal-400" />
            </span>
            <span className="block text-[9px] text-slate-400 font-bold uppercase mt-0.5 font-mono">
              PREÇOS SINCRONIZADOS
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <PlansFilters
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Grid Content / Table Container */}
      <PlansGrid
        plans={dataResult.data}
        catalog={catalog}
        loading={loading}
        viewMode={viewMode}
        onEdit={handleOpenEditModal}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeletePrompt}
        page={dataResult.page}
        lastPage={dataResult.lastPage}
        total={dataResult.total}
        perPage={dataResult.perPage}
        onPageChange={setPage}
      />

      {/* Plan Registration/edition Modal */}
      <PlanFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        plan={selectedPlan}
        catalogData={catalog}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Confirmation Modal for Deletes */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-fade-in" id="delete-plan-modal">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setDeleteTarget(null)} />

          <div className="relative bg-white border border-slate-250 rounded-[4px] shadow-2xl p-6 w-full max-w-md z-10 animate-scale-up text-left">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center shrink-0 mt-0.5 animate-bounce">
                <Trash2 className="h-5 w-5 text-rose-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                  Remover Plano de Oferta
                </h4>
                <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                  Tem certeza que deseja excluir permanentemente o modelo{' '}
                  <strong className="text-slate-900">{deleteTarget.name}</strong>? Esta operação removerá a licença das
                  tabelas de contratação pública.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-slate-100">
              <Button id="btn-cancel-delete" type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
                CANCELAR
              </Button>
              <Button
                id="btn-confirm-delete"
                type="button"
                variant="danger"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs cursor-pointer"
                onClick={handleDeleteConfirm}
              >
                EXCLUIR PLANO PERMANENTEMENTE
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
export default PlansPage;
