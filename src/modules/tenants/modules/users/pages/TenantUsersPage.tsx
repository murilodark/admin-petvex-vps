import React, { useState, useEffect } from 'react';
import { PlusCircle, ShieldAlert, CheckCircle, Trash2 } from 'lucide-react';
import { Button } from '../../../../../shared/components/ui/Button';
import { TenantUsersFilters } from '../components/TenantUsersFilters';
import { TenantUsersTable } from '../components/TenantUsersTable';
import { TenantUserFormModal } from '../components/TenantUserFormModal';
import { tenantUsersService, ListarTenantUsersResult } from '../services/tenant-users.service';
import { TenantUser, TenantUserFormData } from '../types/tenant-user.types';

interface TenantUsersPageProps {
  tenantId: string;
}

export const TenantUsersPage: React.FC<TenantUsersPageProps> = ({ tenantId }) => {
  const [loading, setLoading] = useState(true);
  const [dataResult, setDataResult] = useState<ListarTenantUsersResult>({
    data: [],
    total: 0,
    page: 1,
    perPage: 5,
    lastPage: 1,
  });

  // Query States
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('all');
  const [active, setActive] = useState('all');
  const [page, setPage] = useState(1);

  // Modal / Operations States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<TenantUser | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Delete Prompt States
  const [deleteTarget, setDeleteTarget] = useState<TenantUser | null>(null);

  const triggerToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await tenantUsersService.listarUsuarios(tenantId, {
        page,
        search,
        active,
        role,
      });
      setDataResult(result);
    } catch (err: any) {
      console.error('Error loading tenant users:', err);
      triggerToast('Ocorreu um erro ao carregar os usuários.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // Reset page on filter changes
  }, [tenantId, page, role, active]);

  // Debounced/delayed search effect to avoid excessive network requests
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      loadUsers();
    }, 450);

    return () => clearTimeout(timer);
  }, [search]);

  // Actions
  const handleOpenCreateModal = () => {
    setSelectedUser(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: TenantUser) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleToggleStatus = async (user: TenantUser) => {
    try {
      if (user.active) {
        await tenantUsersService.desativarUsuario(tenantId, user.id);
        triggerToast(`O usuário "${user.name}" foi desativado com sucesso.`, 'info');
      } else {
        await tenantUsersService.ativarUsuario(tenantId, user.id);
        triggerToast(`O usuário "${user.name}" foi reativado com sucesso.`, 'success');
      }
      loadUsers();
    } catch (err) {
      console.error('Error toggling tenant user active state:', err);
      triggerToast('Falha ao alterar o status do usuário.', 'error');
    }
  };

  const handleFormSubmit = async (formData: TenantUserFormData) => {
    setIsSubmitting(true);
    try {
      if (selectedUser) {
        // Edit Mode
        await tenantUsersService.atualizarUsuario(tenantId, selectedUser.id, formData);
        triggerToast(`O perfil do usuário "${formData.name}" foi atualizado com sucesso.`, 'success');
      } else {
        // Create Mode
        await tenantUsersService.cadastrarUsuario(tenantId, formData);
        triggerToast(`O usuário "${formData.name}" foi registrado com sucesso.`, 'success');
      }
      setIsModalOpen(false);
      loadUsers();
    } catch (err: any) {
      throw err; // Form component captures and details API field validation mapping (e.g. 422)
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePrompt = (user: TenantUser) => {
    setDeleteTarget(user);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      await tenantUsersService.excluirUsuario(tenantId, deleteTarget.id);
      triggerToast(`O usuário "${deleteTarget.name}" foi excluído permanentemente da lista.`, 'success');
      setDeleteTarget(null);
      // fallback to previous page if last user of current page is wiped
      if (dataResult.data.length <= 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        loadUsers();
      }
    } catch (err) {
      console.error('Error deleting tenant user:', err);
      triggerToast('Erro de autorização ou integridade ao excluir o usuário.', 'error');
    }
  };

  return (
    <div className="space-y-6" id="tenant-users-page-container">
      {/* Toast Feedback Alerts */}
      {toastMessage ? (
        <div 
          className={`p-4 border rounded-[4px] text-xs flex gap-3 items-start animate-fade-in fixed top-4 right-4 z-100 shadow-lg max-w-md ${
            toastMessage.type === 'success' 
              ? 'bg-teal-50 border-teal-200 text-teal-800' 
              : toastMessage.type === 'error'
                ? 'bg-rose-50 border-rose-220 text-rose-800'
                : 'bg-slate-50 border-slate-200 text-slate-800'
          }`} 
          id="global-toast-indicator"
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="h-5 w-5 text-teal-600 shrink-0 mt-0.5" />
          ) : (
            <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="font-extrabold uppercase tracking-wide text-[10px] m-0 leading-none">Notificação do SaaS</p>
            <p className="text-[11px] text-slate-500 mt-1.5 font-medium leading-normal">{toastMessage.text}</p>
          </div>
        </div>
      ) : null}

      {/* Header toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-slate-201 p-5 rounded-[4px]" id="users-module-toolbar">
        <div>
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
            USUÁRIOS DE ACESSO DO TENANT
          </h3>
          <p className="text-[10px] text-slate-400 font-mono uppercase mt-0.5">
            GERENCIAMENTO DE CREDENCIAIS, STATUS DE ATIVAÇÃO E CARGOS DO CLIENTE
          </p>
        </div>

        <Button
          id="btn-new-user"
          variant="primary"
          onClick={handleOpenCreateModal}
          className="flex items-center gap-2 text-xs font-bold w-full sm:w-auto"
        >
          <PlusCircle className="h-4 w-4" />
          NOVO USUÁRIO
        </Button>
      </div>

      {/* Filtering */}
      <TenantUsersFilters
        search={search}
        onSearchChange={setSearch}
        role={role}
        onRoleChange={(v) => { setRole(v); setPage(1); }}
        active={active}
        onActiveChange={(v) => { setActive(v); setPage(1); }}
      />

      {/* Listing Content */}
      <TenantUsersTable
        users={dataResult.data}
        loading={loading}
        onEdit={handleOpenEditModal}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDeletePrompt}
        page={dataResult.page}
        lastPage={dataResult.lastPage}
        total={dataResult.total}
        perPage={dataResult.perPage}
        onPageChange={setPage}
      />

      {/* Modal Dialog Form */}
      <TenantUserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        user={selectedUser}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      {/* Safe confirmation modal for user deletions (No native prompt) */}
      {deleteTarget ? (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 animate-fade-in" id="delete-prompt-modal">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" onClick={() => setDeleteTarget(null)} />
          
          <div className="relative bg-white border border-slate-200 rounded-[4px] shadow-2xl p-6 w-full max-w-md z-10 animate-scale-up text-left">
            <div className="flex gap-4 items-start">
              <div className="w-10 h-10 bg-rose-50 border border-rose-100 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                <Trash2 className="h-5 w-5 text-rose-500" />
              </div>
              <div>
                <h4 className="text-sm font-black uppercase text-slate-900 tracking-wider">
                  Confirmar Exclusão de Usuário
                </h4>
                <p className="text-[11px] text-slate-500 mt-2 leading-relaxed">
                  Tem certeza que deseja excluir permanentemente o usuário <strong className="text-slate-900">{deleteTarget.name}</strong> ({deleteTarget.email})? Esta operação é irreversível e bloqueará o acesso deste funcionário a este tenant.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-5 mt-5 border-t border-slate-100">
              <Button
                id="btn-delete-cancel"
                type="button"
                variant="outline"
                onClick={() => setDeleteTarget(null)}
              >
                CANCELAR
              </Button>
              <Button
                id="btn-delete-confirm"
                type="button"
                variant="danger"
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                onClick={handleDeleteConfirm}
              >
                EXCLUIR USUÁRIO
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
