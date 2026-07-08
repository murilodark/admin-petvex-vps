import React from 'react';
import { Eye, CheckCircle2, XCircle } from 'lucide-react';
import { WhatsAppTemplate } from '../../../core/http/generated/models';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

interface WhatsappTemplateTableProps {
  templates: WhatsAppTemplate[];
  isLoading: boolean;
  onSelect: (template: WhatsAppTemplate) => void;
}

export const WhatsappTemplateTable: React.FC<WhatsappTemplateTableProps> = ({
  templates,
  isLoading,
  onSelect,
}) => {
  const getCategoryLabel = (category?: string) => {
    switch (category?.toUpperCase()) {
      case 'UTILITY':
        return 'Utilidade';
      case 'MARKETING':
        return 'Marketing';
      case 'AUTHENTICATION':
        return 'Autenticação';
      default:
        return category || '-';
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-[4px] overflow-hidden" id="templates-table-wrapper">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse" id="whatsapp-templates-table">
          <thead>
            <tr className="bg-slate-950 border-b border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <th className="py-4 px-6">Chave</th>
              <th className="py-4 px-6">Nome Interno</th>
              <th className="py-4 px-6">Template Meta</th>
              <th className="py-4 px-6">Idioma</th>
              <th className="py-4 px-6">Categoria</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800 text-slate-300 text-xs">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                  Carregando templates do WhatsApp...
                </td>
              </tr>
            ) : templates.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                  Nenhum template WhatsApp encontrado.
                </td>
              </tr>
            ) : (
              templates.map((template) => (
                <tr
                  key={template.key}
                  id={`template-row-${template.key}`}
                  className="hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-4 px-6 font-mono text-teal-400 font-semibold">
                    {template.key}
                  </td>
                  <td className="py-4 px-6 font-semibold text-slate-200">
                    {template.name}
                  </td>
                  <td className="py-4 px-6 text-slate-400 font-mono text-[11px]">
                    {template.meta_template_name}
                  </td>
                  <td className="py-4 px-6 uppercase text-slate-400 font-medium">
                    {template.language}
                  </td>
                  <td className="py-4 px-6">
                    <span className="bg-slate-950 text-slate-300 border border-slate-800 px-2 py-1 rounded-[4px] text-[10px] uppercase font-bold tracking-wider">
                      {getCategoryLabel(template.category)}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center">
                    {template.is_active ? (
                      <Badge variant="success" className="inline-flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-teal-600" />
                        Ativo
                      </Badge>
                    ) : (
                      <Badge variant="gray" className="inline-flex items-center gap-1 text-slate-500 border-slate-800">
                        <XCircle className="h-3 w-3 text-slate-500" />
                        Inativo
                      </Badge>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Button
                      id={`btn-view-template-${template.key}`}
                      variant="gray"
                      onClick={() => onSelect(template)}
                      className="p-2 h-8 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer"
                    >
                      <Eye className="h-3 w-3" />
                      Estrutura / JSON
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
