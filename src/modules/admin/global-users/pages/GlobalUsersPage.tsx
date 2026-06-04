import React, { useEffect, useState } from 'react';
import { UserPlus, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../../../core/auth/auth.store';
import { globalUsersService } from '../services/global-users.service';
import { GlobalUser, ListarGlobalUsersParams } from '../types/global-user.types';
import { GlobalUserFilters } from '../components/GlobalUserFilters';
import { GlobalUsersTable } from '../components/GlobalUsersTable';
import { GlobalUserDeleteDialog } from '../components/GlobalUserDeleteDialog';

interface GlobalUsersPageProps {
  onNavigate: (path: string) => void;
}

export const GlobalUsersPage: React.FC<GlobalUsersPageProps> = ({ onNavigate }) => {
  const { me } = useAuth();
  const [users, setUsers] = useState<GlobalUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<ListarGlobalUsersParams>({
    page: 1,
    search: '',
    isGlobalAdmin: 'all',
    active: 'all',
    tenantId: '',
  });

  // Deletion Modal States
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<GlobalUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await globalUsersService.listarUsuarios(filters);
      setUsers(res.data);
      setTotal(res.total);
    } catch (err: any) {
      console.error('Failed to load global users', err);
      setError(err?.message || 'Ocorreu um erro ao consultar a listagem de usuários globais.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filters]);

  const handlePageChange = (newPage: number) => {
    setFilters(prev => ({ ...prev, page: newPage }));
  };

  const handleClearFilters = () => {
    setFilters({
      page: 1,
      search: '',
      isGlobalAdmin: 'all',
      active: 'all',
      tenantId: '',
    });
  };

  const handleDeleteTrigger = (user: GlobalUser) => {
    if (user.id === me?.id) {
      alert('Você não pode excluir seu próprio usuário.');
      return;
    }
    setUserToDelete(user);
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    try {
      setDeleting(true);
      await globalUsersService.excluirUsuario(userToDelete.id, me?.id);
      setIsDeleteOpen(false);
      setUserToDelete(null);
      fetchUsers(); // reload list
    } catch (err: any) {
      console.error('Failed to delete global user', err);
      alert(err.message || 'Erro ao tentar realizar a exclusão do usuário.');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6" id="global-users-page-root">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-100 pb-5" id="global-users-header">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase" id="page-title">
            Usuários Globais
          </h1>
          <p className="text-xs text-slate-400 mt-1 uppercase tracking-wider">
            Gestão administrativa de credenciais principais do ecossistema e permissões em clínicas parceiras
          </p>
        </div>
        <button
          id="btn-trigger-create-user"
          onClick={() => onNavigate('/usuarios/novo')}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold tracking-widest uppercase rounded-[4px] shadow-sm cursor-pointer transition-all shrink-0"
        >
          <UserPlus className="h-4 w-4" />
          Cadastrar Usuário
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs p-4 rounded-[4px] flex items-center gap-2" id="global-users-error-banner">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <button onClick={fetchUsers} className="ml-auto underline font-bold uppercase tracking-wider flex items-center gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" /> Reprocessar
          </button>
        </div>
      )}

      {/* Filters */}
      <GlobalUserFilters
        filters={filters}
        onChange={setFilters}
        onClear={handleClearFilters}
      />

      {/* Users Table */}
      <GlobalUsersTable
        users={users}
        loading={loading}
        page={filters.page || 1}
        perPage={5}
        total={total}
        onPageChange={handlePageChange}
        onViewDetails={(u) => onNavigate(`/usuarios/${u.id}`)}
        onEdit={(u) => onNavigate(`/usuarios/editar/${u.id}`)}
        onDelete={handleDeleteTrigger}
      />

      {/* Exclude Dialog overlay */}
      <GlobalUserDeleteDialog
        isOpen={isDeleteOpen}
        user={userToDelete}
        onClose={() => {
          setIsDeleteOpen(false);
          setUserToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        isLoading={deleting}
      />
    </div>
  );
};
