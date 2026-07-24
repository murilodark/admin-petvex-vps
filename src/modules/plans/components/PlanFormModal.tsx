import React, { useState, useEffect } from 'react';
import { X, Info, Settings, DollarSign, Shield, ToggleLeft, Loader2, AlertCircle } from 'lucide-react';
import { Plan, PlanFormData, CapabilityCatalogData } from '../types/plans.types';
import { planFormSchema } from '../schemas/plans.schema';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { plansService } from '../services/plans.service';
import { extractSelectionsFromPlan } from '../mappers/plans.mapper';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan;
  catalogData?: CapabilityCatalogData;
  onSubmit: (formData: PlanFormData) => Promise<void>;
  isSubmitting: boolean;
}

type FormTab = 'general' | 'pricing' | 'modules' | 'limits';

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  isOpen,
  onClose,
  plan,
  catalogData: initialCatalog,
  onSubmit,
  isSubmitting,
}) => {
  const [activeTab, setActiveTab] = useState<FormTab>('general');
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Loaded Catalog Data
  const [catalog, setCatalog] = useState<CapabilityCatalogData>(
    initialCatalog || { modules: [], features: [], capabilities: [], limits: [] }
  );

  // Identification fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [badge, setBadge] = useState('');
  const [color, setColor] = useState('#10b981');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');

  // Pricing & Trial fields
  const [monthlyPrice, setMonthlyPrice] = useState('0');
  const [yearlyPrice, setYearlyPrice] = useState('0');
  const [yearlyDiscountPercent, setYearlyDiscountPercent] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [hasTrial, setHasTrial] = useState(false);
  const [trialDays, setTrialDays] = useState('');
  const [isActive, setIsActive] = useState(true);

  // Selections
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [selectedCapabilities, setSelectedCapabilities] = useState<string[]>([]);
  const [limitsMap, setLimitsMap] = useState<Record<string, number | null>>({});

  // Validation messages
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const loadData = async () => {
    setLoadingData(true);
    setFetchError(null);
    try {
      // 1. Fetch capability catalog if not available
      let currentCatalog = initialCatalog;
      if (!currentCatalog || currentCatalog.limits.length === 0) {
        currentCatalog = await plansService.obterCatalogoCapabilities();
        setCatalog(currentCatalog);
      } else {
        setCatalog(currentCatalog);
      }

      // 2. Fetch full plan details if editing
      let detail: Plan | null = null;
      if (plan && plan.id) {
        detail = await plansService.buscarPlanoPorId(plan.id);
      }

      if (detail) {
        setName(detail.name || '');
        setSlug(detail.slug || '');
        setBadge(detail.badge || '');
        setColor(detail.color || '#10b981');
        setShortDescription(detail.short_description || '');
        setDescription(detail.description || '');
        setDisplayOrder(detail.display_order != null ? detail.display_order.toString() : '0');

        setMonthlyPrice(detail.monthly_price != null ? detail.monthly_price.toString() : '0');
        setYearlyPrice(detail.yearly_price != null ? detail.yearly_price.toString() : '0');
        setYearlyDiscountPercent(
          detail.yearly_discount_percent != null ? detail.yearly_discount_percent.toString() : ''
        );
        setIsFeatured(!!detail.is_featured);
        setHasTrial(!!detail.has_trial);
        setTrialDays(detail.trial_days != null ? detail.trial_days.toString() : '');
        setIsActive(detail.is_active !== undefined ? !!detail.is_active : true);

        // Hydrate selections using the catalog parser
        const extracted = extractSelectionsFromPlan(detail, currentCatalog);
        setSelectedModules(extracted.selectedModules);
        setSelectedFeatures(extracted.selectedFeatures);
        setSelectedCapabilities(extracted.selectedCapabilities);
        setLimitsMap(extracted.limitsMap);
      } else {
        // Default clean state for create mode
        setName('');
        setSlug('');
        setBadge('');
        setColor('#10b981');
        setShortDescription('');
        setDescription('');
        setDisplayOrder('0');

        setMonthlyPrice('0');
        setYearlyPrice('0');
        setYearlyDiscountPercent('');
        setIsFeatured(false);
        setHasTrial(false);
        setTrialDays('');
        setIsActive(true);

        setSelectedModules([]);
        setSelectedFeatures([]);
        setSelectedCapabilities([]);

        const initialLimits: Record<string, number | null> = {};
        if (currentCatalog?.limits) {
          currentCatalog.limits.forEach((def) => {
            initialLimits[def.key] = null;
          });
        }
        setLimitsMap(initialLimits);
      }

      setErrors({});
      setSubmitError(null);
      setActiveTab('general');
    } catch (err: any) {
      console.error('Error loading modal data:', err);
      setFetchError(
        err?.response?.data?.message || err?.message || 'Não foi possível consultar os dados do plano e catálogo.'
      );
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, plan?.id]);

  if (!isOpen) return null;

  // Toggle module selection
  const handleToggleModule = (moduleKey: string) => {
    if (selectedModules.includes(moduleKey)) {
      // Remove module and any features belonging to this module
      setSelectedModules((prev) => prev.filter((m) => m !== moduleKey));
      const moduleFeatures = catalog.features.filter((f) => f.module === moduleKey).map((f) => f.key);
      setSelectedFeatures((prev) => prev.filter((fKey) => !moduleFeatures.includes(fKey)));
    } else {
      setSelectedModules((prev) => [...prev, moduleKey]);
    }
  };

  // Toggle feature selection
  const handleToggleFeature = (featureKey: string) => {
    const featureDef = catalog.features.find((f) => f.key === featureKey);
    if (selectedFeatures.includes(featureKey)) {
      setSelectedFeatures((prev) => prev.filter((f) => f !== featureKey));
    } else {
      // Add feature
      const newFeatures = new Set([...selectedFeatures, featureKey]);
      // Auto-add feature dependencies
      if (featureDef?.dependencies && Array.isArray(featureDef.dependencies)) {
        featureDef.dependencies.forEach((dep) => newFeatures.add(dep));
      }
      setSelectedFeatures(Array.from(newFeatures));

      // Auto-enable parent module if present
      if (featureDef?.module && !selectedModules.includes(featureDef.module)) {
        setSelectedModules((prev) => [...prev, featureDef.module]);
      }
    }
  };

  // Toggle capability selection
  const handleToggleCapability = (capabilityKey: string) => {
    const capDef = catalog.capabilities.find((c) => c.key === capabilityKey);
    if (selectedCapabilities.includes(capabilityKey)) {
      setSelectedCapabilities((prev) => prev.filter((c) => c !== capabilityKey));
    } else {
      const newCaps = new Set([...selectedCapabilities, capabilityKey]);
      if (capDef?.dependencies && Array.isArray(capDef.dependencies)) {
        capDef.dependencies.forEach((dep) => newCaps.add(dep));
      }
      setSelectedCapabilities(Array.from(newCaps));
    }
  };

  // Limit value change handler
  const handleLimitChange = (key: string, valStr: string) => {
    const trimmed = valStr.trim();
    setLimitsMap((prev) => {
      if (trimmed === '') {
        return { ...prev, [key]: null };
      }
      const num = parseInt(trimmed, 10);
      return { ...prev, [key]: isNaN(num) ? null : num };
    });
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);

    const formDataPayload: PlanFormData = {
      name: name.trim(),
      slug: slug.trim() || undefined,
      short_description: shortDescription.trim() || undefined,
      description: description.trim() || undefined,
      monthly_price: parseFloat(monthlyPrice) || 0,
      yearly_price: parseFloat(yearlyPrice) || 0,
      yearly_discount_percent: yearlyDiscountPercent ? parseFloat(yearlyDiscountPercent) : null,
      is_featured: isFeatured,
      has_trial: hasTrial,
      trial_days: trialDays ? parseInt(trialDays, 10) : null,
      display_order: displayOrder ? parseInt(displayOrder, 10) : 0,
      badge: badge.trim() || undefined,
      color: color.trim() || undefined,
      is_active: isActive,
      modules: selectedModules,
      features: selectedFeatures,
      capabilities: selectedCapabilities,
      limits: limitsMap,
    };

    const validation = planFormSchema.safeParse(formDataPayload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      const tabsWithErrors = new Set<string>();

      validation.error.issues.forEach((err) => {
        const pathStr = err.path[0]?.toString() || '';
        fieldErrors[pathStr] = err.message;

        if (['name', 'slug', 'short_description', 'description', 'badge', 'color', 'display_order'].includes(pathStr)) {
          tabsWithErrors.add('general');
        } else if (['monthly_price', 'yearly_price', 'yearly_discount_percent', 'trial_days'].includes(pathStr)) {
          tabsWithErrors.add('pricing');
        } else if (pathStr.startsWith('limits')) {
          tabsWithErrors.add('limits');
        }
      });

      setErrors(fieldErrors);

      if (tabsWithErrors.has('general')) setActiveTab('general');
      else if (tabsWithErrors.has('pricing')) setActiveTab('pricing');
      else if (tabsWithErrors.has('limits')) setActiveTab('limits');

      return;
    }

    try {
      await onSubmit(formDataPayload);
    } catch (err: any) {
      console.error('Submit plan error:', err);
      if (err.response?.status === 422 && err.response?.data?.errors) {
        const apiFields: Record<string, string> = {};
        Object.entries(err.response.data.errors).forEach(([key, value]) => {
          if (Array.isArray(value) && value.length > 0) {
            apiFields[key] = value[0];
          }
        });
        setErrors(apiFields);
        setActiveTab('general');
      } else {
        setSubmitError(
          err.response?.data?.message || err.message || 'Falha ao registrar configurações do plano.'
        );
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
      id="plan-form-modal-overlay"
    >
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      <div
        className="relative bg-white border border-slate-200 rounded-[4px] shadow-2xl w-full max-w-4xl overflow-hidden z-10 animate-scale-up flex flex-col max-h-[90vh]"
        id="plan-form-modal-container"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              {plan ? 'EDITAR PLANO COMERCIAL' : 'CADASTRAR PLANO COMERCIAL'}
            </h3>
            <span className="text-[9px] font-mono font-black uppercase text-slate-400">
              {plan ? `ID DO PLANO: #${plan.id}` : 'DEFINIR NOVO PLANO SAAS, PREÇOS E LIMITES'}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-[4px] text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            id="btn-close-plan-modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 pt-1 shrink-0 overflow-x-auto" id="form-tab-headers">
          <button
            type="button"
            className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 font-mono flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab('general')}
          >
            <Settings className="h-4 w-4" />
            IDENTIFICAÇÃO
          </button>

          <button
            type="button"
            className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 font-mono flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'pricing'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab('pricing')}
          >
            <DollarSign className="h-4 w-4" />
            PREÇO & TRIAL
          </button>

          <button
            type="button"
            className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 font-mono flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'modules'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab('modules')}
          >
            <ToggleLeft className="h-4 w-4" />
            MÓDULOS & RECURSOS ({selectedModules.length + selectedFeatures.length})
          </button>

          <button
            type="button"
            className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 font-mono flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeTab === 'limits'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab('limits')}
          >
            <Shield className="h-4 w-4" />
            LIMITES DE USO ({Object.values(limitsMap).filter((v) => v !== null).length})
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden" id="plan-form">
          <div className="px-6 py-5 overflow-y-auto space-y-5 flex-1 text-left">
            {/* Loading Skeleton */}
            {loadingData ? (
              <div className="py-16 text-center flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 text-teal-600 animate-spin" />
                <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Sincronizando catálogo de funcionalidades e parâmetros do plano...
                </span>
              </div>
            ) : fetchError ? (
              <div className="p-6 bg-rose-50 border border-rose-200 rounded text-center space-y-3">
                <AlertCircle className="h-8 w-8 text-rose-600 mx-auto" />
                <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">{fetchError}</p>
                <Button type="button" variant="outline" size="sm" onClick={loadData}>
                  Tentar Carregar Novamente
                </Button>
              </div>
            ) : (
              <>
                {/* Global API submission error alert */}
                {submitError ? (
                  <div className="p-3.5 bg-rose-50 border border-rose-150 text-rose-800 rounded-[4px] text-xs font-semibold flex gap-2 animate-fade-in">
                    <Info className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                    <span>{submitError}</span>
                  </div>
                ) : null}

                {/* TAB 1: IDENTIFICATION */}
                {activeTab === 'general' && (
                  <div className="space-y-4 animate-fade-in" id="tab-general-content">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        id="plan-name-input"
                        name="name"
                        label="Nome Comercial *"
                        placeholder="Ex: Plano Intermediário"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        error={errors.name}
                        required
                      />

                      <Input
                        id="plan-slug-input"
                        name="slug"
                        label="Slug Identificador (Opcional)"
                        placeholder="ex: plano-intermediario"
                        value={slug}
                        onChange={(e) => setSlug(e.target.value)}
                        error={errors.slug}
                      />

                      <Input
                        id="plan-badge-input"
                        name="badge"
                        label="Texto de Selo (Badge - Opcional)"
                        placeholder="Ex: Mais Vendido, Profissional"
                        value={badge}
                        onChange={(e) => setBadge(e.target.value)}
                        error={errors.badge}
                      />

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Cor de Destaque (Hex)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="p-0.5 h-10 w-12 border border-slate-200 rounded cursor-pointer"
                            id="plan-color-picker"
                          />
                          <input
                            type="text"
                            placeholder="#10b981"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="flex-1 px-3.5 py-2.5 border rounded-[4px] text-xs bg-white text-slate-900 border-slate-200 focus:outline-none"
                            id="plan-color-text"
                          />
                        </div>
                        {errors.color ? <span className="text-xs text-rose-600 mt-0.5 block">{errors.color}</span> : null}
                      </div>

                      <Input
                        id="plan-display-order-input"
                        name="display_order"
                        label="Ordem de Exibição na Grade *"
                        type="number"
                        value={displayOrder}
                        onChange={(e) => setDisplayOrder(e.target.value)}
                        error={errors.display_order}
                        required
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Linha de Argumentação Comercial (Descrição Curta)
                      </label>
                      <input
                        type="text"
                        id="plan-short-description-input"
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Ex: Ideal para clínicas veterinárias em crescimento e petshops com médio volume."
                        value={shortDescription}
                        onChange={(e) => setShortDescription(e.target.value)}
                      />
                      {errors.short_description ? (
                        <span className="text-xs text-rose-600 block">{errors.short_description}</span>
                      ) : null}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Descrição Longa do Produto
                      </label>
                      <textarea
                        id="plan-description-textarea"
                        rows={3}
                        className="w-full px-3.5 py-2.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Descreva detalhadamente a proposta do plano..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                      />
                      {errors.description ? (
                        <span className="text-xs text-rose-600 block">{errors.description}</span>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* TAB 2: PRICING & TRIAL */}
                {activeTab === 'pricing' && (
                  <div className="space-y-4 animate-fade-in" id="tab-pricing-content">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Monthly Price */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Preço Mensal (BRL) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-bold">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            id="plan-monthly-price"
                            className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={monthlyPrice}
                            onChange={(e) => setMonthlyPrice(e.target.value)}
                            required
                          />
                        </div>
                        {errors.monthly_price ? (
                          <span className="text-xs text-rose-600 block">{errors.monthly_price}</span>
                        ) : null}
                      </div>

                      {/* Yearly Price */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Preço Anual (BRL) *
                        </label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-3 text-xs text-slate-400 font-bold">R$</span>
                          <input
                            type="number"
                            step="0.01"
                            id="plan-yearly-price"
                            className="w-full pl-9 pr-3.5 py-2.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                            value={yearlyPrice}
                            onChange={(e) => setYearlyPrice(e.target.value)}
                            required
                          />
                        </div>
                        {errors.yearly_price ? (
                          <span className="text-xs text-rose-600 block">{errors.yearly_price}</span>
                        ) : null}
                      </div>

                      {/* Yearly Discount % */}
                      <Input
                        id="plan-yearly-discount"
                        name="yearly_discount_percent"
                        label="Desconto de Assinatura Anual (%)"
                        type="number"
                        placeholder="Ex: 15"
                        value={yearlyDiscountPercent}
                        onChange={(e) => setYearlyDiscountPercent(e.target.value)}
                        error={errors.yearly_discount_percent}
                      />

                      {/* Free Trial Switch */}
                      <div className="flex flex-col justify-center space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Habilitar Teste Grátis (Free Trial)?
                        </label>
                        <div className="flex items-center gap-2 h-10">
                          <input
                            type="checkbox"
                            id="plan-has-trial-checkbox"
                            checked={hasTrial}
                            onChange={(e) => setHasTrial(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <span className="text-xs text-slate-700 font-bold">Sim, propagar período de teste</span>
                        </div>
                      </div>

                      {/* Free Trial Days */}
                      {hasTrial ? (
                        <Input
                          id="plan-trial-days-input"
                          name="trial_days"
                          label="Dias de Carência / Trial Gratuito"
                          type="number"
                          placeholder="Ex: 7, 14, 30"
                          value={trialDays}
                          onChange={(e) => setTrialDays(e.target.value)}
                          error={errors.trial_days}
                        />
                      ) : null}

                      {/* Featured Checkbox */}
                      <div className="flex flex-col justify-center space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Destacar Plano na Vitrine?
                        </label>
                        <div className="flex items-center gap-2 h-10">
                          <input
                            type="checkbox"
                            id="plan-is-featured-checkbox"
                            checked={isFeatured}
                            onChange={(e) => setIsFeatured(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <span className="text-xs text-slate-700 font-bold">Sim, exibir destaque na tabela</span>
                        </div>
                      </div>

                      {/* Active Status */}
                      <div className="flex flex-col justify-center space-y-1.5 sm:col-span-2 border-t border-slate-100 pt-3">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Status do Plano
                        </label>
                        <div className="flex items-center gap-2 h-10">
                          <input
                            type="checkbox"
                            id="plan-is-active-checkbox"
                            checked={isActive}
                            onChange={(e) => setIsActive(e.target.checked)}
                            className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                          />
                          <span className="text-xs text-slate-700 font-bold">
                            Ativo e disponível para novas contratações
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: MODULES & FEATURES & CAPABILITIES */}
                {activeTab === 'modules' && (
                  <div className="space-y-6 animate-fade-in" id="tab-modules-content">
                    {/* Modules Section */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2">
                        Módulos do Sistema
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Selecione os módulos estruturais liberados neste plano.
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {catalog.modules.map((mod) => {
                          const isSelected = selectedModules.includes(mod.key);
                          return (
                            <div
                              key={mod.key}
                              onClick={() => handleToggleModule(mod.key)}
                              className={`p-3 border rounded-[4px] cursor-pointer flex flex-col justify-between transition-all ${
                                isSelected
                                  ? 'bg-teal-50/60 border-teal-500 text-teal-950 font-bold'
                                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <span className="text-xs font-extrabold">{mod.name}</span>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  className="h-4 w-4 text-teal-600 rounded border-slate-300"
                                />
                              </div>
                              {mod.description && (
                                <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{mod.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Features Section (Grouped by Module) */}
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2">
                        Funcionalidades (Features)
                      </h4>
                      <p className="text-[11px] text-slate-500 mb-3">
                        Ative ou desative funcionalidades específicas. Ao selecionar uma funcionalidade, o módulo pai será ativado automaticamente.
                      </p>
                      <div className="space-y-4">
                        {catalog.modules.map((mod) => {
                          const modFeatures = catalog.features.filter((f) => f.module === mod.key);
                          if (modFeatures.length === 0) return null;
                          const isModuleActive = selectedModules.includes(mod.key);

                          return (
                            <div key={mod.key} className="border border-slate-200 rounded-[4px] p-3.5 bg-slate-50/50">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-800">
                                  {mod.name}
                                </span>
                                {!isModuleActive && (
                                  <span className="text-[9px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    Módulo Pai Desabilitado
                                  </span>
                                )}
                              </div>
                              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                                {modFeatures.map((feat) => {
                                  const isFeatSelected = selectedFeatures.includes(feat.key);
                                  return (
                                    <div
                                      key={feat.key}
                                      onClick={() => handleToggleFeature(feat.key)}
                                      className={`p-2.5 border rounded-[4px] cursor-pointer flex flex-col justify-between transition-all ${
                                        isFeatSelected
                                          ? 'bg-teal-50 border-teal-500 text-teal-900'
                                          : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                      }`}
                                    >
                                      <div className="flex items-start justify-between gap-1">
                                        <span className="text-[11px] font-bold">{feat.name}</span>
                                        <input
                                          type="checkbox"
                                          checked={isFeatSelected}
                                          onChange={() => {}}
                                          className="h-3.5 w-3.5 text-teal-600 rounded border-slate-300"
                                        />
                                      </div>
                                      {feat.description && (
                                        <p className="text-[9px] text-slate-500 mt-1 line-clamp-2">{feat.description}</p>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Capabilities Section */}
                    {catalog.capabilities.length > 0 && (
                      <div>
                        <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider mb-2">
                          Capabilities Adicionais
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                          {catalog.capabilities.map((cap) => {
                            const isCapSelected = selectedCapabilities.includes(cap.key);
                            return (
                              <div
                                key={cap.key}
                                onClick={() => handleToggleCapability(cap.key)}
                                className={`p-2.5 border rounded-[4px] cursor-pointer flex flex-col justify-between transition-all ${
                                  isCapSelected
                                    ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-1">
                                  <span className="text-[11px] font-bold">{cap.name}</span>
                                  <input
                                    type="checkbox"
                                    checked={isCapSelected}
                                    onChange={() => {}}
                                    className="h-3.5 w-3.5 text-teal-600 rounded border-slate-300"
                                  />
                                </div>
                                {cap.description && (
                                  <p className="text-[9px] text-slate-500 mt-1 line-clamp-2">{cap.description}</p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: USAGE LIMITS */}
                {activeTab === 'limits' && (
                  <div className="space-y-4 animate-fade-in" id="tab-limits-content">
                    <div className="p-3 bg-teal-50 border border-teal-200 text-teal-900 rounded text-[11px] font-semibold flex items-center gap-2">
                      <Info className="h-4 w-4 text-teal-600 shrink-0" />
                      <span>
                        Deixe o campo vazio para definir o limite como ilimitado. Use 0 para bloquear o recurso.
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {catalog.limits.map((limitDef) => {
                        const currentVal = limitsMap[limitDef.key];
                        const inputValue =
                          currentVal === null || currentVal === undefined ? '' : currentVal.toString();

                        return (
                          <div key={limitDef.key} className="space-y-1">
                            <div className="flex items-center justify-between">
                              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                                {limitDef.name}
                              </label>
                              <span className="text-[9px] font-mono font-bold text-slate-400">
                                ({limitDef.unit})
                              </span>
                            </div>
                            <input
                              type="number"
                              min="0"
                              id={`limit-input-${limitDef.key}`}
                              className="w-full px-3.5 py-2.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                              placeholder="Ilimitado"
                              value={inputValue}
                              onChange={(e) => handleLimitChange(limitDef.key, e.target.value)}
                            />
                            {limitDef.description && (
                              <p className="text-[9px] text-slate-400">{limitDef.description}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
            {Object.keys(errors).length > 0 ? (
              <span className="text-[10px] text-rose-600 font-extrabold uppercase font-mono tracking-wider animate-pulse flex items-center gap-1">
                <Info className="h-4 w-4 shrink-0" />
                DADOS INCOMPATÍVEIS ({Object.keys(errors).length})
              </span>
            ) : (
              <span />
            )}

            <div className="flex items-center gap-2">
              <Button
                id="btn-cancel-plan-form"
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting || loadingData}
              >
                CANCELAR
              </Button>
              <Button
                id="btn-save-plan"
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
                disabled={loadingData || !!fetchError}
              >
                {plan ? 'SALVAR PARÂMETROS' : 'CADASTRAR PLANO'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanFormModal;
