# Frontend Quality Checklist

Use este checklist antes de concluir qualquer alteração no frontend.

A validação deve considerar o escopo da tarefa, a arquitetura atual do repositório e os contratos gerados pelo OpenAPI/Orval.

---

## 1. Escopo da alteração

- [ ] Foram alterados somente os arquivos necessários para a tarefa.
- [ ] Nenhum módulo não relacionado foi refatorado.
- [ ] Nenhuma dependência foi adicionada ou atualizada sem necessidade.
- [ ] O comportamento atual foi preservado fora do escopo solicitado.
- [ ] Não foram criadas abstrações, camadas ou arquivos sem uso real.

---

## 2. TypeScript

- [ ] O projeto está sem erros de TypeScript.
- [ ] Props, estados, callbacks e retornos estão tipados.
- [ ] Formulários e payloads estão tipados.
- [ ] Responses da API utilizam os tipos gerados pelo Orval quando disponíveis.
- [ ] Não existe `any` desnecessário.
- [ ] Não existem casts usados apenas para ocultar incompatibilidades.
- [ ] Campos opcionais e nullable foram tratados de forma segura.

Evitar:

```ts
const params: any = {};
```

Preferir:

```ts
const params: ListClientsParams = {};
```

---

## 3. Imports e dependências

- [ ] Imports foram corrigidos após mover ou renomear arquivos.
- [ ] Não existem imports mortos, duplicados ou circulares.
- [ ] Aliases `@/` são utilizados conforme o padrão do projeto.
- [ ] Nenhum arquivo importa diretamente conteúdo interno de outro módulo sem necessidade.
- [ ] Não existe dependência circular entre módulos.
- [ ] Não foi criada nova biblioteca para resolver algo já suportado pelo projeto.

---

## 4. OpenAPI e Orval

- [ ] O contrato da API foi consultado antes da implementação.
- [ ] As funções e os modelos gerados em `src/core/http/generated` foram reutilizados.
- [ ] Nenhum arquivo dentro de `src/core/http/generated` foi editado manualmente.
- [ ] Não foi criada URL manual para endpoint já gerado.
- [ ] Não foi duplicado type já existente em `generated/models`.
- [ ] O payload enviado corresponde ao tipo gerado.
- [ ] Query params correspondem ao contrato real do endpoint.
- [ ] Quando o contrato mudou, o client foi regenerado com:

```bash
npm run api:generate
```

Fluxo esperado:

```txt
OpenAPI Laravel
→ Orval
→ generated endpoints/models
→ hook ou service do módulo
→ mapper, quando necessário
→ UI
```

---

## 5. Integração com API

- [ ] Nenhum componente ou page usa `fetch` diretamente.
- [ ] Nenhum componente ou page cria instância própria de Axios.
- [ ] As chamadas utilizam endpoints ou hooks gerados pelo Orval.
- [ ] `src/core/http/api.ts` é usado apenas como infraestrutura central.
- [ ] O mutator e os interceptors existentes foram preservados.
- [ ] Não existe endpoint manual paralelo ao endpoint gerado.
- [ ] Não existem chamadas duplicadas para o mesmo recurso.
- [ ] Não existe refetch automático desnecessário.
- [ ] Não existe chamada simultânea no componente pai e no componente filho.
- [ ] A invalidação de cache é específica e não excessivamente ampla.

---

## 6. Services e hooks

- [ ] Service foi criado somente quando existe necessidade de orquestração, adaptação ou compatibilidade.
- [ ] O service encapsula funções geradas, sem recriar o cliente HTTP.
- [ ] Hooks gerados pelo Orval são usados diretamente quando suficientes.
- [ ] Hooks locais existem somente para comportamento reutilizável do módulo.
- [ ] Services e hooks não contêm JSX.
- [ ] Services não contêm regra visual.
- [ ] Services não acessam DOM ou storage diretamente.
- [ ] Services não duplicam funções já geradas.
- [ ] Não existe um service genérico paralelo ao client gerado.

---

## 7. Listagens, filtros e paginação

- [ ] A API é responsável por busca, filtro e paginação quando oferece suporte.
- [ ] Não foi carregada uma coleção completa para filtrar localmente.
- [ ] Não existe busca de todos os clientes, produtos, pets, serviços ou vendas apenas para encontrar um subconjunto.
- [ ] Foram enviados somente os query params necessários.
- [ ] `perPage` não foi enviado por padrão sem requisito explícito.
- [ ] Paginação e metadados utilizam o formato retornado pelo endpoint.
- [ ] Busca com digitação possui debounce quando necessário.
- [ ] Não existe nova requisição para dados que a tela já possui.

