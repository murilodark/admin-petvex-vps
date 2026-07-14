# Padrões de UI — Frontend Petvex

## 1. Regra de reutilização

Antes de criar qualquer UI, pesquise em `src/shared` e no próprio módulo.

Ordem:

```txt
reutilizar -> parametrizar -> compor -> criar
```

Componentes genéricos pertencem ao shared. Componentes de domínio pertencem ao módulo.

## 2. Componentes compartilhados

Use os equivalentes existentes para:

- Button;
- Input, Select e Textarea;
- Modal, Drawer e ConfirmDialog;
- Table e Pagination;
- Card, Badge, Alert;
- Tabs;
- Loading, Skeleton e EmptyState;
- Tooltip.

Não replique componente global dentro de `modules/*` apenas para mudar texto, ícone ou classe.

## 3. Componentes de módulo

Podem conhecer tipos e regras visuais do domínio.

Exemplos:

```txt
ClientForm
ClientFilters
AppointmentCard
SaleSummary
ProductTable
```

Devem receber dados e callbacks por props e compor componentes compartilhados.

## 4. Composição de página

```txt
Page
├── Toolbar/Filters
├── Content/List/Table
├── Loading | Empty | Error
└── Modal/Drawer com conteúdo do módulo
```

Evite páginas com múltiplos formulários, tabelas e modais completos inline.

## 5. Modal e formulário

- use o container compartilhado;
- conteúdo de domínio fica no módulo;
- mantenha foco e fechamento acessíveis;
- desabilite ações durante submit;
- não feche em erro 422;
- preserve valores e aba atual em falha;
- confirmação destrutiva deve ser explícita.

## 6. Estados obrigatórios

Toda tela assíncrona deve prever:

- loading;
- empty;
- error;
- success/feedback de ação quando aplicável.

Não confunda lista vazia com erro de requisição.

## 7. Responsividade

Toda alteração deve funcionar em:

- mobile;
- tablet;
- desktop.

Regras:

- evitar largura fixa desnecessária;
- tabelas devem possuir estratégia mobile;
- respeitar `safe-area-inset-*` em navegação fixa;
- garantir padding para barras inferiores;
- evitar overlays e headers cobrindo conteúdo;
- usar breakpoints de forma progressiva.

No mobile, priorize cards/listas legíveis quando tabela horizontal não for adequada.

## 8. Hierarquia visual

- título e ação principal claramente identificados;
- espaçamento consistente;
- uma ação primária por contexto;
- ações destrutivas visualmente distintas;
- badges padronizados para status;
- cores do tema atual, sem criar paleta paralela.

## 9. Tailwind

- prefira classes utilitárias;
- evite inline style sem necessidade;
- extraia padrões repetidos para componente, não para string obscura;
- não use classes arbitrárias quando token existente resolve;
- preserve suporte aos temas já adotados pelo app.

## 10. Acessibilidade

- label associado ao campo;
- botão com nome acessível;
- ícone isolado com `aria-label` ou tooltip;
- foco visível;
- navegação por teclado em modal/menu;
- contraste adequado;
- mensagens de erro associadas aos campos.

## 11. Performance visual

- não execute cálculo pesado no JSX;
- não renderize listas grandes sem paginação;
- use memoização apenas após identificar necessidade;
- evite remontar modal/form por mudança irrelevante;
- não dispare busca remota sem debounce em autocomplete.

## 12. Refatorações

Preserve, salvo solicitação explícita:

- textos;
- posições das ações;
- fluxo do usuário;
- responsividade;
- permissões;
- estados de loading/error;
- comportamento de teclado e modal.

Uma refatoração estrutural não autoriza redesenho visual.

## 13. Checklist

- componente compartilhado reutilizado;
- sem duplicação visual;
- mobile validado;
- loading/empty/error previstos;
- modal preserva estado em erro;
- foco e labels adequados;
- sem chamada HTTP no component;
- sem alteração visual fora do escopo.
