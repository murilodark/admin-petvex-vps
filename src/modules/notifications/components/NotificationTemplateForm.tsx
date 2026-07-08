import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Sparkles,
  HelpCircle,
  Eye,
  Info,
  ChevronRight,
  User,
  Calendar,
  DollarSign,
  Laptop,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { notificationTemplateSchema, NotificationTemplateSchemaInput } from '../schemas/notification.schema';
import { NotificationTemplate } from '../types/notification';

interface NotificationTemplateFormProps {
  template: NotificationTemplate | null;
  onSave: (data: NotificationTemplateSchemaInput) => void;
  onClose: () => void;
  isSaving: boolean;
}



const AVAILABLE_VARIABLES = [
  { token: '{{tenant_name}}', label: 'Nome da Empresa', desc: 'Nome do estabelecimento que realizará o atendimento.' },
  { token: '{{tenant_phone}}', label: 'Telefone da Empresa', desc: 'Telefone principal da empresa para contato.' },
  { token: '{{client_name}}', label: 'Nome do Cliente', desc: 'Nome completo do tutor/cliente.' },
  { token: '{{client_phone}}', label: 'Telefone do Cliente', desc: 'Telefone/WhatsApp do cliente.' },
  { token: '{{pet_name}}', label: 'Nome do Pet', desc: 'Nome do(s) pet(s) vinculado(s) ao agendamento.' },
  { token: '{{pet_line}}', label: 'Linha do Pet', desc: 'Texto formatado contendo o(s) pet(s), por exemplo: "Pet: Boby".' },
  { token: '{{service_names}}', label: 'Serviços', desc: 'Lista dos serviços vinculados ao agendamento.' },
  { token: '{{appointment_date}}', label: 'Data do Agendamento', desc: 'Data do agendamento no formato dd/mm/aaaa.' },
  { token: '{{appointment_time}}', label: 'Horário do Agendamento', desc: 'Horário do agendamento no formato HH:mm.' },
  { token: '{{appointment_url}}', label: 'Link do Agendamento', desc: 'Link público único para visualizar, confirmar ou cancelar o agendamento.' },
  { token: '{{confirmation_url}}', label: 'Link de Confirmação', desc: 'Reservado para uso futuro. Atualmente utilize {{appointment_url}}.' },
  { token: '{{cancellation_url}}', label: 'Link de Cancelamento', desc: 'Reservado para uso futuro. Atualmente utilize {{appointment_url}}.' }
];

export const NotificationTemplateForm: React.FC<NotificationTemplateFormProps> = ({
  template,
  onSave,
  onClose,
  isSaving,
}) => {
  const bodyRef = useRef<HTMLTextAreaElement | null>(null);

  // Initialize Form with React Hook Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(notificationTemplateSchema),
    defaultValues: {
      key: template?.key || '',
      name: template?.name || '',
      description: template?.description || '',
      module: (template?.module as any) || 'appointments',
      event: (template?.event as any) || 'confirmation',
      channel: (template?.channel as any) || 'whatsapp_manual',
      send_type: (template?.send_type as any) || 'manual',
      subject: template?.subject || '',
      body: template?.body || '',
      variables: template?.variables || [],
      is_active: template ? !!template.is_active : true,
      is_default: template ? !!template.is_default : false,
    },
  });

  const selectedChannel = watch('channel');
  const watchedBody = watch('body') || '';
  const watchedSubject = watch('subject') || '';
  const watchedName = watch('name') || 'Nome do Template';

  // Effect to register body field manually so we can also reference its ref for cursor insertions
  const { ref: hookFormBodyRef, ...bodyRegisterProps } = register('body');

  const handleVariableClick = (token: string) => {
    const textarea = bodyRef.current;
    if (!textarea) return;

    const startPos = textarea.selectionStart;
    const endPos = textarea.selectionEnd;
    const text = textarea.value;

    const newText = text.substring(0, startPos) + token + text.substring(endPos);
    setValue('body', newText, { shouldValidate: true, shouldDirty: true });

    // Reposition cursor after token insertion
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = startPos + token.length;
    }, 50);
  };

  // Generate dynamic live preview text