Evitar:

```ts
const pets = await listPets();
return pets.filter((pet) => pet.clientId === clientId);
```

Preferir:

```ts
await listPets({
  params: {
    client_id: clientId,
  },
});
```

---

## 8. Arquitetura de módulos

- [ ] O arquivo está no módulo correto.
- [ ] O módulo permanece autocontido.
- [ ] Não foram criadas pastas vazias.
- [ ] A estrutura foi criada conforme a necessidade real, não por obrigação.
- [ ] Componentes de domínio permanecem em `src/modules/{module}/components`.
- [ ] Pages permanecem em `src/modules/{module}/pages`, quando o módulo adota pages.
- [ ] Schemas, mappers, services, hooks e types permanecem no módulo correspondente.
- [ ] Código compartilhado só foi movido para `shared` quando possui reutilização real.
- [ ] Infraestrutura global permanece em `core`.
- [ ] Rotas, providers e bootstrap permanecem em `app`.

Estrutura possível de módulo:

```txt
src/modules/{module}/
├── components/
├── hooks/
├── mappers/
├── pages/
├── schemas/
├── services/
├── types/
└── index.ts
```

Criar somente os diretórios necessários.

---

## 9. Pages

- [ ] A page atua como orquestradora.
- [ ] A page não contém tabela extensa inline.
- [ ] A page não contém modal completo inline.
- [ ] A page não contém regra de negócio pesada.
- [ ] A page não transforma payloads complexos diretamente.
- [ ] A page controla somente estado de tela, composição, filtros e ações principais.
- [ ] Blocos grandes de JSX foram extraídos para componentes do módulo.
- [ ] Loading, empty, error e success states foram tratados.

---

## 10. Componentes

- [ ] Cada componente possui responsabilidade clara.
- [ ] Props são explícitas e tipadas.
- [ ] Não existe chamada HTTP direta dentro de componente visual.
- [ ] Não existe regra de negócio extensa no JSX.
- [ ] Componentes reutilizáveis existentes foram reaproveitados.
- [ ] Componentes específicos do domínio permanecem no módulo.
- [ ] Não foi criado componente global para uso único.
- [ ] Não existe duplicação de modal, botão, input, tabela, card ou badge já existente.

---

## 11. Mappers e tipos da UI

- [ ] Mapper foi criado apenas quando o contrato da API difere do modelo da UI.
- [ ] Não existe mapper que apenas copia propriedades sem transformação.
- [ ] Campos nullable e opcionais são normalizados.
- [ ] Conversões de data, valor, enum e nomenclatura estão centralizadas.
- [ ] O tipo gerado representa o contrato da API.
- [ ] O tipo local representa somente necessidades reais da UI.
- [ ] Não foi duplicado o contrato completo da API em types locais.
- [ ] Conversões `snake_case` para `camelCase` são feitas somente quando o projeto realmente utiliza essa separação.

---

## 12. Forms

- [ ] O formulário usa React Hook Form quando aplicável.
- [ ] A validação usa Zod quando aplicável.
- [ ] O schema está dentro do módulo.
- [ ] Tipos são derivados do schema quando isso reduz duplicação.
- [ ] Payload é preparado por mapper/helper quando necessário.
- [ ] Estado de loading e disabled foi tratado.
- [ ] Erros de campo são exibidos.
- [ ] Erros gerais da API são exibidos.
- [ ] O formulário não é limpo em caso de erro.
- [ ] O modal não fecha em erro de validação.
- [ ] O submit não dispara mais de uma vez.
- [ ] Campos não enviados pela API não foram inventados no frontend.

---

## 13. Tratamento de erros

- [ ] O erro normalizado do core foi reutilizado.
- [ ] O `message` da API é exibido quando disponível.
- [ ] Erros de validação 422 são vinculados aos campos.
- [ ] O estado preenchido pelo usuário é preservado após erro.
- [ ] Erros 401 e 403 respeitam os interceptors e guards existentes.
- [ ] Não existe loop de redirecionamento ou logout.
- [ ] Não existe `catch` vazio.
- [ ] Erros inesperados não são silenciados.
- [ ] Detalhes técnicos não são exibidos ao usuário final.

---

## 14. Autenticação e sessão

