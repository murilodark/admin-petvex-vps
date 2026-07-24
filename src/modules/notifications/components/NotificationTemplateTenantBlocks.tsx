import React, { useState, useEffect } from 'react';
import {
  X,
  Shield,
  Trash2,
  AlertTriangle,
  Plus,
  ShieldAlert,
  Loader,
  Search,
} from 'lucide-react';
import { tenantsService } from '../../tenants/services/tenants.service';
import { notificationService } from '../services/notification.service';
import { NotificationTemplate, TenantBlock } from '../types/notification';

interface NotificationTemplateTenantBlocksProps {
  template: NotificationTemplate;
  onClose: () => void;
  onUpdateCount: () => void; // Trigger stats refresh
}

export const NotificationTemplateTenantBlocks: React.FC<NotificationTemplateTenantBlocksProps> = ({
  template,
  onClose,
  onUpdateCount,
}) => {
  const [blocks, setBlocks] = useState<TenantBlock[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [selectedTenantId, setSelectedTenantId] = useState('');
  const [blockReason, setBlockReason] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBlocks();
    fetchTenants();
  }, [template.id]);

  const fetchBlocks = async () => {
    setIsLoadingBlocks(true);
    try {
      const data = await notificationService.listTenantBlocks(template.id);
      setBlocks(data || []);
    } catch (err: any) {
      console.error('Error fetching tenant blocks:', err);
    } finally {
      setIsLoadingBlocks(false);
    }
  };

  const fetchTenants = async () => {
    try {
      const result = await tenantsService.listarTenants({ perPage: 100 });
      setTenants(result.data || []);
    } catch (err) {
      console.error('Error loading tenants:', err);
    }
  };

  const handleBlockTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) {
      setError('Por favor, selecione uma clínica para bloquear.');
      return;
    }

    // Verify if already blocked
    if (blocks.some((b) => b.tenant_id === selectedTenantId)) {
      setError('Esta clínica já está bloqueada para este template.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await notificationService.blockTenant(template.id, {
        tenant_id: Number(selectedTenantId),
        reason: blockReason || 'Bloqueio preventivo administrativo',
      });
      setSelectedTenantId('');
      setBlockReason('');
      await fetchBlocks();
      onUpdateCount();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Falha ao efetuar o bloqueio da clínica.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnblockTenant = async (blockId: string) => {
    if (!window.confirm('Tem certeza de que deseja liberar o envio de notificações para esta clínica?')) {
      return;
    }

    try {
      await notificationService.unblockTenant(template.id, blockId);
      await fetchBlocks();
      onUpdateCount();
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Falha ao liberar a clínica.');
    }
  };

  // Filter out tenants that are already blocked so we don't display them in select dropdown
  const availableTenants = tenants.filter(
    (t) => !blocks.some((b) => b.tenant_id === t.id)
  );

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex justify-center items-center z-50 animate-fade-in" id="tenant-blocks-modal-backdrop">
      <div className="bg-slate-950 border border-slate-800 w-full max-w-2xl rounded-[4px] shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        
        {/* Header */}
        <div className="bg-slate-900 border-b border-slate-800 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-rose-500" />
            <div className="space-y-0.5">
              <h3 className="font-sans font-bold text-sm text-white">
                Bloqueio de Clínicas (Tenants)
              </h3>
              <p className="text-[10px] text-slate-500">
                Template: <span className="text-teal-400 font-mono font-medium">{template.key}</span> ({template.name})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 bg-slate-950 hover:bg-slate-800 rounded border border-slate-850 text-slate-400 hover:text-white transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Section 1: Add new Block */}
          <form onSubmit={handleBlockTenant} className="bg-slate-900/40 p-4 border border-slate-800 rounded-[4px] space-y-4">
            <h4 className="font-sans font-bold text-[10px] uppercase tracking-widest text-slate-300 flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 text-teal-400" /> Impedir envio para clínica específica
            </h4>

            {error && (
              <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded text-[11px] font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Select Tenant */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Selecione a Clínica</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-[4px] p-2 text-xs text-slate-300 focus:outline-none focus:border-teal-500"
                >
                  <option value="">Selecione uma clínica...</option>
                  {availableTenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} (ID: {t.id})
                    </option>
                  ))}
                </select>
              </div>

              {/* Input Reason */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Motivo do Bloqueio</label>
                <input
                  type="text"
                  placeholder="ex: Solicitação do cliente / Limitação de cotas"
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-[4px] p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="submit"
                disabled={isSubmitting || !selectedTenantId}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white font-semibold rounded-[4px] text-xs transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader className="h-3 w-3 animate-spin" /> Processando...
                  </>
                ) : (
                  <>
                    <Shield className="h-3.5 w-3.5" /> Bloquear Clínica
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Section 2: Active Blocks list */}
          <div className="space-y-3">
            <h4 className="font-sans font-bold text-[10px] uppercase tracking-widest text-slate-400">
              Clínicas Atualmente Bloqueadas para este Template ({blocks.length})
            </h4>

            {isLoadingBlocks ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Carregando registros de restrições...
              </div>
            ) : blocks.length === 0 ? (
              <div className="p-8 border border-dashed border-slate-800 text-center text-slate-500 text-xs rounded-[4px]">
                Nenhuma restrição ativa. Todas as clínicas podem receber disparos deste template.
              </div>
            ) : (
              <div className="border border-slate-800 rounded-[4px] overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-950/40 text-[10px] text-slate-500 uppercase tracking-widest">
                      <th className="p-3 font-bold">Clínica (Tenant)</th>
                      <th className="p-3 font-bold">Motivo do Bloqueio</th>
                      <th className="p-3 font-bold text-right">Ação</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {blocks.map((block) => (
                      <tr key={block.id} className="hover:bg-slate-950/20">
                        {/* Tenant Name */}
                        <td className="p-3 font-medium text-slate-200">
                          {block.tenant?.name || `Clínica ID: ${block.tenant_id}`}
                        </td>
                        {/* Reason */}
                        <td className="p-3 text-slate-400 max-w-xs truncate" title={block.block_reason || ''}>
                          {block.block_reason || <span className="text-slate-600 italic">Sem motivo descrito</span>}
                        </td>
                        {/* Action */}
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleUnblockTenant(block.id)}
                            className="p-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-rose-400 hover:text-rose-300 transition-all"
                            title="Remover Bloqueio"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="bg-slate-900 border-t border-slate-800 p-3.5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-950 border border-slate-850 hover:bg-slate-900 text-xs font-semibold text-slate-300 rounded-[4px] transition-all"
          >
            Fechar
          </button>
        </div>

      </div>
    </div>
  );
};