const getPreviewText = () => {
  if (!watchedBody) return 'Escreva o conteúdo para visualizar o preview...';

  let preview = watchedBody;
  preview = preview.replace(/{{tenant_name}}/g, 'Clínica PetVex');
  preview = preview.replace(/{{tenant_phone}}/g, '(31) 3333-4444');
  preview = preview.replace(/{{client_name}}/g, 'Murilo Dark');
  preview = preview.replace(/{{client_phone}}/g, '(31) 99572-7849');
  preview = preview.replace(/{{pet_name}}/g, 'Boby');
  preview = preview.replace(/{{pet_line}}/g, 'Pet: Boby');
  preview = preview.replace(/{{service_names}}/g, 'Banho, Tosa');
  preview = preview.replace(/{{appointment_date}}/g, '12/07/2026');
  preview = preview.replace(/{{appointment_time}}/g, '14:30');
  preview = preview.replace(/{{appointment_url}}/g, 'https://app.petvex.com.br/agendamento/abc123xyz456');
  preview = preview.replace(/{{confirmation_url}}/g, 'https://app.petvex.com.br/agendamento/abc123xyz456');
  preview = preview.replace(/{{cancellation_url}}/g, 'https://app.petvex.com.br/agendamento/abc123xyz456');
  preview = preview.replace(/{{custom_message}}/g, 'Chegue com 10 minutos de antecedência.');

  return preview;
};

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex justify-end z-50 animate-fade-in" id="notification-template-form-backdrop">
      <div className="bg-slate-950 border-l border-slate-800 w-full max-w-5xl h-full flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h3 className="font-sans font-bold text-sm text-white">
              {template ? 'Editar Template de Notificação' : 'Criar Novo Template de Notificação'}
            </h3>
            <p className="text-[10px] text-slate-500">Configure as regras de envio e conteúdo da mensagem</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-850 text-slate-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body / Split View */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Left Panel: Form */}
          <form
            onSubmit={handleSubmit(onSave)}
            className="flex-1 overflow-y-auto p-6 space-y-5 border-r border-slate-800/50"
            id="notification-template-form"
          >
            {/* Row 1: Key & Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1">
                  Chave Identificadora <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: consulta.lembrete"
                  disabled={!!template}
                  {...register('key')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-[4px] p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 disabled:opacity-40"
                />
                {errors.key && <p className="text-[10px] text-rose-500 font-medium">{errors.key.message}</p>}
                {!template && (
                  <p className="text-[9px] text-slate-500">
                    A chave é única e imutável após criada. Use pontos para separar termos.
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Nome do Template <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: Lembrete de Consulta de Rotina"
                  {...register('name')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-[4px] p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
                {errors.name && <p className="text-[10px] text-rose-500 font-medium">{errors.name.message}</p>}
              </div>
            </div>

            {/* Row 2: Description */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Descrição do Template</label>
              <input
                type="text"
                placeholder="Breve resumo da finalidade deste template..."
                {...register('description')}
                className="w-full bg-slate-900 border border-slate-800 rounded-[4px] p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
              />
            </div>

            {/* Row 3: Module & Event */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Módulo Relacionado</label>
                <select
                  {...register('module')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-[4px] p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="appointments">Consultas (Appointments)</option>
                  <option value="clients">Clientes (Clients)</option>
                  <option value="sales">Vendas (Sales)</option>
                  <option value="billing">Faturamento (Billing)</option>
                  <option value="stock">Estoque (Stock)</option>
                  <option value="system">Sistema (System)</option>
                </select>
                {errors.module && <p className="text-[10px] text-rose-500 font-medium">{errors.module.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Evento de Disparo</label>
                <select
                  {...register('event')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-[4px] p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="confirmation">Confirmação de Agendamento</option>
                  <option value="cancellation">Cancelamento de Agendamento</option>
                  <option value="reminder">Lembrete Preventivo</option>
                  <option value="payment_pending">Faturamento Pendente</option>
                  <option value="sale_finished">Venda Realizada/Concluída</option>
                  <option value="custom">Evento Personalizado (Custom)</option>
                </select>
                {errors.event && <p className="text-[10px] text-rose-500 font-medium">{errors.event.message}</p>}
              </div>
            </div>

            {/* Row 4: Channel & Send Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Canal de Envio</label>
                <select
                  {...register('channel')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-[4px] p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="whatsapp_manual">WhatsApp Manual</option>
                  <option value="email">E-mail</option>
                  <option value="sms">SMS</option>
                  <option value="push">Push Notification</option>
                  <option value="system">Notificação Interna de Sistema</option>
                </select>
                {errors.channel && <p className="text-[10px] text-rose-500 font-medium">{errors.channel.message}</p>}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Tipo de Processamento</label>
                <select
                  {...register('send_type')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-[4px] p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="manual">Manual (Exige confirmação humana)</option>
                  <option value="automatic">Automático (Disparado pelo background)</option>
                  <option value="both">Misto (Manual ou Automático dependendo do caso)</option>
                </select>
                {errors.send_type && <p className="text-[10px] text-rose-500 font-medium">{errors.send_type.message}</p>}
              </div>
            </div>

            {/* Conditional Email Subject */}
            {selectedChannel === 'email' && (
              <div className="space-y-1 animate-fade-in">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Assunto do E-mail <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ex: Confirmado: Consulta do {pet} agendada!"
                  {...register('subject')}
                  className="w-full bg-slate-900 border border-slate-800 rounded-[4px] p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
                {errors.subject && <p className="text-[10px] text-rose-500 font-medium">{errors.subject.message}</p>}
              </div>
            )}

            {/* Body of Message */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Conteúdo da Mensagem <span className="text-rose-500">*</span>
                </label>
                <span className="text-[9px] text-slate-500">Formatação padrão aceita</span>
              </div>
              <textarea
                rows={6}
                placeholder="Olá {cliente}, seu pet {pet} tem um agendamento marcado para dia {data}..."
                {...bodyRegisterProps}
                ref={(e) => {
                  hookFormBodyRef(e);
                  bodyRef.current = e;
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-[4px] p-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500 font-sans leading-relaxed"
              />
              {errors.body && <p className="text-[10px] text-rose-500 font-medium">{errors.body.message}</p>}
            </div>

            {/* Variable Tokens Helper Row */}
            <div className="space-y-1.5 p-3.5 bg-slate-900/40 border border-slate-800 rounded-[4px]">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4 w-4 text-teal-400" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Tokens Disponíveis</span>
              </div>
              <p className="text-[10px] text-slate-500 leading-normal mb-2">
                Selecione ou clique nas tags abaixo para inserir o token de substituição dinâmico no corpo da mensagem:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_VARIABLES.map((v) => (
                  <button
                    key={v.token}
                    type="button"
                    onClick={() => handleVariableClick(v.token)}
                    className="px-2 py-1 bg-slate-950 hover:bg-teal-500/10 border border-slate-800 hover:border-teal-500/20 rounded font-mono text-[10px] text-teal-400 hover:text-teal-300 transition-all flex items-center gap-1"
                    title={v.desc}
                  >
                    {v.token}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 5: Switches/Checkbox toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="flex items-center gap-3 bg-slate-900/30 p-3 rounded-[4px] border border-slate-800/40">
                <input
                  type="checkbox"
                  id="is_active"
                  {...register('is_active')}
                  className="rounded border-slate-800 text-teal-500 bg-slate-950 h-4 w-4 focus:ring-teal-500"
                />
                <label htmlFor="is_active" className="cursor-pointer select-none">
                  <span className="text-xs font-bold text-slate-200 block">Template Ativado</span>
                  <span className="text-[10px] text-slate-500 block">Este template pode ser selecionado e processado</span>
                </label>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/30 p-3 rounded-[4px] border border-slate-800/40">
                <input
                  type="checkbox"
                  id="is_default"
                  {...register('is_default')}
                  className="rounded border-slate-800 text-teal-500 bg-slate-950 h-4 w-4 focus:ring-teal-500"
                />
                <label htmlFor="is_default" className="cursor-pointer select-none">
                  <span className="text-xs font-bold text-slate-200 block">Template Padrão</span>
                  <span className="text-[10px] text-slate-500 block">Template default para este evento no canal</span>
                </label>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="bg-slate-900/60 p-4 border border-slate-800 rounded-[4px] flex justify-end gap-3 items-center pt-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-800 bg-slate-950 hover:bg-slate-900 rounded-[4px] text-xs font-semibold text-slate-400 hover:text-white transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-600 disabled:bg-teal-700 text-slate-950 font-semibold rounded-[4px] text-xs tracking-wide transition-all flex items-center gap-2"
              >
                {isSaving ? 'Gravando...' : 'Salvar Template'}
              </button>
            </div>
          </form>

          {/* Right Panel: Smartphone Visual Preview */}
          <div className="hidden lg:flex w-96 bg-slate-900 p-6 flex-col justify-center items-center overflow-y-auto select-none border-l border-slate-800">
            <h5 className="font-sans font-bold text-[10px] uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5 text-teal-400" /> Preview em Tempo Real
            </h5>

            {/* Smartphone mockup frame */}
            <div className="w-72 bg-slate-950 border-[6px] border-slate-800 rounded-[32px] overflow-hidden aspect-[9/18] shadow-2xl flex flex-col relative">
              {/* Phone Speaker & Camera Notch */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-24 h-4 bg-slate-800 rounded-b-xl flex justify-center items-center gap-1.5 z-10">
                <div className="w-8 h-1 bg-slate-950 rounded-full" />
                <div className="w-1.5 h-1.5 bg-slate-950 rounded-full" />
              </div>

              {/* Status bar */}
              <div className="bg-slate-900/80 px-4 pt-6 pb-2 flex justify-between items-center text-[8px] font-mono font-bold text-slate-500 border-b border-slate-850">
                <span>09:41</span>
                <div className="flex gap-1 items-center">
                  <span>5G</span>
                  <div className="w-4 h-2 bg-slate-500 rounded-[1px]" />
                </div>
              </div>

              {/* Chat Viewport depends on Channel */}
              {selectedChannel === 'email' ? (
                // Email Client Preview
                <div className="flex-1 bg-slate-900 p-3 overflow-y-auto text-left space-y-2">
                  <div className="bg-slate-950 p-2 border border-slate-850 rounded-[4px]">
                    <p className="text-[7px] text-slate-500 font-bold uppercase tracking-wider">Assunto:</p>
                    <p className="text-[9px] text-slate-200 font-semibold mt-0.5 truncate">
                      {watchedSubject.replace(/{pet}/g, 'Pipoca 🐶') || 'Sem Assunto'}
                    </p>
                  </div>
                  <div className="bg-white text-slate-850 rounded-[4px] p-3 text-[9px] leading-relaxed shadow space-y-2 min-h-40 font-sans">
                    <div className="border-b border-slate-100 pb-1 flex justify-between items-center text-slate-400 text-[7px]">
                      <span>De: Petvex Admin</span>
                      <span>Para: Cliente</span>
                    </div>
                    <p className="whitespace-pre-line text-slate-700">{getPreviewText()}</p>
                  </div>
                </div>
              ) : (
                // WhatsApp Bubble Preview (Default)
                <div className="flex-1 bg-slate-900/60 p-3 flex flex-col justify-end space-y-2 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:12px_12px]">
                  
                  {/* WhatsApp chat bubble */}
                  <div className="bg-emerald-950/40 border border-emerald-900/40 text-emerald-100 max-w-[85%] rounded-[12px] rounded-tr-none p-3 self-end shadow-sm relative text-[9px] leading-relaxed space-y-2">
                    <p className="whitespace-pre-line break-words text-slate-200">{getPreviewText()}</p>
                    <div className="flex justify-end items-center gap-0.5 text-slate-400 text-[6px] font-semibold">
                      <span>09:41</span>
                      <span className="text-emerald-400 font-mono">✔✔</span>
                    </div>
                  </div>

                  <div className="text-[7px] text-center text-slate-500 bg-slate-950/60 p-1.5 border border-slate-850 rounded-[4px] mt-2">
                    Visualização simulada do WhatsApp.
                  </div>
                </div>
              )}

              {/* Bottom Home indicator */}
              <div className="bg-slate-950 py-2 border-t border-slate-850 flex justify-center items-center">
                <div className="w-24 h-1 bg-slate-800 rounded-full" />
              </div>
            </div>

            <div className="mt-4 flex gap-2 max-w-[260px] text-[10px] text-slate-500 leading-normal text-center">
              <Info className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
              <span>O visualizador substitui as variáveis por dados reais na entrega da mensagem.</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
