import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { PaymentGateway } from '../../../../core/http/generated/models';
import { paymentGatewaysService } from '../services/payment-gateways.service';
import { PaymentGatewayFormData } from '../types/payment-gateway.types';
import { PaymentGatewayForm } from '../components/PaymentGatewayForm';

interface PaymentGatewayFormPageProps {
  onNavigate: (path: string) => void;
}

export const PaymentGatewayFormPage: React.FC<PaymentGatewayFormPageProps> = ({ onNavigate }) => {
  const path = window.location.pathname;
  const isEdit = path.endsWith('/edit');

  const [initialData, setInitialData] = useState<PaymentGateway | undefined>(undefined);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Extract ID if editable
  let gatewayId = '';
  if (isEdit) {
    const segments = path.split('/');
    gatewayId = segments[4] || '';
  }

  useEffect(() => {
    if (isEdit && gatewayId) {
      const loadInitialGateway = async () => {
        try {
          setLoading(true);
          setError(null);
          const data = await paymentGatewaysService.buscarGatewayPorId(gatewayId);
          setInitialData(data);
        } catch (err: any) {
          console.error('Failed to load initial payment gateway details', err);
          setError(err.message || 'Falha ao buscar as configurações do gateway.');
        } finally {
          setLoading(false);
        }
      };
      loadInitialGateway();
    }
  }, [isEdit, gatewayId]);

  const handleFormSubmit = async (formData: PaymentGatewayFormData) => {
    try {
      setSaving(true);
      if (isEdit && gatewayId) {
        await paymentGatewaysService.atualizarGateway(gatewayId, formData);
      } else {
        await paymentGatewaysService.cadastrarGateway(formData);
      }
      onNavigate('/admin/billing/payment-gateways');
    } catch (err: any) {
      console.error('Failed to submit payment gateway form:', err);
      throw err; // propagates down to the component form and displays as standard validation/server error alert
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-12 text-center bg-white border border-slate-200 rounded-[4px] shadow-xs font-sans" id="form-loading-state">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Carregando informações cadastrais...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans animate-fade-in" id="payment-gateway-form-page">
      {/* Header with back button */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5" id="form-page-header">
        <div>
          <button
            onClick={() => onNavigate('/admin/billing/payment-gateways')}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 text-[10px] font-bold uppercase tracking-wider mb-2 group transition-colors cursor-pointer"
            id="btn-back-to-list"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Voltar para listagem
          </button>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight" id="page-title">
            {isEdit ? 'Editar Gateway de Pagamento' : 'Cadastrar Gateway de Pagamento'}
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            {isEdit 
              ? 'Visualize paramentos e atualize chaves criptográficas de comunicação de furos do faturamento' 
              : 'Configure um novo canal global para processamento de transações SaaS'}
          </p>
        </div>
      </div>

      {error ? (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-5 rounded-[4px] flex items-start gap-2" id="form-page-error-banner">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold uppercase tracking-wider mb-1">Houve um erro grave</h4>
            <p className="text-[11px] leading-relaxed mb-4">{error}</p>
            <button
              onClick={() => onNavigate('/admin/billing/payment-gateways')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-[4px] font-bold uppercase tracking-wider text-[10px]"
            >
              Voltar ao Painel
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[4px] p-6 shadow-xs" id="form-container">
          <PaymentGatewayForm
            initialData={initialData}
            onSubmit={handleFormSubmit}
            onCancel={() => onNavigate('/admin/billing/payment-gateways')}
            isLoading={saving}
          />
        </div>
      )}
    </div>
  );
};
