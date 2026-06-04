import React from 'react';
import { Edit2, Play, Square, Trash2 } from 'lucide-react';
import { Button } from '../../../../../shared/components/ui/Button';
import { TenantUser } from '../types/tenant-user.types';

interface TenantUserActionsProps {
  user: TenantUser;
  onEdit: (user: TenantUser) => void;
  onToggleStatus: (user: TenantUser) => void;
  onDelete: (user: TenantUser) => void;
}

export const TenantUserActions: React.FC<TenantUserActionsProps> = ({
  user,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  return (
    <div className="flex items-center gap-1.5 justify-end" id={`user-actions-${user.id}`}>
      <Button
        id={`btn-user-edit-${user.id}`}
        variant="outline"
        size="sm"
        onClick={() => onEdit(user)}
        className="flex items-center gap-1.5 h-8 py-0 border border-slate-200 text-[10px] font-bold"
      >
        <Edit2 className="h-3 w-3 text-slate-500" />
        EDITAR
      </Button>

      <Button
        id={`btn-user-toggle-${user.id}`}
        variant="ghost"
        size="sm"
        onClick={() => onToggleStatus(user)}
        className={`flex items-center gap-1.5 h-8 py-0 text-[10px] font-bold tracking-wider ${
          user.active 
            ? 'text-amber-600 hover:bg-amber-50' 
            : 'text-teal-600 hover:bg-teal-50'
        }`}
      >
        {user.active ? (
          <>
            <Square className="h-2.5 w-2.5 text-amber-500 fill-amber-500" />
            DESATIVAR
          </>
        ) : (
          <>
            <Play className="h-2.5 w-2.5 text-teal-500 fill-teal-500" />
            ATIVAR
          </>
        )}
      </Button>

      <Button
        id={`btn-user-delete-${user.id}`}
        variant="ghost"
        size="sm"
        onClick={() => onDelete(user)}
        className="flex items-center gap-1.5 h-8 py-0 text-rose-600 hover:bg-rose-50 hover:text-rose-700 text-[10px] font-bold"
      >
        <Trash2 className="h-3 w-3 text-rose-500" />
        EXCLUIR
      </Button>
    </div>
  );
};
