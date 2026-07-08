import React from 'react';
import { X, MessageSquare, Info, Code, FileText, Layers } from 'lucide-react';
import { WhatsAppTemplate } from '../../../core/http/generated/models';
import { Button } from '../../../shared/components/ui/Button';
import { Badge } from '../../../shared/components/ui/Badge';

interface WhatsappTemplateDetailsModalProps {
  template: WhatsAppTemplate | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsappTemplateDetailsModal: React.FC<WhatsappTemplateDetailsModalProps> = ({
  template,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !template) return null;

  const renderText = (value?: any, fallback: string = '-') => {
    if (value === null || value === undefined || value === '') return fallback;
    return String(value);
  };

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
    <div
      id="template-details-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="template-details-modal-container"
        className="bg-slate-900 border border-slate-800 text-white rounded-[4px] w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-950">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-teal-500" />
            <div>
              <h3 className="font-sans font-medium text-sm uppercase tracking-wider text-slate-100">
                Estrutura do Template WhatsApp
              </h3>
              <p className="text-[10px] text-slate-400 font-mono mt-1">Chave: {template.key}</p>
            </div>
          </div>
          <button
            id="btn-close-template-modal"
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6" id="template-modal-content">
          {/* Metadata Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-[4px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Status</div>
              <div className="mt-2">
                {template.is_active ? (
                  <Badge variant="success">Ativo / Disponível</Badge>
                ) : (
                  <Badge variant="gray" className="text-slate-500 border-slate-800">Inativo</Badge>
                )}
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-[4px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Categoria</div>
              <div className="mt-2">
                <span className="bg-teal-500/10 text-teal-400 border border-teal-500/20 px-2.5 py-1 rounded-[4px] text-[10px] uppercase font-bold tracking-wider">
                  {getCategoryLabel(template.category)}
                </span>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800/80 p-4 rounded-[4px]">
              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Idioma</div>
              <div className="text-xs font-semibold text-slate-200 mt-2 uppercase">
                {renderText(template.language, '-')}
              </div>
            </div>
          </div>

          {/* Details list */}
          <div className="bg-slate-950 border border-slate-800 p-4 rounded-[4px] space-y-3">
            <div className="grid grid-cols-3 text-xs">
              <span className="text-slate-400 font-semibold">Nome Interno:</span>
              <span className="col-span-2 text-slate-200 font-medium">{renderText(template.name, '-')}</span>
            </div>

            <div className="grid grid-cols-3 text-xs border-t border-slate-800/50 pt-3">
              <span className="text-slate-400 font-semibold">Nome do Template no Meta:</span>
              <span className="col-span-2 text-slate-200 font-mono text-[11px] font-semibold text-teal-400">
                {renderText(template.meta_template_name, '-')}
              </span>
            </div>

            <div className="grid grid-cols-3 text-xs border-t border-slate-800/50 pt-3">
              <span className="text-slate-400 font-semibold">Descrição:</span>
              <span className="col-span-2 text-slate-200 text-xs leading-relaxed">
                {renderText(template.description, 'Sem descrição disponível.')}
              </span>
            </div>
          </div>

          {/* Components list preview */}
          {template.components && template.components.length > 0 && (
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <Layers className="h-4 w-4 text-teal-500" /> Componentes Estruturais (Meta format)
              </div>
              <div className="space-y-3">
                {template.components.map((comp: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 p-4 rounded-[4px]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] uppercase tracking-widest font-bold bg-slate-900 border border-slate-800 px-2 py-0.5 text-teal-400 rounded">
                        Tipo: {comp.type || 'UNKNOWN'}
                      </span>
                      {comp.format && (
                        <span className="text-[10px] font-mono text-slate-500">
                          Formato: {comp.format}
                        </span>
                      )}
                    </div>
                    {comp.text && (
                      <div className="bg-slate-900/60 p-3 rounded border border-slate-800/40 text-slate-200 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                        {comp.text}
                      </div>
                    )}
                    {comp.buttons && comp.buttons.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="text-[10px] text-slate-500 uppercase font-semibold">Botões:</div>
                        {comp.buttons.map((btn: any, bIdx: number) => (
                          <div key={bIdx} className="text-xs text-slate-400 font-mono pl-2">
                            • {btn.type} - "{btn.text}" {btn.url ? `(${btn.url})` : ''}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw JSON Block */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Code className="h-4 w-4 text-teal-500" /> Estrutura do Payload JSON
            </div>
            <pre className="bg-slate-950 p-4 rounded-[4px] border border-slate-800 text-teal-400 font-mono text-xs overflow-auto max-h-60" id="template-json-code">
              {JSON.stringify(template, null, 2)}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 bg-slate-950 flex justify-end">
          <Button
            id="btn-template-modal-close"
            variant="gray"
            onClick={onClose}
            className="text-xs font-bold uppercase tracking-wider"
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};
