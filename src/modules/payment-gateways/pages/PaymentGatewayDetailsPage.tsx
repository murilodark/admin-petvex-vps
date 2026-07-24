import React, { useEffect, useState } from 'react';
import { ArrowLeft, Edit, Zap, Star, AlertCircle, Shield, Key, FileJson, Clock, Loader2, CheckCircle2, AlertOctagon, Link2 } from 'lucide-react';
import { PaymentGateway } from '../../../core/http/generated/models/admin-payment-gateways';
import { paymentGatewaysService } from '../services/payment-gateways.service';
import { PaymentGatewayProviderBadge } from '../components/PaymentGatewayProviderBadge';
import { PaymentGatewayStatusBadge, EnvironmentBadge } from '../components/PaymentGatewayStatusBadge';
import { PaymentGatewayTestConnectionDialog } from '../components/PaymentGatewayTestConnectionDialog';

interface PaymentGatewayDetailsPageProps {
  onNavigate: (path: string) => void;
}

export const PaymentGatewayDetailsPage: React.FC<PaymentGatewayDetailsPageProps> = ({ onNavigate }) => {
  const path = window.location.pathname;
  const segments = path.split('/');
  const gatewayId = segments[4] || '';

  const [gateway, setGateway] = useState<PaymentGateway | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Diagnostic Test Modal states
  const [isTestOpen, setIsTestOpen] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await paymentGatewaysService.buscarGatewayPorId(gatewayId);
      setGateway(data);
    } catch (err: any) {
      console.error('Failed to load payment gateway details', err);
      setError(err?.message || 'Falha ao buscar as informações do gateway.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (gatewayId) {
      fetchDetails();
    }
  }, [gatewayId]);

  if (loading) {
    return (
      <div className="py-12 text-center bg-white border border-slate-200 rounded-[4px] shadow-xs font-sans" id="details-loading-state">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Acessando registro de faturamento operacional...</p>
      </div>
    );
  }

  if (error || !gateway) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-5 rounded-[4px] flex items-start gap-2 font-sans" id="details-page-error-banner">
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold uppercase tracking-wider mb-1">Registro de Gateway Inválido</h4>
          <p className="text-[11px] leading-relaxed mb-4">{error || 'Gateway de pagamento administrativel não pôde ser carregado.'}</p>
          <button
            onClick={() => onNavigate('/admin/billing/payment-gateways')}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[4px] font-bold uppercase tracking-wider text-[10px]"
          >
            Voltar ao Painel
          </button>
        </div>
      </div>
    );
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return '-';
    try {
      return new Date(isoString).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getTestStatusBadge = (status?: string) => {
    if (!status) return <span className="text-slate-400 font-mono">-</span>;
    if (status === 'success' || status === 'ONLINE') {
      return (
        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[9px] font-black bg-emerald-500 text-white font-mono uppercase tracking-widest">
          ONLINE
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[9px] font-black bg-rose-500 text-white font-mono uppercase tracking-widest">
        OFFLINE
      </span>
    );
  };

  const gatewayAny = gateway as any;

  return (
    <div className="space-y-6 font-sans" id="payment-gateway-details-page">
      {/* Header with quick utilities */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5" id="details-header">
        <div>
          <button
            onClick={() => onNavigate('/admin/billing/payment-gateways')}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-[10px] font-bold uppercase tracking-wider mb-2 group transition-colors cursor-pointer font-sans"
            id="btn-back-to-list"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Voltar para listagem
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight" id="page-title">
              {gateway.name}
            </h1>
            {gateway.is_default && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] text-[9px] font-bold bg-amber-500 text-white font-mono uppercase tracking-wider">
                Padrão Global
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            Detalhamento e presença de chaves criptográficas de cobrança do processador
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0" id="details-action-buttons">
          <button
            onClick={() => setIsTestOpen(true)}
            id="btn-trigger-diagnostics"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold tracking-widest uppercase rounded-[4px] shadow-xs cursor-pointer transition-all"
          >
            <Zap className="h-3.5 w-3.5 text-teal-600" />
            Executar Diagnóstico
          </button>

          <button
            onClick={() => onNavigate(`/admin/billing/payment-gateways/${gateway.id}/edit`)}
            id="btn-trigger-edit"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-[10px] font-bold tracking-widest uppercase rounded-[4px] shadow-sm cursor-pointer transition-all font-sans"
          >
            <Edit className="h-3.5 w-3.5" />
            Editar Parametros
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="details-bento-grid">
        {/* Basic specifications segment */}
        <div className="lg:col-span-1 space-y-6">
          <div className="border border-slate-200 rounded-[4px] bg-white p-5 shadow-xs" id="specs-card">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="h-4 w-4 text-slate-600" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">Dados Operacionais</h3>
            </div>

            <div className="space-y-4 text-xs font-sans text-slate-600">
              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">ID de Registro:</span>
                <span className="font-mono text-slate-900 font-bold bg-slate-50 border px-1.5 py-0.5 rounded-[3px] text-[10px]">{gateway.id}</span>
              </div>

              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Provedor:</span>
                <PaymentGatewayProviderBadge provider={gateway.provider} />
              </div>

              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Status:</span>
                <PaymentGatewayStatusBadge status={gateway.status} />
              </div>

              <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Ambiente de Rota:</span>
                <EnvironmentBadge isSandbox={gateway.is_sandbox} />
              </div>

              <div className="flex items-start justify-between">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">Tratamento Padrão:</span>
                <div className="text-right">
                  {gateway.is_default ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-500">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-500" /> Canal de Faturamento SaaS Padrão
                    </span>
                  ) : (
                    <span className="text-slate-400">Canal Roteável Secundário</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-[4px] bg-white p-5 shadow-xs" id="webhook-card">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="h-4 w-4 text-slate-600" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">Url do Webhook</h3>
            </div>
            
            <div className="text-xs text-slate-600">
              {gatewayAny.webhook_url ? (
                <div className="p-2 bg-slate-50 border rounded-[3px] font-mono break-all text-[11px] select-all leading-normal text-slate-800">
                  {gatewayAny.webhook_url}
                </div>
              ) : (
                <span className="text-slate-400 tracking-wide font-medium italic block text-center p-3 border border-dashed rounded-[3px] bg-slate-50/50">Não Configurado</span>
              )}
            </div>
          </div>

          {/* Diagnostics Test Status summary card */}
          <div className="border border-slate-200 rounded-[4px] bg-white p-5 shadow-xs" id="diagnostics-summary-card">
            <div className="flex items-center gap-2 mb-4">
              <Zap className="h-4 w-4 text-teal-600" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">Último Teste de Conexão</h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 font-sans">
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Data do Teste:</span>
                <span className="font-mono text-[11px] font-bold text-slate-800">
                  {gatewayAny.last_tested_at ? formatDate(gatewayAny.last_tested_at) : 'Nunca testado'}
                </span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Resultado:</span>
                {getTestStatusBadge(gatewayAny.last_test_status)}
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Mensagem do Teste:</span>
                <p className="text-[11px] font-mono leading-relaxed bg-slate-50 p-2 border.rounded-[3px] text-slate-700">
                  {gatewayAny.last_test_message || 'Nenhum histórico de mensagem disponível.'}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps status card */}
          <div className="border border-slate-200 rounded-[4px] bg-white p-5 shadow-xs" id="timestamps-card">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-slate-600" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">Histórico de Modificações</h3>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600">
              <div className="flex justify-between items-center text-[11px] font-sans">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Cadastrado em:</span>
                <span className="font-mono">{formatDate(gateway.created_at || (gateway as any).createdAt)}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] font-sans">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Última Atualização:</span>
                <span className="font-mono">{formatDate(gateway.updated_at || (gateway as any).updatedAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Credentials and JSON specifications */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credentials presence card */}
          <div className="border border-slate-200 rounded-[4px] bg-white p-6 shadow-xs" id="credentials-card">
            <div className="flex items-center gap-2 mb-4">
              <Key className="h-4 w-4 text-teal-600" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">Presence de Chaves & Assinaturas criptografadas</h3>
            </div>

            {/* Error Message notice if in error state */}
            {gateway.status === 'error' && gateway.status_message && (
              <div className="p-4 bg-rose-50 border border-rose-100 rounded-[4px] flex items-start gap-2.5 text-rose-800 mb-5 font-sans" id="error-status-notice font-sans">
                <AlertOctagon className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[10px] font-bold uppercase tracking-wider">Falha de Autenticação Identificada</h4>
                  <p className="text-[11px] text-rose-700 leading-relaxed mt-1 font-mono">{gateway.status_message}</p>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="credentials-grid">
              {/* Public Key Display */}
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-[4px] space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Chave Pública (Public Key)</h4>
                <div className="flex items-center justify-between text-xs font-sans">
                  {gateway.public_key ? (
                    <span className="font-mono text-slate-900 font-bold bg-white border border-slate-100 px-2 py-1 rounded-[3px] select-all truncate max-w-xs">{gateway.public_key}</span>
                  ) : gateway.has_public_key ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="h-4 w-4" /> Configurado no DB
                    </span>
                  ) : (
                    <span className="text-slate-400">Não Informado</span>
                  )}
                </div>
              </div>

              {/* Access Token Display */}
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-[4px] space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Token de Acesso (Access Token)</h4>
                <div className="flex items-center justify-between text-xs font-sans">
                  {gateway.has_access_token ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="h-4 w-4" /> Configurado no Servidor (Oculto)
                    </span>
                  ) : (
                    <span className="text-slate-400">Não Informado</span>
                  )}
                </div>
              </div>

              {/* Client ID Display */}
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-[4px] space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client ID</h4>
                <div className="flex items-center justify-between text-xs font-sans">
                  {gateway.client_id ? (
                    <span className="font-mono text-slate-900 font-bold bg-white border border-slate-100 px-2 py-1 rounded-[3px] select-all truncate max-w-xs">{gateway.client_id}</span>
                  ) : gateway.has_client_id ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="h-4 w-4" /> Configurado no DB
                    </span>
                  ) : (
                    <span className="text-slate-400">Não Informado</span>
                  )}
                </div>
              </div>

              {/* Client Secret Display */}
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-[4px] space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Client Secret</h4>
                <div className="flex items-center justify-between text-xs font-sans">
                  {gateway.has_client_secret ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="h-4 w-4" /> Configurado no Servidor (Oculto)
                    </span>
                  ) : (
                    <span className="text-slate-400">Não Informado</span>
                  )}
                </div>
              </div>

              {/* Webhook Secret Display */}
              <div className="p-4 border border-slate-100 bg-slate-50/50 rounded-[4px] space-y-2 md:col-span-2">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Webhook Signature Secret</h4>
                <div className="flex items-center justify-between text-xs font-sans">
                  {gateway.has_webhook_secret ? (
                    <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                      <CheckCircle2 className="h-4 w-4" /> Configurado no Servidor (Oculto)
                    </span>
                  ) : (
                    <span className="text-slate-400">Não Informado</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* config_json card */}
          <div className="border border-slate-200 rounded-[4px] bg-white p-6 shadow-xs" id="json-card">
            <div className="flex items-center gap-2 mb-3">
              <FileJson className="h-4 w-4 text-slate-600" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">Configuração JSON Avançada (config_json)</h3>
            </div>

            {gateway.config_json && Object.keys(gateway.config_json).length > 0 ? (
              <div className="relative group">
                <pre className="p-4 bg-slate-900 border border-slate-950 text-emerald-400 rounded-[4px] font-mono text-[11px] overflow-auto max-h-60 select-all leading-relaxed shadow-inner">
                  {JSON.stringify(gateway.config_json, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 bg-slate-50/50 rounded-[4px]" id="empty-json">
                <FileJson className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhum parâmetro JSON extra cadastrado neste processador.</p>
              </div>
            )}
          </div>

          {/* checkout_config segment */}
          <div className="border border-slate-200 rounded-[4px] bg-white p-6 shadow-xs" id="checkout-config-card">
            <div className="flex items-center gap-2 mb-3">
              <FileJson className="h-4 w-4 text-amber-500" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">Parâmetros de Checkout (checkout_config)</h3>
            </div>

            {gatewayAny.checkout_config && (Array.isArray(gatewayAny.checkout_config) ? gatewayAny.checkout_config.length > 0 : Object.keys(gatewayAny.checkout_config).length > 0) ? (
              <div className="relative group">
                <pre className="p-4 bg-slate-900 border border-slate-950 text-amber-400 rounded-[4px] font-mono text-[11px] overflow-auto max-h-60 select-all leading-relaxed shadow-inner">
                  {JSON.stringify(gatewayAny.checkout_config, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 bg-slate-50/50 rounded-[4px]" id="empty-checkout-config">
                <FileJson className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhum parâmetro de checkout_config opcional cadastrado neste processador.</p>
              </div>
            )}
          </div>

          {/* metadata segment */}
          <div className="border border-slate-200 rounded-[4px] bg-white p-6 shadow-xs" id="metadata-card">
            <div className="flex items-center gap-2 mb-3">
              <FileJson className="h-4 w-4 text-purple-600" />
              <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-800 font-mono">Dados de Metadados (metadata)</h3>
            </div>

            {gatewayAny.metadata && (Array.isArray(gatewayAny.metadata) ? gatewayAny.metadata.length > 0 : Object.keys(gatewayAny.metadata).length > 0) ? (
              <div className="relative group">
                <pre className="p-4 bg-slate-900 border border-slate-950 text-purple-400 rounded-[4px] font-mono text-[11px] overflow-auto max-h-60 select-all leading-relaxed shadow-inner">
                  {JSON.stringify(gatewayAny.metadata, null, 2)}
                </pre>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-slate-200 bg-slate-50/50 rounded-[4px]" id="empty-metadata">
                <FileJson className="h-6 w-6 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400">Nenhum parâmetro de metadata estruturado cadastrado neste processador.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Connection Diagnostic Modals */}
      <PaymentGatewayTestConnectionDialog
        isOpen={isTestOpen}
        gateway={gateway}
        onClose={async () => {
          setIsTestOpen(false);
          // Reload info as last tested could be updated
          await fetchDetails();
        }}
      />
    </div>
  );
};
