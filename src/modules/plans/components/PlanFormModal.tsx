import React, { useState, useEffect } from 'react';
import { X, Info, Settings, DollarSign, Shield, ToggleLeft } from 'lucide-react';
import { Plan, PlanFormData } from '../types/plans.types';
import { planFormSchema } from '../schemas/plans.schema';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';

interface PlanFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan?: Plan;
  onSubmit: (formData: PlanFormData) => Promise<void>;
  isSubmitting: boolean;
}

const FEATURE_NAMES: Record<string, string> = {
  pdv: 'PDV / Caixa Integrado',
  reports: 'Relatórios de Métricas',
  boarding: 'Hospedagem & Hotelaria',
  grooming: 'Estética / Banho e Tosa',
  whatsapp: 'Notificações WhatsApp',
  financial: 'Financeiro Completo',
  inventory: 'Controle de Estoque',
  surgeries: 'Controle de Cirurgias',
  multi_user: 'Múltiplos Operadores',
  vaccination: 'Carteiras de Vacina',
  appointments: 'Agenda Inteligente',
  external_api: 'Acesso API Externa',
  integrations: 'Integrações Nativas',
  hospitalization: 'Internação e Leitos',
  advanced_dashboard: 'Dashboard SaaS',
};

type FormTab = 'general' | 'pricing' | 'limits' | 'features';

