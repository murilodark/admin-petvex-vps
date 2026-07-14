import React, { useEffect, useState } from 'react';
import { PlusCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { PaymentGateway } from '../../../core/http/generated/models';
import { paymentGatewaysService } from '../services/payment-gateways.service';
import { ListarPaymentGatewaysParams } from '../types/payment-gateway.types';
import { PaymentGatewayFilters } from '../components/PaymentGatewayFilters';
import { PaymentGatewayTable } from '../components/PaymentGatewayTable';
import { PaymentGatewayDeleteDialog } from '../components/PaymentGatewayDeleteDialog';
import { PaymentGatewayTestConnectionDialog } from '../components/PaymentGatewayTestConnectionDialog';
import { PaymentGatewaySetDefaultDialog } from '../components/PaymentGatewaySetDefaultDialog';

interface PaymentGatewaysPageProps {
  onNavigate: (path: string) => void;
}

export const PaymentGatewaysPage: React.FC<PaymentGatewaysPageProps> = ({ onNavigate }) => {
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<ListarPaymentGatewaysParams>({
    page: 1,
    search: '',
    is_sandbox: 'all',
    provider: 'all',
    status: 'all',
    is_default: 'all',
  });

  // Dialog states
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);
  
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isSetDefaultOpen, setIsSetDefaultOpen] = useState(false);
  const [settingDefault, setSettingDefault] = useState(false);

  const [isTestOpen, setIsTestOpen] = useState(false);

  const fetchGateways = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await paymentGatewaysService.listarGateways(filters);
      setGateways(res.data);
      setTotal(res.total);
    } catch (err: any) {
      console.error('Failed to load payment gateways', err);
      setError(err?.message || 'Houve uma falha ao tentar consultar os gateways de pagamento.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGateways();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      search: '',
      is_sandbox: 'all',
      provider: 'all',
      status: 'all',
      is_default: 'all',
    });
  };

  // Actions trigger
  const handleTestConnectionTrigger = (id: string) => {
    const found = gateways.find(g => g.id === id);
    if (found) {
      setSelectedGateway(found);
      setIsTestOpen(true);
    }
  };

  const handleSetDefaultTrigger = (id: string) => {
    const found = gateways.find(g => g.id === id);
    if (found) {
      setSelectedGateway(found);
      setIsSetDefaultOpen(true);
    }
  };

  const handleDeleteTrigger = (id: string) => {
    const found = gateways.find(g => g.id === id);
    if (found) {
      setSelectedGateway(found);
      setIsDeleteOpen(true);
    }
  };

  // Actions execution
  const handleSetDefaultConfirm = async () => {
    if (!selectedGateway) return;
    try {
      setSettingDefault(true);
      await paymentGatewaysService.setarComoPadrao(selectedGateway.id);
      setIsSetDefaultOpen(false);
      setSelectedGateway(null);
      fetchGateways(); // refresh
    } catch (err: any) {
      alert(err.message || 'Erro ao tentar definir gateway como padrão.');
    } finally {
      setSettingDefault(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedGateway) return;
    try {
      setDeleting(true);
      await paymentGatewaysService.excluirGateway(selectedGateway.id);
      setIsDeleteOpen(false);
      setSelectedGateway(null);
      fetchGateways(); // refresh
    } catch (err: any) {
      alert(err.message || 'Ocorreu uma falha ao processar a exclusão do gateway.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 font-sans" id="payment-gateways-page-root">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5" id="payment-gateways-header font-sans">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase" id="page-title">
            Gateways de Pagamento
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            Parametrização global de credenciamento operacional e faturas para processamento SaaS de faturamento
          </p>
        </div>
        <button
          id="btn-trigger-create-gateway"
          onClick={() => onNavigate('/admin/billing/payment-gateways/create')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold tracking-widest uppercase rounded-[4px] shadow-sm cursor-pointer transition-all shrink-0 font-sans"
        >
          <PlusCircle className="h-4 w-4" />
          Cadastrar Gateway
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-[4px] flex items-center gap-2" id="payment-gateways-error-banner font-sans">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchGateways} className="ml-auto underline font-bold uppercase tracking-wider flex items-center gap-1 font-sans">
            <RefreshCw className="h-3 w-3 animate-spin" /> Reprocessar
          </button>
        </div>
      )}

      {/* Filters bar */}
      <PaymentGatewayFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
      />

      {/* Tables list */}
      <PaymentGatewayTable
        gateways={gateways}
        loading={loading}
        page={filters.page || 1}
        total={total}
        onPageChange={handlePageChange}
        onViewDetails={(id) => onNavigate(`/admin/billing/payment-gateways/${id}`)}
        onEdit={(id) => onNavigate(`/admin/billing/payment-gateways/${id}/edit`)}
        onDelete={handleDeleteTrigger}
        onTestConnection={handleTestConnectionTrigger}
        onSetDefault={handleSetDefaultTrigger}
      />

      {/* Actions overlay modals */}
      <PaymentGatewayDeleteDialog
        isOpen={isDeleteOpen}
        gateway={selectedGateway}
        onConfirm={handleDeleteConfirm}
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedGateway(null);
        }}
        isLoading={deleting}
      />

      <PaymentGatewaySetDefaultDialog
        isOpen={isSetDefaultOpen}
        gateway={selectedGateway}
        onConfirm={handleSetDefaultConfirm}
        onClose={() => {
          setIsSetDefaultOpen(false);
          setSelectedGateway(null);
        }}
        isLoading={settingDefault}
      />

      <PaymentGatewayTestConnectionDialog
        isOpen={isTestOpen}
        gateway={selectedGateway}
        onClose={() => {
          setIsTestOpen(false);
          setSelectedGateway(null);
          fetchGateways(); // refresh in case test logs fields are updated on backend
        }}
      />
    </div>
  );
};
