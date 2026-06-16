import React from 'react';
import { X, ClipboardList, Shield, DollarSign, Calendar, Sliders, Layers, Check, RefreshCw, Key } from 'lucide-react';
import { Subscription } from '../../../../core/http/generated/models';
import { Badge } from '../../../../shared/components/ui/Badge';

interface SubscriptionDetailsModalProps {
  subscription: Subscription | null;
  isOpen: boolean;
  onClose: () => void;
}

export const SubscriptionDetailsModal: React.FC<SubscriptionDetailsModalProps> = ({
  subscription,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !subscription) return null;

  // Formatter helpers
  const formatCurrency = (amountVal?: any, currencyStr?: string | null) => {
    const numericVal = amountVal !== undefined && amountVal !== null ? Number(amountVal) : NaN;
    if (isNaN(numericVal)) {
      return 'N/A';
    }
    const currency = currencyStr || 'BRL';
    try {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(numericVal);
    } catch {
      return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericVal);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Não informado';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Não informado';
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return 'Não informado';
    }
  };

  const renderBooleanBadge = (val?: any) => {
    if (val === true || val === 'true' || val === 1 || val === 'active' || val === 'Ativo') {
      return <Badge variant="success">Sim / Ativo</Badge>;
    }
    return <Badge variant="neutral">Não / Inativo</Badge>;
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return <Badge variant="success">Ativa</Badge>;
      case 'trialing':
        return <Badge variant="info">Trialing</Badge>;
      case 'suspended':
        return <Badge variant="warning">Suspensa</Badge>;
      case 'canceled':
        return <Badge variant="danger">Cancelada</Badge>;
      case 'past_due':
        return <Badge variant="danger">Em Atraso</Badge>;
      case 'expired':
        return <Badge variant="neutral">Expirada</Badge>;
      default:
        return <Badge variant="neutral">{status || '-'}</Badge>;
    }
  };

  const renderText = (value?: any, fallback: string = '-') => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  };

  const plan = subscription.plan || {};
  const tenant = subscription.tenant || {};
  const metadata = (subscription as any).metadata || {};

  // List of standard limits
  const limits = [
    { label: 'Máx. Usuários (max_users)', val: plan.max_users },
    { label: 'Máx. Clientes (max_clients)', val: plan.max_clients },
    { label: 'Máx. Pets (max_pets)', val: plan.max_pets },
    { label: 'Máx. Agendamentos (max_appointments)', val: plan.max_appointments },
    { label: 'Máx. Produtos (max_products)', val: plan.max_products },
    { label: 'Máx. Serviços (max_services)', val: plan.max_services },
    { label: 'Máx. Itens de Estoque (max_stock_items)', val: plan.max_stock_items },
    { label: 'Máx. Documentos (max_documents)', val: plan.max_documents },
    { label: 'Máx. Anexos (max_attachments)', val: plan.max_attachments },
    { label: 'Armazenamento MB (max_storage_mb)', val: plan.max_storage_mb },
  ];

  // List of features
  const featuresList = [
    { key: 'pdv', label: 'Ponto de Venda (PDV)' },
    { key: 'reports', label: 'Relatórios Executivos' },
    { key: 'boarding', label: 'Hospedagem (Boarding)' },
    { key: 'grooming', label: 'Banho & Tosa (Grooming)' },
    { key: 'whatsapp', label: 'Disparo de WhatsApp' },
    { key: 'financial', label: 'Controle Financeiro' },
    { key: 'inventory', label: 'Controle de Estoque' },
    { key: 'surgeries', label: 'Gestão de Cirurgias' },
    { key: 'multi_user', label: 'Acesso Multi-Usuário' },
    { key: 'vaccination', label: 'Controle de Vacinas' },
    { key: 'appointments', label: 'Agendamentos Online' },
    { key: 'external_api', label: 'Acesso via API Externa' },
    { key: 'integrations', label: 'Integrações Parceiras' },
    { key: 'hospitalization', label: 'Internação (Hospitalization)' },
    { key: 'advanced_dashboard', label: 'Dashboard customizado' },
  ];

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 font-sans animate-fade-in" id="subscription-detail-backdrop">
      <div className="bg-white rounded-[4px] border border-slate-200 shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]" id="subscription-detail-container">
        
        {/* Header toolbar */}
        <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between" id="subscription-detail-header">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-teal-600" />
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
              Dossiê Completo da Assinatura #{subscription.id}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 hover:bg-slate-200 p-1.5 rounded-[4px] cursor-pointer transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content body with custom scrolling */}
        <div className="p-6 space-y-6 overflow-y-auto" id="subscription-detail-body">
          
          {/* Section 1: Identificação da Assinatura */}
          <div className="border border-slate-150 rounded-[4px] p-4 bg-white shadow-xs">
            <div className="text-[10px] font-black uppercase tracking-widest text-teal-750 mb-3.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <DollarSign className="h-4 w-4 text-teal-650" />
              1. Identificação da assinatura
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">ID DA ASSINATURA</span>
                <span className="font-mono font-bold text-slate-900">{subscription.id}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">STATUS</span>
                <div className="mt-0.5">{getStatusBadge(subscription.status)}</div>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">CICLO DE COBRANÇA</span>
                <span className="font-semibold text-slate-700 uppercase font-mono">
                  {subscription.billing_cycle === 'monthly' ? 'Mensal' : subscription.billing_cycle === 'yearly' ? 'Anual' : renderText(subscription.billing_cycle)}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">MOEDA</span>
                <span className="font-bold text-slate-800 font-mono uppercase">{renderText((subscription as any).currency, 'BRL')}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">VALOR RECORRENTE</span>
                <span className="font-extrabold text-slate-900 text-sm">
                  {formatCurrency((subscription as any).amount !== undefined ? (subscription as any).amount : subscription.price, (subscription as any).currency)}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">GATEWAY</span>
                <span className="font-bold text-teal-600 uppercase font-mono text-[10px]">
                  {renderText(subscription.gateway, 'N/A').replace('_', ' ')}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PAYMENT GATEWAY ID</span>
                <span className="font-mono text-slate-600 break-all">{renderText((subscription as any).payment_gateway_id)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">BILLING CUSTOMER ID</span>
                <span className="font-mono text-slate-600 break-all">{renderText((subscription as any).billing_customer_id)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">GATEWAY CUSTOMER ID</span>
                <span className="font-mono text-slate-600 break-all">{renderText((subscription as any).gateway_customer_id)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">GATEWAY SUBSCRIPTION ID</span>
                <span className="font-mono text-slate-600 break-all">{renderText((subscription as any).gateway_subscription_id)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">GATEWAY CHECKOUT ID</span>
                <span className="font-mono text-slate-600 break-all">{renderText((subscription as any).gateway_checkout_id)}</span>
              </div>
              <div className="col-span-1 sm:col-span-2 md:col-span-2">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">GATEWAY CHECKOUT URL</span>
                {(subscription as any).gateway_checkout_url ? (
                  <a
                    href={(subscription as any).gateway_checkout_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-teal-650 hover:text-teal-850 hover:underline font-mono text-[10px] break-all font-bold block mt-0.5 truncate"
                    title={(subscription as any).gateway_checkout_url}
                  >
                    {(subscription as any).gateway_checkout_url}
                  </a>
                ) : (
                  <span className="text-slate-400 italic font-medium">Link de checkout indisponível</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Cliente SaaS / Tenant */}
          <div className="border border-slate-150 rounded-[4px] p-4 bg-white shadow-xs">
            <div className="text-[10px] font-black uppercase tracking-widest text-teal-750 mb-3.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Shield className="h-4 w-4 text-teal-650" />
              2. Cliente SaaS / Tenant
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">ID DO TENANT</span>
                <span className="font-mono font-bold text-slate-900">{renderText(subscription.tenant_id || tenant.id)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">NOME DO CLIENTE SAAS</span>
                <span className="font-extrabold text-slate-900">{renderText(tenant.name)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">SLUG (SUBDOMÍNIO)</span>
                <span className="font-mono font-bold text-slate-700 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-[10px]">
                  {renderText((tenant as any).slug)}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">STATUS DO REPASSE</span>
                <span className="font-semibold text-slate-700">{renderText(tenant.status, 'Não informado')}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">TENANT ATIVO</span>
                <div className="mt-0.5">{renderBooleanBadge((tenant as any).active ?? (tenant as any).is_active ?? true)}</div>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DOMÍNIO SELECIONADO</span>
                <span className="font-mono text-slate-600 break-all">{renderText((tenant as any).domain, 'Padrão Petvex')}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DOCUMENTO (CNPJ/CPF)</span>
                <span className="font-mono font-semibold text-slate-800">{renderText(tenant.documento || (tenant as any).document || (tenant as any).cpf_cnpj)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">E-MAIL DO ADMINISTRADOR</span>
                <span className="font-mono text-slate-700 font-medium break-all">{renderText(tenant.email)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">TELEFONE CONTATO</span>
                <span className="font-mono text-slate-700 font-medium">{renderText(tenant.telefone || (tenant as any).phone)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PLANO SALVO NO TENANT</span>
                <span className="font-bold text-teal-600 uppercase font-mono text-[10px]">{renderText(tenant.plano || (tenant as any).plan_id)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">TRIAL ENCERRRA EM</span>
                <span className="font-mono text-slate-600 font-bold">{formatDate((tenant as any).trial_ends_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">CRIADO EM</span>
                <span className="font-mono text-slate-500">{formatDate(tenant.created_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">ATUALIZADO EM</span>
                <span className="font-mono text-slate-500">{formatDate(tenant.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Plano Contratado */}
          <div className="border border-slate-150 rounded-[4px] p-4 bg-white shadow-xs">
            <div className="text-[10px] font-black uppercase tracking-widest text-teal-750 mb-3.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Layers className="h-4 w-4 text-teal-650" />
              3. Plano contratado
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">ID DO PLANO</span>
                <span className="font-mono font-bold text-slate-900">{renderText(plan.id || subscription.plan_id)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">NOME</span>
                <span className="font-extrabold text-teal-700 uppercase tracking-wide">{renderText(plan.name, 'Plano Avulso')}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">SLUG</span>
                <span className="font-mono font-semibold text-slate-600">{renderText(plan.slug)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">BADGE PLANO</span>
                <span className="font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded uppercase text-[10px] border border-slate-200">
                  {renderText(plan.badge, 'Sem Badge')}
                </span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">COR REPRESENTATIVA</span>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-3 h-3 rounded-full border border-slate-350" style={{ backgroundColor: plan.color || '#CBD5E1' }} />
                  <span className="font-mono text-slate-500 uppercase">{renderText(plan.color, '#CBD5E1')}</span>
                </div>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PREÇO MENSAL</span>
                <span className="font-bold text-slate-800">{formatCurrency(plan.monthly_price)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PREÇO ANUAL</span>
                <span className="font-bold text-slate-800">{formatCurrency(plan.yearly_price)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DESCONTO ANUAL (%)</span>
                <span className="font-bold text-teal-600 font-mono">{(plan as any).yearly_discount_percent !== undefined ? `${(plan as any).yearly_discount_percent}%` : (plan as any).yearly_discount_percentage !== undefined ? `${(plan as any).yearly_discount_percentage}%` : '-'}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">TRIAL HABILTADO</span>
                <div className="mt-0.5">{renderBooleanBadge(plan.has_trial ?? (plan as any).trial_enabled)}</div>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DAYS TRIAL DISPONÍVEL</span>
                <span className="font-bold text-slate-700 font-mono">{plan.trial_days !== undefined ? `${plan.trial_days} dias` : '-'}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">ORDEM EXIBIÇÃO</span>
                <span className="font-semibold text-slate-700 font-mono">{renderText(plan.display_order ?? (plan as any).sort_order)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">PLAN ATIVO</span>
                <div className="mt-0.5">{renderBooleanBadge(plan.is_active ?? (plan as any).active)}</div>
              </div>
              <div className="col-span-1 sm:col-span-2 md:col-span-4">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">DESCRIÇÃO CURTA</span>
                <p className="text-slate-600 font-medium leading-relaxed bg-slate-50 border border-slate-100 p-2 rounded mt-0.5">{renderText(plan.short_description || plan.description, 'Sem descrição disponível')}</p>
              </div>
            </div>
          </div>

          {/* Section 4: Limites do Plano */}
          <div className="border border-slate-150 rounded-[4px] p-4 bg-white shadow-xs">
            <div className="text-[10px] font-black uppercase tracking-widest text-teal-750 mb-3.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Sliders className="h-4 w-4 text-teal-655" />
              4. Limites operacionais do plano
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3.5">
              {limits.map((lim, index) => (
                <div key={index} className="bg-slate-50 border border-slate-100 rounded-[3px] p-2.5 text-center flex flex-col justify-between shadow-xxs">
                  <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider leading-tight mb-2">
                    {lim.label}
                  </span>
                  <span className="text-sm font-extrabold text-slate-900 font-mono">
                    {lim.val === null || lim.val === undefined ? (
                      <span className="text-teal-600 text-xs uppercase font-extrabold">ILIMITADO</span>
                    ) : (
                      typeof lim.val === 'number' && lim.label.includes('MB') ? `${lim.val} MB` : lim.val
                    )}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Features do Plano */}
          <div className="border border-slate-150 rounded-[4px] p-4 bg-white shadow-xs">
            <div className="text-[10px] font-black uppercase tracking-widest text-teal-750 mb-3.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Check className="h-4 w-4 text-teal-650" />
              5. Features do plano
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {featuresList.map((feature, idx) => {
                const subPlanFeatures = plan.features || {};
                const isFeatureEnabled = !!(subPlanFeatures as any)[feature.key];
                return (
                  <div
                    key={idx}
                    className={`border rounded-[3px] p-2.5 flex items-center justify-between transition-all ${
                      isFeatureEnabled
                        ? 'border-emerald-200 bg-emerald-50/20 text-emerald-900'
                        : 'border-slate-100 bg-slate-50/40 text-slate-400'
                    }`}
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold">{feature.label}</span>
                      <span className="text-[9px] font-mono text-slate-400 tracking-wide mt-0.5">{feature.key}</span>
                    </div>
                    <div>
                      {isFeatureEnabled ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 leading-none">
                          Habilitado
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] font-extrabold uppercase bg-slate-100 text-slate-400 leading-none">
                          Inativo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 6: Cronologia da Assinatura */}
          <div className="border border-slate-150 rounded-[4px] p-4 bg-white shadow-xs">
            <div className="text-[10px] font-black uppercase tracking-widest text-teal-750 mb-3.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Calendar className="h-4 w-4 text-teal-650" />
              6. Cronologia da assinatura
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 text-xs font-medium">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">started_at</span>
                <span className="font-mono text-slate-700">{formatDate((subscription as any).started_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">trial_started_at</span>
                <span className="font-mono text-slate-700">{formatDate((subscription as any).trial_started_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">trial_ends_at</span>
                <span className="font-mono text-slate-800 font-bold">{formatDate(subscription.trial_ends_at || (subscription as any).trial_ends_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">current_period_starts_at</span>
                <span className="font-mono text-slate-700">{formatDate(subscription.current_period_starts_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">current_period_ends_at</span>
                <span className="font-mono text-slate-850 font-extrabold">{formatDate(subscription.current_period_ends_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono font-black text-teal-700">next_billing_at</span>
                <span className="font-mono text-teal-700 font-extrabold">{formatDate(subscription.next_billing_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">canceled_at</span>
                <span className="font-mono text-rose-600 font-bold">{formatDate(subscription.canceled_at)}</span>
              </div>
              <div className="col-span-1 sm:col-span-2">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">MOTIVO DE CANCELAMENTO (cancel_reason)</span>
                <span className="text-slate-700 font-semibold italic">{renderText((subscription as any).cancel_reason, 'Nenhum motivo catalogado')}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">CRIADA EM</span>
                <span className="font-mono text-slate-500">{formatDate(subscription.created_at)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider font-mono">ATUALIZADA EM</span>
                <span className="font-mono text-slate-500">{formatDate(subscription.updated_at)}</span>
              </div>
            </div>
          </div>

          {/* Section 7: Metadata */}
          <div className="border border-slate-150 rounded-[4px] p-4 bg-white shadow-xs">
            <div className="text-[10px] font-black uppercase tracking-widest text-teal-750 mb-3.5 flex items-center gap-1.5 border-b border-slate-100 pb-2">
              <Key className="h-4 w-4 text-teal-650" />
              7. Metadata & Chaves Adicionais
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold mb-3">
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">INVOICE_ID</span>
                <span className="font-mono text-slate-800 break-all">{renderText(metadata.invoice_id)}</span>
              </div>
              <div>
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">EXTERNAL REFERENCE</span>
                <span className="font-mono text-slate-800 break-all">{renderText(metadata.external_reference)}</span>
              </div>
            </div>
            <div className="mt-3 bg-slate-50 rounded border border-slate-100 p-3">
              <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider mb-2">METADATA COMPLETO (JSON)</span>
              {Object.keys(metadata).length > 0 ? (
                <pre className="text-[11px] text-slate-700 font-mono overflow-x-auto whitespace-pre-wrap max-h-48 leading-relaxed">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              ) : (
                <span className="text-[11px] text-slate-400 italic">Vazio (Nenhum metadado adicional cadastrado)</span>
              )}
            </div>
          </div>

        </div>

        {/* Footer toolbar */}
        <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 flex justify-end" id="subscription-detail-footer">
          <button
            id="subscription-detail-close-btn"
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-[4px] text-xs font-extrabold cursor-pointer transition-all uppercase"
          >
            FECHAR DOSSIÊ
          </button>
        </div>
      </div>
    </div>
  );
};