export const PlanFormModal: React.FC<PlanFormModalProps> = ({
  isOpen,
  onClose,
  plan,
  onSubmit,
  isSubmitting,
}) => {
  const [activeTab, setActiveTab] = useState<FormTab>('general');

  // Identificação states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [badge, setBadge] = useState('');
  const [color, setColor] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [displayOrder, setDisplayOrder] = useState('0');

  // Pricing states
  const [monthlyPrice, setMonthlyPrice] = useState('0');
  const [yearlyPrice, setYearlyPrice] = useState('0');
  const [yearlyDiscountPercent, setYearlyDiscountPercent] = useState('0');
  const [isFeatured, setIsFeatured] = useState(false);
  const [hasTrial, setHasTrial] = useState(false);
  const [trialDays, setTrialDays] = useState('0');
  const [isActive, setIsActive] = useState(true);

  // Limits states (nullable strings to allow clean empty database mappings)
  const [maxUsers, setMaxUsers] = useState('');
  const [maxClients, setMaxClients] = useState('');
  const [maxPets, setMaxPets] = useState('');
  const [maxAppointments, setMaxAppointments] = useState('');
  const [maxProducts, setMaxProducts] = useState('');
  const [maxServices, setMaxServices] = useState('');
  const [maxStockItems, setMaxStockItems] = useState('');
  const [maxDocuments, setMaxDocuments] = useState('');
  const [maxAttachments, setMaxAttachments] = useState('');
  const [maxStorageMb, setMaxStorageMb] = useState('');

  // Features Record
  const [features, setFeatures] = useState<Record<string, boolean>>({
    pdv: false,
    reports: false,
    boarding: false,
    grooming: false,
    whatsapp: false,
    financial: false,
    inventory: false,
    surgeries: false,
    multi_user: false,
    vaccination: false,
    appointments: false,
    external_api: false,
    integrations: false,
    hospitalization: false,
    advanced_dashboard: false,
  });

  // Validation messages
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      if (plan) {
        setName(plan.name || '');
        setSlug(plan.slug || '');
        setBadge(plan.badge || '');
        setColor(plan.color || '');
        setShortDescription(plan.short_description || '');
        setDescription(plan.description || '');
        setDisplayOrder(plan.display_order?.toString() || '0');

        setMonthlyPrice(plan.monthly_price?.toString() || '0');
        setYearlyPrice(plan.yearly_price?.toString() || '0');
        setYearlyDiscountPercent(plan.yearly_discount_percent?.toString() || '0');
        setIsFeatured(!!plan.is_featured);
        setHasTrial(!!plan.has_trial);
        setTrialDays(plan.trial_days?.toString() || '0');
        setIsActive(plan.is_active !== undefined ? !!plan.is_active : true);

        setMaxUsers(plan.max_users != null ? plan.max_users.toString() : '');
        setMaxClients(plan.max_clients != null ? plan.max_clients.toString() : '');
        setMaxPets(plan.max_pets != null ? plan.max_pets.toString() : '');
        setMaxAppointments(plan.max_appointments != null ? plan.max_appointments.toString() : '');
        setMaxProducts(plan.max_products != null ? plan.max_products.toString() : '');
        setMaxServices(plan.max_services != null ? plan.max_services.toString() : '');
        setMaxStockItems(plan.max_stock_items != null ? plan.max_stock_items.toString() : '');
        setMaxDocuments(plan.max_documents != null ? plan.max_documents.toString() : '');
        setMaxAttachments(plan.max_attachments != null ? plan.max_attachments.toString() : '');
        setMaxStorageMb(plan.max_storage_mb != null ? plan.max_storage_mb.toString() : '');

        setFeatures({
          pdv: !!plan.features?.pdv,
          reports: !!plan.features?.reports,
          boarding: !!plan.features?.boarding,
          grooming: !!plan.features?.grooming,
          whatsapp: !!plan.features?.whatsapp,
          financial: !!plan.features?.financial,
          inventory: !!plan.features?.inventory,
          surgeries: !!plan.features?.surgeries,
          multi_user: !!plan.features?.multi_user,
          vaccination: !!plan.features?.vaccination,
          appointments: !!plan.features?.appointments,
          external_api: !!plan.features?.external_api,
          integrations: !!plan.features?.integrations,
          hospitalization: !!plan.features?.hospitalization,
          advanced_dashboard: !!plan.features?.advanced_dashboard,
        });
      } else {
        setName('');
        setSlug('');
        setBadge('');
        setColor('#10b981');
        setShortDescription('');
        setDescription('');
        setDisplayOrder('0');

        setMonthlyPrice('0');
        setYearlyPrice('0');
        setYearlyDiscountPercent('0');
        setIsFeatured(false);
        setHasTrial(false);
        setTrialDays('0');
        setIsActive(true);

        setMaxUsers('');
        setMaxClients('');
        setMaxPets('');
        setMaxAppointments('');
        setMaxProducts('');
        setMaxServices('');
        setMaxStockItems('');
        setMaxDocuments('');
        setMaxAttachments('');
        setMaxStorageMb('');

        setFeatures({
          pdv: false,
          reports: false,
          boarding: false,
          grooming: false,
          whatsapp: false,
          financial: false,
          inventory: false,
          surgeries: false,
          multi_user: false,
          vaccination: false,
          appointments: false,
          external_api: false,
          integrations: false,
          hospitalization: false,
          advanced_dashboard: false,
        });
      }
      setErrors({});
      setSubmitError(null);
      setActiveTab('general');
    }
  }, [plan, isOpen]);

  if (!isOpen) return null;

  const toggleFeature = (key: string) => {
    setFeatures(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSubmitError(null);

    // Prepare payload parsing numbers and mapping empty strings to nulls
    const checkPayload = {
      name,
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
      max_users: maxUsers.trim() !== '' ? parseInt(maxUsers, 10) : null,
      max_clients: maxClients.trim() !== '' ? parseInt(maxClients, 10) : null,
      max_pets: maxPets.trim() !== '' ? parseInt(maxPets, 10) : null,
      max_appointments: maxAppointments.trim() !== '' ? parseInt(maxAppointments, 10) : null,
      max_products: maxProducts.trim() !== '' ? parseInt(maxProducts, 10) : null,
      max_services: maxServices.trim() !== '' ? parseInt(maxServices, 10) : null,
      max_stock_items: maxStockItems.trim() !== '' ? parseInt(maxStockItems, 10) : null,
      max_documents: maxDocuments.trim() !== '' ? parseInt(maxDocuments, 10) : null,
      max_attachments: maxAttachments.trim() !== '' ? parseInt(maxAttachments, 10) : null,
      max_storage_mb: maxStorageMb.trim() !== '' ? parseInt(maxStorageMb, 10) : null,
      features,
      is_active: isActive,
    };

    // Safe schema parsing first
    const validation = planFormSchema.safeParse(checkPayload);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      const tabsWithErrors = new Set<string>();

      validation.error.issues.forEach((err) => {
        const pathStr = err.path[0]?.toString() || '';
        fieldErrors[pathStr] = err.message;

        // Group which tabs hold these error paths to guide the operator
        if (['name', 'slug', 'short_description', 'description', 'badge', 'color', 'display_order'].includes(pathStr)) {
          tabsWithErrors.add('general');
        } else if (['monthly_price', 'yearly_price', 'yearly_discount_percent', 'trial_days'].includes(pathStr)) {
          tabsWithErrors.add('pricing');
        } else if (pathStr.startsWith('max_')) {
          tabsWithErrors.add('limits');
        }
      });

      setErrors(fieldErrors);

      // Force view into the first error-holding tab
      if (tabsWithErrors.has('general')) setActiveTab('general');
      else if (tabsWithErrors.has('pricing')) setActiveTab('pricing');
      else if (tabsWithErrors.has('limits')) setActiveTab('limits');
      
      return;
    }

    try {
      await onSubmit(checkPayload);
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
        setActiveTab('general'); // Fallback tab view for API error fields
      } else {
        setSubmitError(err.response?.data?.message || err.message || 'Falha ao registrar configurações do plano.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" id="plan-form-modal-overlay">
      {/* Backdrop background */}
      <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={onClose} />

      {/* Main Container Card */}
      <div className="relative bg-white border border-slate-200 rounded-[4px] shadow-2xl w-full max-w-3xl overflow-hidden z-10 animate-scale-up" id="plan-form-modal-container">
        
        {/* Top Header details */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50">
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

        {/* Tab Selection Toolbar */}
        <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 pt-1" id="form-tab-headers">
          <button
            type="button"
            className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 font-mono flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 font-mono flex items-center gap-1.5 cursor-pointer ${
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
            className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 font-mono flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'limits'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab('limits')}
          >
            <Shield className="h-4 w-4" />
            LIMITES DE USO
          </button>

          <button
            type="button"
            className={`px-4 py-3 text-[10px] font-black uppercase tracking-wider border-b-2 font-mono flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'features'
                ? 'border-teal-500 text-teal-600'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
            onClick={() => setActiveTab('features')}
          >
            <ToggleLeft className="h-4 w-4" />
            RECURSOS ({Object.values(features).filter(Boolean).length})
          </button>
        </div>

        {/* Form Body and Tab Contents */}
        <form onSubmit={handleFormSubmit} className="flex flex-col max-h-[75vh]" id="plan-form">
          <div className="px-6 py-5 overflow-y-auto space-y-5 flex-1 text-left">
            
            {/* Global API submission errors alerts */}
            {submitError ? (
              <div className="p-3.5 bg-rose-50 border border-rose-150 text-rose-800 rounded-[4px] text-xs font-semibold flex gap-2 animate-fade-in">
                <Info className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            ) : null}

            {/* TAB 1: GENERAL METADATA IDENTIFICATION */}
            {activeTab === 'general' && (
              <div className="space-y-4 animate-fade-in" id="tab-general-content">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    id="plan-name-input"
                    name="name"
                    label="Nome Comercial *"
                    placeholder="Ex: Prime Hospital"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    error={errors.name}
                    required
                  />

                  <Input
                    id="plan-slug-input"
                    name="slug"
                    label="Slug Identificador (Opcional)"
                    placeholder="ex: prime-hospital"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    error={errors.slug}
                  />

                  <Input
                    id="plan-badge-input"
                    name="badge"
                    label="Texto de Selo (Badge - Opcional)"
                    placeholder="Ex: Popular, Profissional"
                    value={badge}
                    onChange={(e) => setBadge(e.target.value)}
                    error={errors.badge}
                  />

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Cor de destaque (Hex ou Cor) *</label>
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
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Linha de Argumentação Comercial (Short Description)</label>
                  <input
                    type="text"
                    id="plan-short-description-input"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Ex: A decisão definitiva para controle integrador de grandes clínicas pet."
                    value={shortDescription}
                    onChange={(e) => setShortDescription(e.target.value)}
                  />
                  {errors.short_description ? <span className="text-xs text-rose-600 block">{errors.short_description}</span> : null}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Descrição longa do produto</label>
                  <textarea
                    id="plan-description-textarea"
                    rows={3}
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-[4px] text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Descreva detalhes específicos de licenciamento comercial e operacional..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  {errors.description ? <span className="text-xs text-rose-600 block">{errors.description}</span> : null}
                </div>
              </div>
            )}

            {/* TAB 2: BILLING, PRICING AND FREE TRIAL METRICS */}
            {activeTab === 'pricing' && (
              <div className="space-y-4 animate-fade-in" id="tab-pricing-content">
                <div className="grid grid-cols-2 gap-4">
                  
                  {/* Monthly price */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preço Mensal (BRL) *</label>
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
                    {errors.monthly_price ? <span className="text-xs text-rose-600 block">{errors.monthly_price}</span> : null}
                  </div>

                  {/* Yearly price */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Preço Anual (BRL) *</label>
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
                    {errors.yearly_price ? <span className="text-xs text-rose-600 block">{errors.yearly_price}</span> : null}
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

                  {/* Free Trial switch */}
                  <div className="flex flex-col justify-center space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Habilitar Teste Grátis (Free Trial)?</label>
                    <div className="flex items-center gap-2 h-10">
                      <input
                        type="checkbox"
                        id="plan-has-trial-checkbox"
                        checked={hasTrial}
                        onChange={(e) => setHasTrial(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 font-bold">Sim, propagar teste grátis</span>
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

                  {/* Featured element */}
                  <div className="flex flex-col justify-center space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Destacar plano na vitrine?</label>
                    <div className="flex items-center gap-2 h-10">
                      <input
                        type="checkbox"
                        id="plan-is-featured-checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 font-bold">Sim, exibir destaque especial</span>
                    </div>
                  </div>

                  {/* Active status */}
                  <div className="flex flex-col justify-center space-y-1.5 col-span-2 border-t border-slate-100 pt-3">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status Operacional do Plano</label>
                    <div className="flex items-center gap-2 h-10">
                      <input
                        type="checkbox"
                        id="plan-is-active-checkbox"
                        checked={isActive}
                        onChange={(e) => setIsActive(e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-slate-300 text-teal-600 focus:ring-teal-500 cursor-pointer"
                      />
                      <span className="text-xs text-slate-700 font-bold">Ativo e disponível na grade de vendas integrada</span>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* TAB 3: COMPLEX OPERATION THRESHOLD LIMIT CONTROL */}
            {activeTab === 'limits' && (
              <div className="space-y-4 animate-fade-in" id="tab-limits-content">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-400 font-mono uppercase tracking-wide">
                  Dica: Deixe os campos vazios (ou preencha com nada) para indicar limites ilimitados na API.
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  
                  <Input
                    id="limit-users"
                    name="max_users"
                    label="Máximo de Usuários Operadores"
                    type="number"
                    placeholder="Ilimitado"
                    value={maxUsers}
                    onChange={(e) => setMaxUsers(e.target.value)}
                    error={errors.max_users}
                  />

                  <Input
                    id="limit-clients"
                    name="max_clients"
                    label="Máximo de Clientes (Tutores)"
                    type="number"
                    placeholder="Ilimitado"
                    value={maxClients}
                    onChange={(e) => setMaxClients(e.target.value)}
                    error={errors.max_clients}
                  />

                  <Input
                    id="limit-pets"
                    name="max_pets"
                    label="Máximo de Pets (Pacientes)"
                    type="number"
                    placeholder="Ilimitado"
                    value={maxPets}
                    onChange={(e) => setMaxPets(e.target.value)}
                    error={errors.max_pets}
                  />

                  <Input
                    id="limit-appointments"
                    name="max_appointments"
                    label="Máximo de Consultas Agendadas"
                    type="number"
                    placeholder="Ilimitado"
                    value={maxAppointments}
                    onChange={(e) => setMaxAppointments(e.target.value)}
                    error={errors.max_appointments}
                  />

                  <Input
                    id="limit-products"
                    name="max_products"
                    label="Máximo de Produtos Cadastrados"
                    type="number"
                    placeholder="Ilimitado"
                    value={maxProducts}
                    onChange={(e) => setMaxProducts(e.target.value)}
                    error={errors.max_products}
                  />

                  <Input
                    id="limit-services"
                    name="max_services"
                    label="Máximo de Serviços Cadastrados"
                    type="number"
                    placeholder="Ilimitado"
                    value={maxServices}
                    onChange={(e) => setMaxServices(e.target.value)}
                    error={errors.max_services}
                  />

                  <Input
                    id="limit-stock"
                    name="max_stock_items"
                    label="Máximo de Itens no Estoque"
                    type="number"
                    placeholder="Ilimitado"
                    value={maxStockItems}
                    onChange={(e) => setMaxStockItems(e.target.value)}
                    error={errors.max_stock_items}
                  />

                  <Input
                    id="limit-documents"
                    name="max_documents"
                    label="Máximo de Documentos Gerados"
                    type="number"
                    placeholder="Ilimitado"
                    value={maxDocuments}
                    onChange={(e) => setMaxDocuments(e.target.value)}
                    error={errors.max_documents}
                  />

                  <Input
                    id="limit-attachments"
                    name="max_attachments"
                    label="Máximo de Anexos por Ficha"
                    type="number"
                    placeholder="Ilimitado"
                    value={maxAttachments}
                    onChange={(e) => setMaxAttachments(e.target.value)}
                    error={errors.max_attachments}
                  />

                  <Input
                    id="limit-storage"
                    name="max_storage_mb"
                    label="Espaço em Disco / Armazenamento (MB)"
                    type="number"
                    placeholder="Ilimitado"
                    value={maxStorageMb}
                    onChange={(e) => setMaxStorageMb(e.target.value)}
                    error={errors.max_storage_mb}
                  />

                </div>
              </div>
            )}

            {/* TAB 4: BINARY INTERACTIVE MODULE RESOURCE SWITCHES */}
            {activeTab === 'features' && (
              <div className="space-y-4 animate-fade-in" id="tab-features-content">
                <div className="p-3 bg-teal-50 border border-teal-200 text-teal-800 rounded text-[11px] uppercase tracking-wider font-mono font-bold">
                  Marque os recursos que estarão habilitados para uso integrado na conta do assinante:
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3.5" id="features-bool-switches-grid">
                  {Object.entries(FEATURE_NAMES).map(([key, label]) => (
                    <div 
                      key={key} 
                      onClick={() => toggleFeature(key)}
                      className={`p-3.5 border rounded-[4px] cursor-pointer flex flex-col justify-between select-none transition-all duration-200 ${
                        features[key]
                          ? 'bg-teal-50/55 border-teal-500 text-teal-950 shadow-xs scale-[1.01]' 
                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-350 hover:bg-slate-50/20'
                      }`}
                    >
                      <span className="text-[11px] font-bold leading-tight">{label}</span>
                      <div className="flex items-center justify-between mt-2.5">
                        <span className="text-[8px] font-mono tracking-widest font-black uppercase text-slate-400">{key}</span>
                        <div 
                          className={`w-6 h-3 rounded-full relative transition-colors ${
                            features[key] ? 'bg-teal-500' : 'bg-slate-300'
                          }`}
                        >
                          <div 
                            className={`w-2.5 h-2.5 bg-white rounded-full absolute top-[1px] transition-transform ${
                              features[key] ? 'translate-x-3' : 'translate-x-[1px]'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Bottom Toolbar Elements */}
          <div className="flex items-center justify-between px-6 py-4.5 border-t border-slate-100 bg-slate-50 shrink-0">
            {/* Warning indicator if there are Zod validation issues */}
            {Object.keys(errors).length > 0 ? (
              <span className="text-[10px] text-rose-600 font-extrabold uppercase font-mono tracking-wider animate-pulse flex items-center gap-1">
                <Info className="h-4 w-4 shrink-0" />
                DADOS INCOMPATÍVEIS NO FORMULÁRIO ({Object.keys(errors).length})
              </span>
            ) : <span />}

            <div className="flex items-center gap-2">
              <Button
                id="btn-cancel-plan-form"
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                CANCELAR
              </Button>
              <Button
                id="btn-save-plan"
                type="submit"
                variant="primary"
                isLoading={isSubmitting}
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
