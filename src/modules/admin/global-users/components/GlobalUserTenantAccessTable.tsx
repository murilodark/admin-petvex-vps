import React from 'react';
import { ShieldCheck, Edit3, UserMinus, Plus, Calendar, Settings } from 'lucide-react';
import { GlobalUserTenantAccess } from '../types/global-user.types';
import { Badge } from '../../../../shared/components/ui/Badge';
import { Button } from '../../../../shared/components/ui/Button';

interface GlobalUserTenantAccessTableProps {
  accessList: GlobalUserTenantAccess[];
  loading: boolean;
  onAddAccess: () => void;
  onEditAccess: (access: GlobalUserTenantAccess) => void;
  onDeleteAccess: (access: GlobalUserTenantAccess) => void;
}

export const GlobalUserTenantAccessTable: React.FC<GlobalUserTenantAccessTableProps> = ({
  accessList,
  loading,
  onAddAccess,
  onEditAccess,
  onDeleteAccess,
}) => {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-8 text-center" id="tenant-links-loading">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-teal-500 border-t-transparent mb-2" />
        <p className="text-slate-400 font-medium text-[11px] uppercase tracking-wider">Buscando permissões vinculadas...</p>
      </div>
    );
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'owner':
        return <Badge variant="success" className="bg-teal-500/10 text-teal-700 border-teal-500/20">Dono (Owner)</Badge>;
      case 'manager':
        return <Badge variant="warn">Gerente (Manager)</Badge>;
      default:
        return <Badge variant="gray">Colaborador (User)</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="border border-slate-200 bg-white rounded-[4px] overflow-hidden" id="tenant-access-panel">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50" id="access-panel-header">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-teal-600 shrink-0" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">Associação com Tenants SaaS</h4>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Controla vínculos e escopos operacionais de clínicas parceiras</p>
          </div>
        </div>
        <Button
          id="btn-add-tenant-link"
          variant="primary"
          size="sm"
          onClick={onAddAccess}
          className="gap-1.5"
        >
          <Plus className="h-3.5 w-3.5" />
          Novo Vínculo
        </Button>
      </div>

      {accessList.length === 0 ? (
        <div className="p-10 text-center" id="access-list-empty">
          <Settings className="h-8 w-8 text-slate-300 mx-auto mb-2" />
          <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Nenhum Vínculo Registrado</h5>
          <p className="text-[10px] text-slate-400 mt-1 max-w-xs mx-auto uppercase">Este usuário não está associado a nenhuma clínica SaaS no momento.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse" id="tenant-access-table">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[9px] uppercase font-bold tracking-wider">
                <th className="px-6 py-3.5">Parceiro Tenant</th>
                <th className="px-6 py-3.5">Identificador Slug</th>
                <th className="px-6 py-3.5">Perfil Operacional</th>
                <th className="px-6 py-3.5">Restrição Status</th>
                <th className="px-6 py-3.5">Criado em</th>
                <th className="px-6 py-3.5">Atualizado em</th>
                <th className="px-6 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {accessList.map((a) => (
                <tr key={a.id} id={`access-row-${a.id}`} className="hover:bg-slate-50/40 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900">{a.tenantName}</td>
                  <td className="px-6 py-3.5 font-mono text-slate-500">/{a.tenantSlug || a.tenantId}</td>
                  <td className="px-6 py-3.5">{getRoleBadge(a.role)}</td>
                  <td className="px-6 py-3.5">
                    {a.active ? (
                      <Badge variant="success">Regular</Badge>
                    ) : (
                      <Badge variant="danger">Suspenso</Badge>
                    )}
                  </td>
                  <td className="px-6 py-3.5 font-mono text-slate-500 whitespace-nowrap">{formatDate(a.createdAt)}</td>
                  <td className="px-6 py-3.5 font-mono text-slate-500 whitespace-nowrap">{formatDate(a.updatedAt)}</td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1" id={`access-actions-${a.id}`}>
                      <button
                        id={`access-action-edit-${a.id}`}
                        onClick={() => onEditAccess(a)}
                        title="Modificar Vínculo"
                        className="p-1 px-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 rounded-xs border border-transparent hover:border-amber-100 transition-all cursor-pointer"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        id={`access-action-revoke-${a.id}`}
                        onClick={() => onDeleteAccess(a)}
                        title="Revogar Acesso"
                        className="p-1 px-2 text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xs border border-transparent hover:border-rose-100 transition-all cursor-pointer"
                      >
                        <UserMinus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
