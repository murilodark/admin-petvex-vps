import React, { useState, useEffect } from 'react';
import { KeyRound, ShieldAlert, AlertTriangle, Code, Play, CheckCircle2, XCircle } from 'lucide-react';
import { PaymentGateway } from '../../../core/http/generated/models';
import { PaymentGatewayFormData } from '../types/payment-gateway.types';
import { Button } from '../../../shared/components/ui/Button';
import { Input } from '../../../shared/components/ui/Input';
import { paymentGatewayMapper } from '../mappers/payment-gateway.mapper';
import { ApiErrorAlert } from '../../../shared/components/ui/ApiErrorAlert';
import { apiErrorHelper } from '../../../common/helpers/api-error.helper';

interface PaymentGatewayFormProps {
  initialData?: PaymentGateway;
  onSubmit: (data: PaymentGatewayFormData) => Promise<void>;
  onCancel: () => void;
  isLoading: boolean;
}

export const PaymentGatewayForm: React.FC<PaymentGatewayFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const isEdit = !!initialData;
  const [formData, setFormData] = useState<PaymentGatewayFormData>({
    name: '',
    provider: 'mercado_pago',
    status: 'testing',
    is_sandbox: true,
    is_default: false,
    webhook_url: '',
    public_key: '',
    access_token: '',
    client_id: '',
    client_secret: '',
    webhook_secret: '',
    config_json_string: '{}',
    checkout_config_string: '{}',
    metadata_string: '{}',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<any>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(paymentGatewayMapper.toFormData(initialData));
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let resolvedValue: any = value;
    if (type === 'checkbox') {
      resolvedValue = (e.target as HTMLInputElement).checked;
    }

    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: resolvedValue,
      };

      // Automatically turn off default if status changes to anything that is not 'active'
      if (name === 'status' && resolvedValue !== 'active') {
        updated.is_default = false;
      }

      return updated;
    });

    // Clear field-specific error
    if (errors[name]) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy[name];
        return copy;
      });
    }
  };

  const handleCheckboxChange = (name: 'is_sandbox' | 'is_default') => {
    setFormData(prev => {
      if (name === 'is_default' && prev.status !== 'active') {
        return prev;
      }
      return {
        ...prev,
        [name]: !prev[name],
      };
    });
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome do Gateway é obrigatório.';
    }

    if (formData.is_default && formData.status !== 'active') {
      newErrors.is_default = 'Somente gateways ativos podem ser definidos como padrão.';
    }

    // JSON parsing check for config_json
    if (formData.config_json_string && formData.config_json_string.trim() !== '') {
      try {
        JSON.parse(formData.config_json_string);
      } catch (e) {
        newErrors.config_json_string = 'Formato JSON inválido. Verifique vírgulas, chaves e aspas duplas.';
      }
    }

    // JSON parsing check for checkout_config
    if (formData.checkout_config_string && formData.checkout_config_string.trim() !== '') {
      try {
        JSON.parse(formData.checkout_config_string);
      } catch (e) {
        newErrors.checkout_config_string = 'Formato JSON inválido para checkout_config.';
      }
    }

    // JSON parsing check for metadata
    if (formData.metadata_string && formData.metadata_string.trim() !== '') {
      try {
        JSON.parse(formData.metadata_string);
      } catch (e) {
        newErrors.metadata_string = 'Formato JSON inválido para metadata.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validate()) return;

    try {
      await onSubmit(formData);
    } catch (err: any) {
      console.error('Error submitting payment gateway form:', err);
      setApiError(err);
      const nestedErrors = apiErrorHelper.extractFormErrors(err);
      if (Object.keys(nestedErrors).length > 0) {
        setErrors(prev => ({
          ...prev,
          ...nestedErrors
        }));
      }
    }
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6 font-sans text-slate-800" id="payment-gateway-form">
      {apiError && (
        <ApiErrorAlert error={apiError} onClear={() => setApiError(null)} />
      )}

      {/* Basic Settings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div>
          <Input
            id="gateway-name-input"
            label="Nome do Gateway"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            placeholder="Ex: Mercado Pago Conta Corporativa"
            disabled={isLoading}
          />
        </div>

        <div className="flex flex-col gap-1.5" id="provider-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Provedor</label>
          <select
            id="gateway-provider-select"
            name="provider"
            value={formData.provider}
            onChange={handleChange}
            disabled={isLoading || isEdit}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow text-slate-700 font-bold uppercase tracking-wide"
          >
            <option value="mercado_pago">Mercado Pago</option>
            <option value="pagseguro">PagSeguro</option>
            <option value="iugu">Iugu</option>
            <option value="stripe">Stripe</option>
            <option value="asaas">Asaas</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5" id="status-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Status</label>
          <select
            id="gateway-status-select"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow text-slate-700 font-bold uppercase tracking-wide"
          >
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="testing">Em Testes</option>
            <option value="error">Erro</option>
          </select>
        </div>
      </div>

      {/* Webhook and Switched Controls Segment */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 border border-slate-100 rounded-[4px] p-5 bg-slate-50/50" id="controls-segment">
        {/* Gateway Padrao Checkbox / Switch */}
        <div className="flex flex-col gap-1.5 p-3 bg-white border border-slate-200/60 rounded-[4px] shadow-2xs" id="is-default-container">
          <div className="flex items-start gap-3">
            <input
              id="gateway-default-checkbox"
              name="is_default"
              type="checkbox"
              checked={formData.is_default && formData.status === 'active'}
              onChange={() => handleCheckboxChange('is_default')}
              disabled={isLoading || formData.status !== 'active'}
              className="mt-1 h-4 w-4 text-teal-600 border-slate-300 rounded-sm focus:ring-teal-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div className="text-xs">
              <label htmlFor="gateway-default-checkbox" className={`font-bold uppercase tracking-wider text-[11px] cursor-pointer ${formData.status !== 'active' ? 'text-slate-400 cursor-not-allowed' : 'text-slate-800'}`}>
                Gateway Padrão
              </label>
              <p className="text-slate-400 mt-1 leading-relaxed text-[10px]">
                Define se este processador de pagamento é o gateway mestre para remissões de faturas gerais do SaaS.
              </p>
              {formData.status !== 'active' && (
                <p className="text-amber-600 mt-1.5 font-bold text-[9px] uppercase tracking-wider bg-amber-50 border border-amber-100 p-1.5 rounded-[3px]">
                  Somente gateways ativos podem ser definidos como padrão.
                </p>
              )}
            </div>
          </div>
          {errors.is_default && (
            <span className="text-xs text-rose-600 font-bold tracking-wide mt-2 block border-t border-rose-100 pt-1.5">{errors.is_default}</span>
          )}
        </div>

        {/* Modo Homologacao (Sandbox) */}
        <div className="flex items-start gap-3 p-3 bg-white border border-slate-200/60 rounded-[4px] shadow-2xs" id="is-sandbox-container">
          <input
            id="gateway-sandbox-checkbox"
            name="is_sandbox"
            type="checkbox"
            checked={formData.is_sandbox}
            onChange={() => handleCheckboxChange('is_sandbox')}
            disabled={isLoading}
            className="mt-1 h-4 w-4 text-teal-600 border-slate-300 rounded-sm focus:ring-teal-500 cursor-pointer"
          />
          <div className="text-xs">
            <label htmlFor="gateway-sandbox-checkbox" className="font-bold text-slate-800 cursor-pointer uppercase tracking-wider text-[11px]">
              Modo Homologação (Sandbox)
            </label>
            <p className="text-slate-400 mt-1 leading-relaxed text-[10px]">
              Indica se as requisições financeiras operacionais devem trafegar em ambiente de testes ou produção.
            </p>
          </div>
        </div>

        {/* Webhook Link input */}
        <div className="flex flex-col gap-1.5" id="webhook-link-container">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Link do Webhook</label>
          <div className="relative">
            <input
              id="gateway-webhook-url-input"
              type="text"
              name="webhook_url"
              value={formData.webhook_url || ''}
              onChange={handleChange}
              placeholder="Configure a URL de retorno de chamada de pagamentos"
              disabled={isLoading}
              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 text-xs rounded-[4px] focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow text-slate-700 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Credentials Segment */}
      <div className="border border-slate-200 rounded-[4px] p-5 bg-white shadow-xs" id="form-credentials-panel">
        <div className="flex items-center gap-2 mb-4">
          <KeyRound className="h-4 w-4 text-teal-600" />
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">Credenciais & Chaves de API</h4>
        </div>

        <p className="text-[10px] text-slate-400 leading-relaxed max-w-2xl mb-4 font-normal">
          Defina as chaves secretas para conexão. Em modo de faturamento padrão, as credenciais sensíveis não são exibidas por segurança do aplicativo. Preencha apenas os campos desejados para alterar ou atualizar seus valores.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Public Key */}
          <div className="relative">
            <Input
              id="gateway-public-key"
              label="Chave Pública (Public Key)"
              name="public_key"
              value={formData.public_key}
              onChange={handleChange}
              placeholder="Ex: APP_USR-xxx ou pk_live_xxx"
              disabled={isLoading}
            />
            {isEdit && (
              <span className={`absolute right-3 top-9 inline-flex py-0.5 px-1.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-[3px] ${
                initialData?.has_public_key ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}>
                {initialData?.has_public_key ? "Configurado" : "Não configurado"}
              </span>
            )}
          </div>

          {/* Access Token */}
          <div className="relative">
            <Input
              id="gateway-access-token"
              label="Token de Acesso (Access Token)"
              name="access_token"
              type="password"
              value={formData.access_token}
              onChange={handleChange}
              placeholder={isEdit && initialData?.has_access_token ? "•••••••••••••••••••••••• (Inalterado)" : "Ex: APP_USR-xxx ou sk_live_xxx"}
              disabled={isLoading}
            />
            {isEdit && (
              <span className={`absolute right-3 top-9 inline-flex py-0.5 px-1.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-[3px] ${
                initialData?.has_access_token ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}>
                {initialData?.has_access_token ? "Configurado" : "Não configurado"}
              </span>
            )}
          </div>

          {/* Client ID */}
          <div className="relative">
            <Input
              id="gateway-client-id"
              label="Client ID (Opcional)"
              name="client_id"
              value={formData.client_id}
              onChange={handleChange}
              placeholder="Ex: ca_xxx ou client_secret_id_xxx"
              disabled={isLoading}
            />
            {isEdit && (
              <span className={`absolute right-3 top-9 inline-flex py-0.5 px-1.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-[3px] ${
                initialData?.has_client_id ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}>
                {initialData?.has_client_id ? "Configurado" : "Não configurado"}
              </span>
            )}
          </div>

          {/* Client Secret */}
          <div className="relative">
            <Input
              id="gateway-client-secret"
              label="Client Secret (Opcional)"
              name="client_secret"
              type="password"
              value={formData.client_secret}
              onChange={handleChange}
              placeholder={isEdit && initialData?.has_client_secret ? "•••••••••••••••••••••••• (Inalterado)" : "Ex: Client Secret API Key"}
              disabled={isLoading}
            />
            {isEdit && (
              <span className={`absolute right-3 top-9 inline-flex py-0.5 px-1.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-[3px] ${
                initialData?.has_client_secret ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}>
                {initialData?.has_client_secret ? "Configurado" : "Não configurado"}
              </span>
            )}
          </div>

          {/* Webhook Secret */}
          <div className="relative md:col-span-2">
            <Input
              id="gateway-webhook-secret"
              label="Assinatura Webhook (Webhook Secret / Endpoint Secret)"
              name="webhook_secret"
              type="password"
              value={formData.webhook_secret}
              onChange={handleChange}
              placeholder={isEdit && initialData?.has_webhook_secret ? "•••••••••••••••••••••••• (Inalterado)" : "Ex: whsec_xxx"}
              disabled={isLoading}
            />
            {isEdit && (
              <span className={`absolute right-3 top-9 inline-flex py-0.5 px-1.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-[3px] ${
                initialData?.has_webhook_secret ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-200"
              }`}>
                {initialData?.has_webhook_secret ? "Configurado" : "Não configurado"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Advanced JSON parameters config and JSON Setup (Bento Configuration) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" id="json-parameters-segment">
        {/* config_json Area */}
        <div className="border border-slate-200 rounded-[4px] p-5 bg-white shadow-xs" id="form-config-json-panel">
          <div className="flex items-center gap-2 mb-3">
            <Code className="h-4 w-4 text-slate-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">Parâmetros Customizados (config_json)</h4>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <textarea
                id="gateway-config-json-textarea"
                name="config_json_string"
                rows={5}
                value={formData.config_json_string || '{}'}
                onChange={handleChange}
                disabled={isLoading}
                placeholder={`{\n  "custom_webhook_url": "https://api.petvex.com.br/api/v1/webhooks/payment",\n  "max_retries": 3,\n  "preferred_installments": 12\n}`}
                className={`w-full p-3 font-mono text-xs border rounded-[4px] bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none h-36 ${errors.config_json_string ? 'border-rose-500' : 'border-slate-200'}`}
              />
            </div>
            {errors.config_json_string ? (
              <span className="text-xs text-rose-600 font-bold font-mono tracking-wide mt-1 block">{errors.config_json_string}</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-normal leading-relaxed block">
                Insira parâmetros avançados de dict JSON.
              </span>
            )}
          </div>
        </div>

        {/* checkout_config Area */}
        <div className="border border-slate-200 rounded-[4px] p-5 bg-white shadow-xs" id="form-checkout-config-panel">
          <div className="flex items-center gap-2 mb-3">
            <Code className="h-4 w-4 text-amber-500" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">Parâmetros de Checkout (checkout_config)</h4>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <textarea
                id="gateway-checkout-config-textarea"
                name="checkout_config_string"
                rows={5}
                value={formData.checkout_config_string || '{}'}
                onChange={handleChange}
                disabled={isLoading}
                placeholder={`{\n  "theme": "dark",\n  "success_url": "https://petvex.com/success"\n}`}
                className={`w-full p-3 font-mono text-xs border rounded-[4px] bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none h-36 ${errors.checkout_config_string ? 'border-rose-500' : 'border-slate-200'}`}
              />
            </div>
            {errors.checkout_config_string ? (
              <span className="text-xs text-rose-600 font-bold font-mono tracking-wide mt-1 block">{errors.checkout_config_string}</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-normal leading-relaxed block">
                Atributos contextuais para fluxo e estilização de formulários de checkout de terceiros.
              </span>
            )}
          </div>
        </div>

        {/* metadata Area */}
        <div className="border border-slate-200 rounded-[4px] p-5 bg-white shadow-xs" id="form-metadata-panel">
          <div className="flex items-center gap-2 mb-3">
            <Code className="h-4 w-4 text-purple-600" />
            <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-800">Dados de Metadados (metadata)</h4>
          </div>

          <div className="space-y-3">
            <div className="relative">
              <textarea
                id="gateway-metadata-textarea"
                name="metadata_string"
                rows={5}
                value={formData.metadata_string || '{}'}
                onChange={handleChange}
                disabled={isLoading}
                placeholder={`{\n  "department": "finance",\n  "integration_revision": "v2.1"\n}`}
                className={`w-full p-3 font-mono text-xs border rounded-[4px] bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all resize-none h-36 ${errors.metadata_string ? 'border-rose-500' : 'border-slate-200'}`}
              />
            </div>
            {errors.metadata_string ? (
              <span className="text-xs text-rose-600 font-bold font-mono tracking-wide mt-1 block">{errors.metadata_string}</span>
            ) : (
              <span className="text-[10px] text-slate-400 font-normal leading-relaxed block">
                Pares adicionais de chave-valor para armazenamento estruturado livre no processador.
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100" id="form-actions">
        <Button
          id="btn-cancel-gateway-form"
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button
          id="btn-submit-gateway-form"
          type="submit"
          isLoading={isLoading}
        >
          {isEdit ? 'Salvar Configurações' : 'Cadastrar Gateway'}
        </Button>
      </div>
    </form>
  );
};
