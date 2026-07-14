import React, { useEffect, useState } from 'react';
import { ArrowLeft, Loader2, ShieldAlert, CheckCircle, XCircle, ShieldCheck, Mail, Calendar, KeyRound, AlertCircle } from 'lucide-react';
import { useAuth } from '../../../core/auth/auth.store';
import { globalUsersService } from '../services/global-users.service';
import { GlobalUser, GlobalUserTenantAccess, GlobalUserTenantAccessFormData } from '../types/global-user.types';
import { GlobalUserTenantAccessTable } from '../components/GlobalUserTenantAccessTable';
import { GlobalUserTenantAccessForm } from '../components/GlobalUserTenantAccessForm';
import { GlobalUserTenantRevokeDialog } from '../components/GlobalUserTenantRevokeDialog';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';

interface GlobalUserDetailsPageProps {
  onNavigate: (path: string) => void;
}

export const GlobalUserDetailsPage: React.FC<GlobalUserDetailsPageProps> = ({ onNavigate }) => {
  const { me } = useAuth();
  const [user, setUser] = useState<GlobalUser | null>(null);
  const [accessList, setAccessList] = useState<GlobalUserTenantAccess[]>([]);
  
  const [loadingUser, setLoadingUser] = useState(false);
  const [loadingAccess, setLoadingAccess] = useState(false);
  
  const [fetchingError, setFetchingError] = useState<string | null>(null);

  // Association modal/overlay states
  const [isAccessFormOpen, setIsAccessFormOpen] = useState(false);
  const [selectedAccessToEdit, setSelectedAccessToEdit] = useState<GlobalUserTenantAccess | null>(null);
  const [savingAccess, setSavingAccess] = useState(false);

  // Revocation modal state
  const [isRevokeOpen, setIsRevokeOpen] = useState(false);
  const [accessToRevoke, setAccessToRevoke] = useState<GlobalUserTenantAccess | null>(null);
  const [revoking, setRevoking] = useState(false);

  // Parse userId from path: /usuarios/{id}
  const pathname = window.location.pathname;
  const parts = pathname.split('/');
  const userId = parts[parts.indexOf('usuarios') + 1] || '';

  const loadAllData = async () => {
    if (!userId) return;
    try {
      setLoadingUser(true);
      setLoadingAccess(true);
      setFetchingError(null);

      // Load user details
      const foundUser = await globalUsersService.buscarUsuarioPorId(userId);
      setUser(foundUser);
      setLoadingUser(false);

      // Load tenant associations
      const accesses = await globalUsersService.listarVinculosTenants(userId);
      setAccessList(accesses);
    } catch (err: any) {
      console.error('Error fetching global user details page data', err);
      setFetchingError(err?.message || 'Erro ao carregar detalhes e perfil de vínculos do usuário.');
    } finally {
      setLoadingUser(false);
      setLoadingAccess(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, [userId]);

  const handleAccessSubmit = async (formData: GlobalUserTenantAccessFormData) => {
    try {
      setSavingAccess(true);
      if (selectedAccessToEdit) {
        // Edit mode
        await globalUsersService.atualizarVinculoTenant(userId, selectedAccessToEdit.tenantId, formData);
      } else {
        // Create mode
        await globalUsersService.vincularTenant(userId, formData);
      }
      setIsAccessFormOpen(false);
      setSelectedAccessToEdit(null);
      
      // Reload links
      const updatedAccesses = await globalUsersService.listarVinculosTenants(userId);
      setAccessList(updatedAccesses);
    } catch (err: any) {
      console.error('Failed to submit access link', err);
      throw err;
    } finally {
      setSavingAccess(false);
    }
  };

  const handleRevokeConfirm = async () => {
    if (!accessToRevoke) return;
    try {
      setRevoking(true);
      await globalUsersService.desvincularTenant(userId, accessToRevoke.tenantId);
      setIsRevokeOpen(false);
      setAccessToRevoke(null);
      
      // Reload links
      const updatedAccesses = await globalUsersService.listarVinculosTenants(userId);
      setAccessList(updatedAccesses);
    } catch (err: any) {
      console.error('Failed to revoke access link', err);
      alert(err.message || 'Erro tentando revogar as credenciais do parceiro.');
    } finally {
      setRevoking(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="flex flex-col items-center justify-center p-16 min-h-[350px]" id="details-loading">
        <Loader2 className="h-8 w-8 text-teal-600 animate-spin mb-3" />
        <p className="text-xs text-slate-400 font-mono uppercase tracking-widest">Acessando cadastro dactilográfico...</p>
      </div>
    );
  }

  if (fetchingError || !user) {
    return (
      <div className="space-y-4 text-center p-12 bg-white border border-slate-200 rounded-[4px]" id="details-error">
        <AlertCircle className="h-10 w-10 text-rose-500 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Falha na Sincronização</h3>
        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{fetchingError || 'Não foi possível carregar os dados deste usuário.'}</p>
        <button
          onClick={() => onNavigate('/usuarios')}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-[4px] uppercase tracking-widest transition-all"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Retornar ao Painel
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6" id="global-user-details-root">
      {/* Page Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5" id="details-page-header">
        <button
          id="btn-details-back"
          onClick={() => onNavigate('/usuarios')}
          className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-[4px] transition-all cursor-pointer shadow-xs"
          title="Retornar para a listagem"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">
            {user.name}
          </h1>
          <p className="text-xs text-slate-400 uppercase tracking-wider mt-0.5 font-sans font-medium">
            Visualizar cadastro, logons ativos e permissões operacionais do usuário
          </p>
        </div>
      </div>

      {/* Main Grid: Left is User Details, Right is Activity status info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="details-two-columns">
        <div className="lg:col-span-2 space-y-6" id="details-col-left">
          {/* User Bio Card */}
          <div className="bg-white border border-slate-200 rounded-[4px] p-6 shadow-xs relative" id="biodata-card">
            <div className="flex flex-col md:flex-row gap-5 items-start justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-md font-bold text-slate-900 uppercase tracking-tight">{user.name}</h3>
                  {user.isGlobalAdmin && (
                    <Badge variant="success" className="bg-teal-500/10 text-teal-700 border-teal-500/20 font-sans tracking-wide">
                      Administrador Global
                    </Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="flex items-center gap-2 text-slate-600">
                    <Mail className="h-4 w-4 text-teal-600 shrink-0" />
                    <span className="font-mono">{user.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar className="h-4 w-4 text-teal-600 shrink-0" />
                    <span>Cadastrado em: <span className="font-semibold">{new Date(user.createdAt).toLocaleDateString('pt-BR')}</span></span>
                  </div>
                </div>
              </div>

              {/* Status block info */}
              <div className="p-4 rounded-[4px] border flex items-center gap-3 shrink-0 w-full md:w-auto bg-slate-50/50 border-slate-100" id="status-biodata-sub">
                {user.active ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-teal-600" />
                    <div>
                      <div className="text-[10px] font-black uppercase text-teal-700 tracking-wider">Logon Permitido</div>
                      <div className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">Usuário ativo</div>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-5 w-5 text-rose-500" />
                    <div>
                      <div className="text-[10px] font-black uppercase text-rose-500 tracking-wider">Acesso Suspenso</div>
                      <div className="text-[9px] text-slate-400 uppercase font-mono mt-0.5">Usuário bloqueado</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tenants associations links list Table */}
          <GlobalUserTenantAccessTable
            accessList={accessList}
            loading={loadingAccess}
            onAddAccess={() => {
              setSelectedAccessToEdit(null);
              setIsAccessFormOpen(true);
            }}
            onEditAccess={(access) => {
              setSelectedAccessToEdit(access);
              setIsAccessFormOpen(true);
            }}
            onDeleteAccess={(access) => {
              setAccessToRevoke(access);
              setIsRevokeOpen(true);
            }}
          />
        </div>

        {/* Sidebar Info cards / Quick Help panel */}
        <div className="space-y-6" id="details-col-right">
          <div className="bg-slate-900 text-white rounded-[4px] border border-slate-950 p-6 flex flex-col justify-between shadow-md" id="right-info-card">
            <div>
              <div className="flex items-center gap-2 mb-4" id="rinfo-head">
                <ShieldCheck className="h-5 w-5 text-teal-400" />
                <h4 className="text-[10px] font-black uppercase tracking-wider text-teal-400">Guia de Governança</h4>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Administradores Globais têm privilégios operacionais irrestritos que se sobrepõem às regras locais de clínicas SaaS.
              </p>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Adicionar um usuário a um tenant confere atribuição local específica, habilitando-o para exercer atividades diárias de saúde animal/venda na clínica correspondente.
              </p>
            </div>
            
            <div className="mt-8 pt-4 border-t border-slate-800 text-[9px] font-mono text-slate-400 uppercase tracking-widest text-center">
              Petvex Security Core
            </div>
          </div>
        </div>
      </div>

      {/* Access Association form modal overlay */}
      {isAccessFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 transition-all" id="association-form-overlay">
          <div className="w-full max-w-lg bg-white border border-slate-200 shadow-xl rounded-[4px] overflow-hidden" id="association-form-modal">
            <div className="px-6 py-4.5 border-b border-slate-100 flex items-center gap-2 bg-slate-50/50" id="association-form-headline">
              <KeyRound className="h-5 w-5 text-teal-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                {selectedAccessToEdit ? 'Editar Vínculo de Associação' : 'Efetuar Nova Associação de Tenant'}
              </h3>
            </div>
            <div className="p-6">
              <GlobalUserTenantAccessForm
                initialAccess={selectedAccessToEdit || undefined}
                onSubmit={handleAccessSubmit}
                onCancel={() => {
                  setIsAccessFormOpen(false);
                  setSelectedAccessToEdit(null);
                }}
                isLoading={savingAccess}
                userId={userId}
              />
            </div>
          </div>
        </div>
      )}

      {/* Access link deletion overlay */}
      <GlobalUserTenantRevokeDialog
        isOpen={isRevokeOpen}
        access={accessToRevoke}
        isLoading={revoking}
        onClose={() => {
          setIsRevokeOpen(false);
          setAccessToRevoke(null);
        }}
        onConfirm={handleRevokeConfirm}
      />
    </div>
  );
};
