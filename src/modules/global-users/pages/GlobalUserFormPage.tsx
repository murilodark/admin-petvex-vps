import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, UserPlus, FileEdit } from 'lucide-react';
import { useAuth } from '../../../core/auth/auth.store';
import { globalUsersService } from '../services/global-users.service';
import { GlobalUser, GlobalUserFormData } from '../types/global-user.types';
import { GlobalUserForm } from '../components/GlobalUserForm';
import { Card } from '../../../shared/components/ui/Card';

interface GlobalUserFormPageProps {
  onNavigate: (path: string) => void;
}

export const GlobalUserFormPage: React.FC<GlobalUserFormPageProps> = ({ onNavigate }) => {
  const { me } = useAuth();
  const [user, setUser] = useState<GlobalUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fetchingError, setFetchingError] = useState<string | null>(null);

  const pathname = window.location.pathname;
  const isEdit = pathname.includes('/editar/');
  
  // Extract userId if present
  let userId = '';
  if (isEdit) {
    const parts = pathname.split('/');
    // path is: /usuarios/editar/{id}
    userId = parts[parts.indexOf('editar') + 1] || '';
  }

  useEffect(() => {
    if (isEdit && userId) {
      const fetchUserDetails = async () => {
        try {
          setLoading(true);
          setFetchingError(null);
          const found = await globalUsersService.buscarUsuarioPorId(userId);
          setUser(found);
        } catch (err: any) {
          console.error('Error loading global user details for editing', err);
          setFetchingError(err?.message || 'Incapaz de localizar os dados do usuário requisitado.');
        } finally {
          setLoading(false);
        }
      };
      fetchUserDetails();
    }
  }, [isEdit, userId]);

  const handleSubmit = async (formData: GlobalUserFormData) => {
    try {
      setSubmitting(true);
      if (isEdit && userId) {
        await globalUsersService.atualizarUsuario(userId, formData, me?.id);
      } else {
        await globalUsersService.cadastrarUsuario(formData);
      }
      onNavigate('/usuarios');
    } catch (err: any) {
      console.error('Submit error on global user form', err);
      // Re-throw so that the error boundaries inside the form display it correctly
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[300px]" id="form-loading-state">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Sincronizando registros do servidor...</p>
      </div>
    );
  }

  if (fetchingError) {
    return (
      <div className="space-y-4 text-center p-12" id="form-error-state">
        <h3 className="text-sm font-bold text-rose-500 uppercase tracking-wider">Erro na Sincronização</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{fetchingError}</p>
        <button
          onClick={() => onNavigate('/usuarios')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-[4px] uppercase tracking-wider transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao Painel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="global-user-form-page-root">
      {/* Upper header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5" id="form-page-header">
        <button
          id="btn-back-to-users"
          onClick={() => onNavigate('/usuarios')}
          className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-[4px] transition-all cursor-pointer shadow-xs"
          title="Retornar para a listagem"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase flex items-center gap-2">
            {isEdit ? (
              <>
                <FileEdit className="h-5 w-5 text-teal-600" />
                Editar Perfil de Usuário
              </>
            ) : (
              <>
                <UserPlus className="h-5 w-5 text-teal-600" />
                Novo Credenciamento Geral
              </>
            )}
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">
            {isEdit 
              ? `Ajustando identificações e privilégios de ${user?.name}`
              : 'Inserção de novos colaboradores e administradores com acesso ao painel de controle global'}
          </p>
        </div>
      </div>

      <Card 
        id="user-form-container-card"
        title={isEdit ? "Editar Detalhes Principais" : "Informações Cadastrais Principais"}
        subtitle={isEdit ? "Atualize as informações corporativas e regras de acesso do colaborador" : "Insira as credenciais iniciais deste novo acesso"}
      >
        <GlobalUserForm
          initialData={user || undefined}
          onSubmit={handleSubmit}
          onCancel={() => onNavigate('/usuarios')}
          isLoading={submitting}
          loggedInUserId={me?.id}
        />
      </Card>
    </div>
  );
};