- [ ] O fluxo atual de login, logout e recuperação de sessão foi preservado.
- [ ] Não foi criada store paralela de autenticação.
- [ ] O token continua sendo aplicado pelo interceptor central.
- [ ] Sessão local não é usada como fonte fake de dados.
- [ ] Logout aguarda a operação necessária antes de limpar a sessão.
- [ ] Respostas 401 não provocam múltiplos logouts ou redirecionamentos.
- [ ] Guards não fazem requisições duplicadas.

---

## 15. Mocks e dados locais

- [ ] Não existem mocks no fluxo implementado.
- [ ] Não existe fallback fake quando a API falha.
- [ ] Não existe `simulateNetwork`.
- [ ] Não existe `apiConfig.useMocks`.
- [ ] Não existe banco local usado como substituto da API.
- [ ] `localStorage` e `sessionStorage` não são usados como fonte de dados de domínio.
- [ ] Dados demonstrativos não foram misturados com dados reais.

---

## 16. UI e responsividade

- [ ] O layout existente foi preservado quando a tarefa não solicita alteração visual.
- [ ] Textos e comportamento foram preservados.
- [ ] A tela funciona em mobile, tablet e desktop.
- [ ] Não existe overflow horizontal acidental.
- [ ] Modais respeitam altura disponível e possuem rolagem quando necessário.
- [ ] Tabelas possuem estratégia responsiva.
- [ ] Headers e navegação móvel não sobrepõem o conteúdo.
- [ ] Safe area e espaçamento inferior foram considerados no mobile.
- [ ] Loading, empty e error states são visualmente consistentes.
- [ ] Tailwind foi utilizado conforme o padrão existente.
- [ ] Não foram criadas cores, espaçamentos ou estilos paralelos ao design atual.

---

## 17. Acessibilidade

- [ ] Inputs possuem label associado.
- [ ] Botões possuem texto ou `aria-label`.
- [ ] Elementos clicáveis utilizam elementos semânticos.
- [ ] Modais controlam foco adequadamente.
- [ ] Navegação por teclado foi considerada.
- [ ] Contraste e estados de foco permanecem visíveis.
- [ ] Mensagens de erro podem ser identificadas por tecnologias assistivas.

---

## 18. Performance e React Query

- [ ] Query keys seguem o padrão gerado ou já adotado.
- [ ] Não existe query duplicada para o mesmo recurso e parâmetros.
- [ ] `enabled` é usado quando a consulta depende de ID ou estado.
- [ ] Invalidações ocorrem somente após mutação bem-sucedida.
- [ ] Cache existente é reaproveitado quando suficiente.
- [ ] Não existe `useEffect` apenas para copiar dados derivados.
- [ ] Dependências de hooks estão corretas.
- [ ] Memoização foi usada somente quando necessária.
- [ ] Listas grandes não são carregadas integralmente sem necessidade.

---

## 19. Organização e limpeza

- [ ] Não existe código morto.
- [ ] Não existem arquivos órfãos.
- [ ] Não existem diretórios vazios.
- [ ] Não existe duplicação evidente.
- [ ] Não existem comentários obsoletos.
- [ ] Nomes de arquivos e exports seguem o domínio.
- [ ] Arquivos gerados não foram misturados com arquivos manuais.
- [ ] Não foi executada limpeza ampla fora do escopo.
- [ ] Arquivos antigos só foram removidos após confirmar que não possuem uso.

---

## 20. Validação final

Executar os comandos disponíveis no projeto:

```bash
npm run lint
npm run build
```

Quando houver alteração de contrato ou integração:

```bash
npm run api:generate
npm run lint
npm run build
```

Checklist final:

- [ ] `npm run lint` executado sem erros.
- [ ] `npm run build` executado sem erros.
- [ ] A funcionalidade principal foi validada.
- [ ] O fluxo de sucesso foi validado.
- [ ] O fluxo de erro foi validado.
- [ ] O fluxo 422 foi validado quando aplicável.
- [ ] Não existem warnings novos relevantes.
- [ ] O diff final foi revisado.
- [ ] Os arquivos alterados correspondem ao escopo.
- [ ] O resumo final informa arquivos alterados, validações executadas e pendências.

---

## Critério de conclusão

A tarefa só deve ser considerada concluída quando:

```txt
escopo preservado
+ contrato OpenAPI respeitado
+ Orval reutilizado
+ ausência de requisições duplicadas
+ tipagem válida
+ tratamento de erros preservado
+ responsividade validada
+ lint e build aprovados
```
