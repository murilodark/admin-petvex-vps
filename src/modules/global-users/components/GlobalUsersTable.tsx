import React from 'react';
import { Eye, Edit, Trash2, Shield, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { GlobalUser } from '../types/global-user.types';
import { Badge } from '../../../shared/components/ui/Badge';

interface GlobalUsersTableProps {
  users: GlobalUser[];
  loading: boolean;
  page: number;
  perPage: number;
  total: number;
  onPageChange: (page: number) => void;
  onViewDetails: (user: GlobalUser) => void;
  onEdit: (user: GlobalUser) => void;
  onDelete: (user: GlobalUser) => void;
}

export const GlobalUsersTable: React.FC<GlobalUsersTableProps> = ({
  users,
  loading,
  page,
  perPage,
  total,
  onPageChange,
  onViewDetails,
  onEdit,
  onDelete,
}) => {
  const lastPage = Math.ceil(total / perPage) || 1;

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center" id="users-table-loading">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-teal-500 border-t-transparent mb-3" />
        <p className="text-slate-400 font-medium text-xs uppercase tracking-wider">Carregando usuários globais...</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-[4px] p-12 text-center" id="users-table-empty">
        <User className="h-10 w-10 text-slate-300 mx-auto mb-3" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Nenhum Usuário Localizado</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">Tente redefinir seus filtros de pesquisa ou cadastrar um novo usuário.</p>
      </div>
    );
  }

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-xs overflow-hidden" id="global-users-table-container">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="global-users-table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
              <th className="px-6 py-4">Nome completo</th>
              <th className="px-6 py-4">Endereço de e-mail</th>
              <th className="px-6 py-4">Perfil / Acesso</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Criado em</th>
              <th className="px-6 py-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {users.map((u) => (
              <tr key={u.id} id={`user-row-${u.id}`} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 font-bold text-slate-900">
                  <div className="flex items-center gap-2">
                    {u.isGlobalAdmin ? (
                      <Shield className="h-4 w-4 text-teal-600 shrink-0" />
                    ) : (
                      <User className="h-4 w-4 text-slate-400 shrink-0" />
                    )}
                    <span>{u.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-mono text-slate-500">{u.email}</td>
                <td className="px-6 py-4">
                  {u.isGlobalAdmin ? (
                    <Badge variant="success" className="bg-teal-500/10 text-teal-700 border-teal-500/20">
                      Administrador Global
                    </Badge>
                  ) : (
                    <Badge variant="gray" className="bg-slate-100 text-slate-600 border-slate-200">
                      Membro de Tenants
                    </Badge>
                  )}
                </td>
                <td className="px-6 py-4">
                  {u.active ? (
                    <Badge variant="success">Permitido</Badge>
                  ) : (
                    <Badge variant="danger">Bloqueado</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-center font-mono text-slate-500">{formatDate(u.createdAt)}</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5" id={`user-actions-${u.id}`}>
                    <button
                      id={`user-action-details-${u.id}`}
                      onClick={() => onViewDetails(u)}
                      title="Ver Detalhes & Vínculos de Tenants"
                      className="p-2 text-slate-500 hover:text-teal-600 hover:bg-slate-100 rounded-sm transition-all cursor-pointer"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      id={`user-action-edit-${u.id}`}
                      onClick={() => onEdit(u)}
                      title="Editar Usuário"
                      className="p-2 text-slate-500 hover:text-amber-600 hover:bg-slate-100 rounded-sm transition-all cursor-pointer"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      id={`user-action-delete-${u.id}`}
                      onClick={() => onDelete(u)}
                      title="Excluir Usuário"
                      className="p-2 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-sm transition-all cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50" id="global-users-pagination">
        <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">
          Exibindo {users.length} de {total} registros
        </span>
        <div className="flex items-center gap-2">
          <button
            id="pagination-prev"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="p-2 border border-slate-200 bg-white rounded-[4px] text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-xs font-bold text-slate-700 font-mono px-3">
            {page} / {lastPage}
          </span>
          <button
            id="pagination-next"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= lastPage}
            className="p-2 border border-slate-200 bg-white rounded-[4px] text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:hover:bg-white transition-all cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
