import React from 'react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { useAuth } from '../../../core/auth/auth.store';
import { Server, ShieldCheck, Activity, Users } from 'lucide-react';

export const DashboardSummary: React.FC = () => {
  const { user } = useAuth();

  return (
    <div id="dashboard-summary" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card
        id="summary-card-saas"
        title={
          <span className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
            <Server className="h-4 w-4 text-teal-600" />
            SaaS Petvex
          </span>
        }
      >
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-black tracking-tight text-slate-900">ATIVO</span>
          <span className="text-[10px] text-slate-400 font-mono tracking-tighter uppercase mt-1">Domínio: adm.petvex.com.br</span>
        </div>
      </Card>

      <Card
        id="summary-card-panel"
        title={
          <span className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
            <ShieldCheck className="h-4 w-4 text-teal-600" />
            Painel Admin Global
          </span>
        }
      >
        <div className="flex flex-col gap-1">
          <span className="text-3xl font-black tracking-tight text-slate-900">CICLO 1</span>
          <span className="text-[10px] text-teal-600 font-bold uppercase mt-1">MÓDULOS: AUTH & PROFILE</span>
        </div>
      </Card>

      <Card
        id="summary-card-api"
        title={
          <span className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
            <Activity className="h-4 w-4 text-teal-600" />
            Status da API
          </span>
        }
        extra={<Badge variant="success">Online</Badge>}
      >
        <div className="flex flex-col gap-1">
          <span className="text-xl font-bold font-mono text-slate-900 tracking-tight truncate">api.petvex.com.br</span>
          <span className="text-[10px] text-slate-400 font-mono uppercase mt-1">Ingress V1 / Sanitized</span>
        </div>
      </Card>

      <Card
        id="summary-card-user"
        title={
          <span className="flex items-center gap-2 font-bold text-slate-900 text-xs uppercase tracking-wider">
            <Users className="h-4 w-4 text-teal-600" />
            Usuário Logado
          </span>
        }
      >
        <div className="flex flex-col gap-1">
          <span className="text-lg font-black text-slate-900 truncate tracking-tight">{user?.name ? user.name.toUpperCase() : 'ADMINISTRADOR'}</span>
          <span className="text-[10px] text-slate-400 font-mono truncate mt-1">{user?.email || 'NENHUM E-MAIL'}</span>
        </div>
      </Card>
    </div>
  );
};
