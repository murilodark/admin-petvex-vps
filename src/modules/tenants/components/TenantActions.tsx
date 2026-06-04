import React from 'react';
import { Eye, Edit2, Play, Square } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';
import { Tenant } from '../types/tenant.types';

interface TenantActionsProps {
  tenant: Tenant;
  onEdit: (tenant: Tenant) => void;
  onNavigateDetail: (id: string) => void;
  onToggleStatus: (tenant: Tenant) => void;
}

export const TenantActions: React.FC<TenantActionsProps> = ({
  tenant,
  onEdit,
  onNavigateDetail,
  onToggleStatus,
}) => {
  return (
    <div className="flex items-center gap-1.5 justify-end" id={`actions-${tenant.id}`}>
      <Button
        id={`btn-manage-${tenant.id}`}
        variant="outline"
        size="sm"
        onClick={() => onNavigateDetail(tenant.id)}
        className="flex items-center gap-1.5 h-8 py-0 border border-slate-200"
      >
        <Eye className="h-3 w-3 text-teal-600 animate-pulse" />
        GERENCIAR
      </Button>

      <Button
        id={`btn-edit-${tenant.id}`}
        variant="outline"
        size="sm"
        onClick={() => onEdit(tenant)}
        className="flex items-center gap-1.5 h-8 py-0 border border-slate-200"
      >
        <Edit2 className="h-3 w-3 text-slate-500" />
        EDITAR
      </Button>

      <Button
        id={`btn-toggle-${tenant.id}`}
        variant="ghost"
        size="sm"
        onClick={() => onToggleStatus(tenant)}
        className={`flex items-center gap-1.5 h-8 py-0 text-[10px] font-bold tracking-widest ${
          tenant.status === 'active' 
            ? 'text-rose-600 hover:bg-rose-50/75' 
            : 'text-teal-600 hover:bg-teal-50/75'
        }`}
      >
        {tenant.status === 'active' ? (
          <>
            <Square className="h-2.5 w-2.5 text-rose-500 fill-rose-500" />
            DESATIVAR
          </>
        ) : (
          <>
            <Play className="h-2.5 w-2.5 text-teal-500 fill-teal-500" />
            ATIVAR
          </>
        )}
      </Button>
    </div>
  );
};
