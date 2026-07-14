import React, { useEffect, useState } from 'react';
import { Receipt, ShieldAlert, RefreshCw } from 'lucide-react';
import { Invoice } from '../../../core/http/generated/models';
import { billingAdminService } from '../services/billing-admin.service';
import { ListarInvoicesParams } from '../types/billing-admin.types';
import { InvoiceFilters } from '../components/InvoiceFilters';
import { InvoiceTable } from '../components/InvoiceTable';
import { InvoiceDetailsModal } from '../components/InvoiceDetailsModal';

interface InvoicesPageProps {
  onNavigate: (path: string) => void;
}

export const InvoicesPage: React.FC<InvoicesPageProps> = ({ onNavigate }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters state
  const [filters, setFilters] = useState<ListarInvoicesParams>({
    page: 1,
    tenant_id: '',
    subscription_id: '',
    status: 'all',
  });

  // Details modal State
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await billingAdminService.listarInvoices(filters);
      setInvoices(res.data);
      setTotal(res.total);
    } catch (err: any) {
      console.error('Failed to load faturas list', err);
      setError(err?.message || 'Falha ao sincronizar histórico de faturas com o banco de dados.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      tenant_id: '',
      subscription_id: '',
      status: 'all',
    });
  };

  return (
    <div className="space-y-6 font-sans" id="invoices-page-root">
      {/* Toolbar heading */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-200 p-6 rounded-[4px]" id="invoices-module-toolbar">
        <div className="text-left">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-teal-50 rounded-[4px] border border-teal-100 flex items-center justify-center shrink-0">
              <Receipt className="h-4.5 w-4.5 text-teal-600" />
            </span>
            <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
              Controle de Faturas SaaS
            </h3>
          </div>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-1.5 pl-9">
            Visualize as faturas mensais, acompanhe os ciclos de faturamento e extraia relatórios contratuais de estabelecimentos
          </p>
        </div>

        <button
          id="btn-sync-invoices"
          onClick={fetchInvoices}
          disabled={loading}
          className="flex items-center gap-2 text-xs font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 px-4 py-2.5 rounded-[4px] cursor-pointer transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          SINCROINIZAR DADOS
        </button>
      </div>

      {/* Errors display */}
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-[4px] flex items-center gap-2 animate-fade-in" id="invoices-error-banner">
          <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Visual Filters */}
      <InvoiceFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
      />

      {/* Listing layout */}
      <InvoiceTable
        data={invoices}
        total={total}
        page={filters.page || 1}
        lastPage={Math.ceil(total / 10) || 1}
        onPageChange={handlePageChange}
        onView={(inv) => {
          setSelectedInvoice(inv);
          setIsDetailOpen(true);
        }}
      />

      {/* Dossiê dialog */}
      <InvoiceDetailsModal
        invoice={selectedInvoice}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedInvoice(null);
        }}
      />
    </div>
  );
};
