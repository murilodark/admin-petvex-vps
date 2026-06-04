import React from 'react';
import { Plan } from '../types/plans.types';
import { Check, Edit3, Trash2, Calendar, Star, Layers, HardDrive } from 'lucide-react';

interface PlanPreviewCardProps {
  plan: Plan;
  onEdit: (plan: Plan) => void;
  onToggleStatus: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
}

const FEATURE_LABELS: Record<string, string> = {
  pdv: 'PDV / Caixa Integrado',
  reports: 'Relatórios Operacionais e Gerenciais',
  boarding: 'Hospedagem e Hotelaria Pet',
  grooming: 'Estética, Banho e Tosa',
  whatsapp: 'Notificações auto via WhatsApp',
  financial: 'Gestão Financeira Completa',
  inventory: 'Estoque Inteligente e Compras',
  surgeries: 'Grade de Cirurgias e Procedimentos',
  multi_user: 'Permissão Multi-usuário',
  vaccination: 'Carteiras de Vacinação Digital',
  appointments: 'Agenda Inteligente de Consultas',
  external_api: 'Acesso completo à API Externa',
  integrations: 'Integrações Nativas de Meio de Pagamento',
  hospitalization: 'Controle de Internação e Leitos',
  advanced_dashboard: 'Dashboard SaaS Analytics'
};

