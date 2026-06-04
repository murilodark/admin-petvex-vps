import React from 'react';
import { ChevronLeft, ChevronRight, Mail, Phone, Shield } from 'lucide-react';
import { TenantUser } from '../types/tenant-user.types';
import { TenantUserStatusBadge } from './TenantUserStatusBadge';
import { TenantUserActions } from './TenantUserActions';

interface TenantUsersTableProps {
  users: TenantUser[];
  loading: boolean;
  onEdit: (user: TenantUser) => void;
  onToggleStatus: (user: TenantUser) => void;
  onDelete: (user: TenantUser) => void;
  
  // Pagination
  page: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (newPage: number) => void;
}

export const TenantUsersTable: React.FC<TenantUsersTableProps> = ({
  users,
  loading,
  onEdit,
  onToggleStatus,
  onDelete,
  page,
  lastPage,
  total,
  perPage,
  onPageChange,
}) => {
  const formatDate = (isoStr?: string) => {
    if (!isoStr) return '-';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return 'Admin Master';
      case 'manager':
        return 'Gerente Clínico';
      case 'user':
      default:
        return 'Operador / Veterinário';
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-[4px] shadow-xs overflow-hidden animate-fade-in" id="tenant-users-table-wrapper">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[800px] border-collapse text-left" id="tenant-users-table-element">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-[10px] uppercase font-black tracking-wider">
              <th className="py-4 px-6 border-r border-slate-100 last:border-r-0">Usuário do Tenant</th>
              <th className="py-4 px-6 border-r border-slate-100 last:border-r-0">Documentação</th>
              <th className="py-4 px-6 border-r border-slate-100 last:border-r-0">Nível / Cargo</th>
              <th className="py-4 px-6 border-r border-slate-100 last:border-r-0">Status de Acesso</th>
              <th className="py-4 px-6 text-right">Ações Rápidas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 text-xs">
            {loading ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest">
                  <div className="flex items-center justify-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-teal-500 animate-ping mr-1" />
                    Carregando usuários vinculados...
                  </div>
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-slate-400 font-bold uppercase tracking-widest">
                  Nenhum usuário foi cadastrado para este tenant.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-slate-50/50 transition-colors"
                  id={`tenant-user-row-${user.id}`}
                >
                  <td className="py-4 px-6">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-extrabold text-slate-900 text-[13px] tracking-tight">{user.name}</span>
                      <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5 font-mono">
                        <span className="flex items-center gap-1 uppercase">
                          <Mail className="h-3 w-3 text-slate-400" />
                          {user.email}
                        </span>
                        {user.phone ? (
                          <span className="flex items-center gap-1 uppercase">
                            <Phone className="h-3 w-3 text-slate-400" />
                            {user.phone}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    {user.document ? (
                      <span className="font-mono text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[4px]">
                        {user.document}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>

                  <td className="py-4 px-6">
                    <div className="flex items-center gap-1.5">
                      <Shield className="h-3 w-3 text-teal-600 shrink-0" />
                      <span className="px-2 py-0.5 bg-teal-50 text-teal-800 text-[10px] font-black uppercase rounded-[4px] tracking-wider border border-teal-100">
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                  </td>

                  <td className="py-4 px-6">
                    <TenantUserStatusBadge active={user.active} />
                  </td>

                  <td className="py-4 px-6">
                    <TenantUserActions
                      user={user}
                      onEdit={onEdit}
                      onToggleStatus={onToggleStatus}
                      onDelete={onDelete}
                    />
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!loading && total > 0 ? (
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4.5 flex flex-col sm:flex-row justify-between items-center gap-4" id="user-table-pagination-nav">
          <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Mostrando <span className="text-slate-700 font-bold font-mono">{(page - 1) * perPage + 1}</span> a <span className="text-slate-700 font-bold font-mono">{Math.min(page * perPage, total)}</span> de <span className="text-slate-700 font-bold font-mono">{total}</span> usuários vinculados
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-[4px] border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              id="prev-user-page-btn"
            >
              <ChevronLeft className="h-4 w-4 text-slate-600" />
            </button>
            
            <div className="font-mono text-xs font-bold px-3 py-1 bg-white border border-slate-200 text-slate-700 rounded-[4px]">
              {page} / {lastPage}
            </div>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= lastPage}
              className="p-1.5 rounded-[4px] border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 disabled:hover:bg-white cursor-pointer"
              id="next-user-page-btn"
            >
              <ChevronRight className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
};
