import React from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { useAuth } from '../../../core/auth/auth.store';
import { User as UserIcon } from 'lucide-react';

function formatRole(role: string): string {
  return role
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatStatus(status: string): string {
  return status === 'active' ? 'Ativo' : 'Inativo';
}

function formatLastLogin(lastLoginAt: string | null): string {
  if (!lastLoginAt) {
    return 'Sem registro';
  }

  const parsedDate = new Date(lastLoginAt);

  if (Number.isNaN(parsedDate.getTime())) {
    return 'Sem registro';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  }).format(parsedDate);
}

export const ProfileCard: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-500 font-medium" id="profile-card-loading">
        Carregando dados do usuário...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-6 bg-rose-50 text-rose-700 border border-rose-100 rounded-lg text-sm font-medium" id="profile-card-error">
        Não foi possível carregar as informações do perfil. Certifique-se de estar autenticado.
      </div>
    );
  }

  const statusVariant = user.status === 'active' ? 'success' : 'danger';

  return (
    <Card id="profile-card" className="max-w-2xl mx-auto border-l-4 border-l-teal-600 shadow-sm rounded-[4px]">
      <div className="flex flex-col items-center pb-6 border-b border-slate-100" id="profile-card-header">
        <div className="h-20 w-20 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center text-teal-600 mb-4" id="profile-card-avatar">
          <UserIcon className="h-10 w-10" />
        </div>
        <h2 className="text-xl font-black text-slate-800 tracking-tight" id="profile-user-name">
          {user.name.toUpperCase()}
        </h2>
        <span className="text-xs font-mono text-slate-400 mt-1" id="profile-user-email">
          {user.email}
        </span>
      </div>

      <div className="pt-6 space-y-4" id="profile-details">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3" id="profile-detail-name">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Nome Completo
          </span>
          <span className="text-xs font-bold text-slate-800">
            {user.name}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-slate-100 pb-3" id="profile-detail-email">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            E-mail de Cadastro
          </span>
          <span className="text-xs font-mono text-slate-700">
            {user.email}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-slate-100 pb-3" id="profile-detail-type">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Cargo
          </span>
          <span className="text-xs font-bold text-teal-600 uppercase tracking-wider">
            {formatRole(user.role)}
          </span>
        </div>

        <div className="flex justify-between items-center border-b border-slate-100 pb-3" id="profile-detail-status">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Status
          </span>
          <Badge variant={statusVariant}>
            {formatStatus(user.status)}
          </Badge>
        </div>

        <div className="flex justify-between items-center pb-2" id="profile-detail-last-login">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Último Login
          </span>
          <span className="text-xs font-mono text-slate-700">
            {formatLastLogin(user.last_login_at)}
          </span>
        </div>
      </div>
    </Card>
  );
};