export const PlanPreviewCard: React.FC<PlanPreviewCardProps> = ({
  plan,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const monthlyWhole = formatCurrency(plan.monthly_price || 0).split(',')[0];
  const monthlyDecimal = formatCurrency(plan.monthly_price || 0).split(',')[1] || '00';

  const yearlyWhole = formatCurrency(plan.yearly_price || 0).split(',')[0];
  const yearlyDecimal = formatCurrency(plan.yearly_price || 0).split(',')[1] || '00';

  const formatLimit = (val: number | null | undefined) => {
    if (val === null || val === undefined || val === 0) {
      return 'Ilimitado';
    }
    return val.toString();
  };

  const formatStorage = (val: number | null | undefined) => {
    if (val === null || val === undefined || val === 0) {
      return 'Ilimitado';
    }
    if (val >= 1024) {
      return `${(val / 1024).toFixed(1).replace('.0', '')} GB`;
    }
    return `${val} MB`;
  };

  // Get active features of the plan (where the value is true)
  const activeFeatures = Object.entries(plan.features || {})
    .filter(([_, value]) => !!value)
    .map(([key]) => key);

  const customColor = plan.color && plan.color.trim() !== '' ? plan.color : '#10b981';

  return (
    <div 
      className={`border rounded-[6px] bg-white transition-all duration-300 flex flex-col justify-between relative overflow-hidden shadow-xs hover:shadow-md ${
        plan.is_active 
          ? 'border-slate-200' 
          : 'border-slate-200 opacity-75 bg-slate-50/50'
      }`}
      id={`plan-card-${plan.id}`}
      style={{ borderTop: `3px solid ${customColor}` }}
    >
      {/* Featured Header ribbon */}
      {plan.is_featured && (
        <div 
          className="absolute top-1 right-1 px-2 py-0.5 text-[8px] font-black uppercase text-white rounded font-mono flex items-center gap-0.5 z-10 shadow-xs animate-pulse"
          style={{ backgroundColor: customColor }}
        >
          <Star className="h-2 w-2 fill-white" />
          DESTAQUE
        </div>
      )}

      {/* Card Content body */}
      <div className="p-6 flex-1 space-y-4">
        
        {/* Title, Badge and toggle switcher */}
        <div className="flex justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                {plan.name}
              </h4>
              {plan.badge && (
                <span 
                  className="px-1.5 py-0.25 text-[8px] font-black uppercase rounded text-white"
                  style={{ backgroundColor: customColor }}
                >
                  {plan.badge}
                </span>
              )}
            </div>
            {plan.slug && (
              <span className="text-[9px] font-mono font-medium text-slate-400">
                slug: {plan.slug}
              </span>
            )}
            <div className="text-[9px] font-mono text-slate-400">
              ID: #{plan.id}
            </div>
          </div>

          <button
            onClick={() => onToggleStatus(plan)}
            type="button"
            className={`px-2 py-0.5 rounded-[4px] text-[8px] font-black uppercase tracking-wider border cursor-pointer transition-all hover:scale-105 active:scale-95 shrink-0 ${
              plan.is_active
                ? 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100'
                : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
            }`}
            id={`toggle-badge-plan-${plan.id}`}
            title={plan.is_active ? 'Clique para desativar plano' : 'Clique para ativar plano'}
          >
            {plan.is_active ? 'ATIVO' : 'INATIVO'}
          </button>
        </div>

        {/* Pricing options */}
        <div className="grid grid-cols-2 gap-2 text-left">
          {/* Monthly Price container */}
          <div className="py-2 bg-slate-50 border border-slate-100 rounded-[4px] px-3.5 flex flex-col justify-between">
            <span className="block text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">MENSUAL</span>
            <div className="flex items-baseline mt-1">
              <span className="text-md font-black text-slate-900 tracking-tight">{monthlyWhole}</span>
              <span className="text-[10px] font-extrabold text-slate-700">,{monthlyDecimal}</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase ml-0.5">/mês</span>
            </div>
          </div>

          {/* Yearly Price container */}
          <div className="py-2 bg-slate-50 border border-slate-100 rounded-[4px] px-3.5 flex flex-col justify-between relative">
            <div className="flex justify-between items-center w-full">
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-wider font-mono">ANUAL</span>
              {plan.yearly_discount_percent ? (
                <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-1 border border-emerald-100 rounded leading-none shrink-0 scale-90">
                  -{plan.yearly_discount_percent}%
                </span>
              ) : null}
            </div>
            <div className="flex items-baseline mt-1">
              <span className="text-md font-black text-slate-900 tracking-tight">{yearlyWhole}</span>
              <span className="text-[10px] font-extrabold text-slate-700">,{yearlyDecimal}</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase ml-0.5">/ano</span>
            </div>
          </div>
        </div>

        {/* Short & Long descriptions */}
        <div className="space-y-1 text-left">
          {plan.short_description && (
            <p className="text-[10px] font-extrabold text-slate-800 uppercase tracking-tight">
              {plan.short_description}
            </p>
          )}
          {plan.description ? (
            <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
              {plan.description}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 italic">
              Nenhuma descrição preenchida para este modelo.
            </p>
          )}
        </div>

        {/* Trial Days block */}
        {plan.has_trial && (
          <div className="flex items-center gap-1.5 p-2 bg-yellow-50 text-yellow-800 border border-yellow-100 rounded text-[10px] font-bold uppercase tracking-wide text-left">
            <Calendar className="h-3.5 w-3.5 text-yellow-600" />
            <span>TESTE SAAS DE {plan.trial_days || 0} DIAS GRÁTIS</span>
          </div>
        )}

        {/* Structured Limits info */}
        <div className="bg-slate-50 border border-slate-150 rounded-[4px] p-3 text-left space-y-2">
          <div className="flex items-center gap-1 text-[9px] font-black text-slate-400 uppercase font-mono tracking-wider border-b border-slate-200 pb-1">
            <Layers className="h-3.5 w-3.5" />
            <span>Limites e Licenciamento</span>
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px] font-semibold text-slate-600">
            <div className="flex justify-between">
              <span className="text-slate-400">Pets (Pacientes):</span>
              <strong className="text-slate-800">{formatLimit(plan.max_pets)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Usuários:</span>
              <strong className="text-slate-800">{formatLimit(plan.max_users)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Clientes (Tutores):</span>
              <strong className="text-slate-800">{formatLimit(plan.max_clients)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Consultas/Agenda:</span>
              <strong className="text-slate-800">{formatLimit(plan.max_appointments)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Serviços:</span>
              <strong className="text-slate-800">{formatLimit(plan.max_services)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Produtos:</span>
              <strong className="text-slate-800">{formatLimit(plan.max_products)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Itens Estoque:</span>
              <strong className="text-slate-800">{formatLimit(plan.max_stock_items)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Documentos:</span>
              <strong className="text-slate-800">{formatLimit(plan.max_documents)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Anexos:</span>
              <strong className="text-slate-800">{formatLimit(plan.max_attachments)}</strong>
            </div>
            <div className="flex justify-between col-span-2 border-t border-dashed border-slate-200 pt-1.5 mt-1">
              <span className="text-slate-400 flex items-center gap-1">
                <HardDrive className="h-3 w-3 text-slate-400" />
                Espaço em Disco:
              </span>
              <strong className="text-slate-800">{formatStorage(plan.max_storage_mb)}</strong>
            </div>
          </div>
        </div>

        {/* Features selection */}
        <div className="space-y-2 pt-1 border-t border-slate-100 text-left">
          <span className="block text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">RECURSOS HABILITADOS ({activeFeatures.length}):</span>
          {activeFeatures.length > 0 ? (
            <ul className="grid grid-cols-1 gap-1">
              {activeFeatures.slice(0, 5).map((featKey) => (
                <li key={featKey} className="flex items-start gap-1.5 text-[11px] text-slate-600 font-medium">
                  <Check className="h-3.5 w-3.5 text-teal-600 mt-0.5 shrink-0" />
                  <span className="line-clamp-1">{FEATURE_LABELS[featKey] || featKey}</span>
                </li>
              ))}
              {activeFeatures.length > 5 ? (
                <li className="text-[9px] font-mono text-slate-400 pl-5 uppercase font-bold">
                  + {activeFeatures.length - 5} recursos adicionais habilitados
                </li>
              ) : null}
            </ul>
          ) : (
            <div className="text-[10px] text-slate-400 italic">Nenhum recurso extra ativo para este plano.</div>
          )}
        </div>

      </div>

      {/* Card Footer controls */}
      <div className="bg-slate-50 border-t border-slate-100 px-6 py-3 flex items-center justify-between gap-4">
        <span className="text-[8px] text-slate-400 font-mono uppercase font-black">
          {plan.display_order ? `Ordem: ${plan.display_order}` : ''} • Criado: {new Date(plan.created_at).toLocaleDateString('pt-BR')}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            id={`btn-edit-plan-${plan.id}`}
            onClick={() => onEdit(plan)}
            className="p-1.5 border border-slate-200 rounded-[4px] bg-white text-slate-600 hover:text-teal-600 hover:border-teal-300 transition-all cursor-pointer"
            title="Editar Plan"
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            id={`btn-delete-plan-${plan.id}`}
            onClick={() => onDelete(plan)}
            className="p-1.5 border border-slate-200 rounded-[4px] bg-white text-slate-600 hover:text-rose-600 hover:border-rose-300 transition-all cursor-pointer"
            title="Excluir Plan"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

    </div>
  );
};
