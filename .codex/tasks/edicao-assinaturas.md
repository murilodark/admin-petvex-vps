Segue a tarefa completa para o Codex:

````md
# Tarefa Codex — Admin Petvex: Gestão operacional de Assinaturas, Pagamentos e Faturas

## Objetivo

Alterar os módulos administrativos de cobranças em `adm.petvex.com.br` para permitir gestão operacional completa dos registros de billing:

- Assinaturas
- Pagamentos
- Faturas
- Cobranças vinculadas

O admin global deve conseguir visualizar, editar dados permitidos, cancelar, suspender, reativar, ativar, marcar status operacional e sincronizar registros quando aplicável, mantendo segurança, rastreabilidade e compatibilidade com a API existente.

---

## Regras obrigatórias

1. Não usar mocks.
2. Não criar endpoints manuais fora do padrão existente.
3. Consultar o OpenAPI da API antes de implementar:
   - `GET /api/v1/openapi/types`
4. Usar os services/hooks/tipos gerados pelo Orval.
5. Não duplicar chamadas HTTP.
6. Não enviar `perPage` por padrão.
7. Preservar arquitetura atual do admin.
8. Reutilizar componentes globais já existentes:
   - Modal
   - Button
   - Badge
   - Table
   - ConfirmDialog
   - Form fields
   - Toast/Alert
9. Modal não deve fechar automaticamente em erro 422/500.
10. Toda ação destrutiva deve exigir confirmação.
11. Toda alteração deve exibir feedback visual.
12. Não recriar layout, tema ou componentes sem necessidade.
13. Respeitar permissões de admin global.
14. Não permitir ações inválidas para status incompatíveis.

---

# Módulo: Assinaturas

Página atual:

`/admin/billing/subscriptions`

## Implementar ações por assinatura

Na tabela de assinaturas, adicionar/organizar ações conforme status:

### Visualizar detalhes

Manter ação atual de visualizar dossiê/detalhes.

Deve exibir:

- ID
- Cliente SaaS / tenant
- Plano
- Status atual
- Ciclo
- Valor
- Gateway
- Data de criação
- Início do período
- Fim do período
- Cancelada em
- Trial até
- Último pagamento
- Fatura vinculada
- Histórico operacional, se disponível

---

### Editar assinatura

Criar modal de edição usando formulário controlado.

Campos editáveis somente quando existirem no OpenAPI/backend:

- Plano contratado
- Ciclo de cobrança
- Status operacional
- Data de início do período
- Data final do período
- Trial até
- Observações internas, caso exista
- Gateway, caso permitido pela API

Não editar campos sensíveis se a API não permitir.

O modal deve:

- Carregar dados atuais
- Validar campos
- Enviar somente campos alterados
- Exibir erros 422 por campo
- Não fechar em erro
- Atualizar listagem após sucesso

---

### Suspender assinatura

Adicionar ação `Suspender`.

Disponível para status:

- `trialing`
- `active`

Confirmar antes de executar.

Mensagem sugerida:

> Deseja suspender esta assinatura? O tenant poderá perder acesso conforme as regras da API.

---

### Reativar assinatura

Adicionar ação `Reativar`.

Disponível para status:

- `suspended`
- `payment_required`
- `cancelled`, somente se a API permitir

Confirmar antes de executar.

---

### Cancelar assinatura

Adicionar ação `Cancelar`.

Disponível para status:

- `trialing`
- `active`
- `payment_required`
- `suspended`

Confirmar antes de executar.

Deve usar endpoint existente de cancelamento administrativo, se disponível no OpenAPI.

Não remover registro do banco.

---

### Ativar assinatura

Adicionar ação `Ativar`.

Usar somente se existir endpoint administrativo no OpenAPI.

Disponível para status:

- `pending`
- `trialing`
- `payment_required`
- `suspended`

Se não existir endpoint específico, não inventar endpoint no front.

---

# Módulo: Pagamentos

Página atual:

`/admin/billing/payments`

## Implementar ações por pagamento

### Visualizar dossiê

Manter modal atual.

Deve exibir:

- Valor lançado
- Status
- ID interno
- Assinatura associada
- Fatura associada
- Gateway
- Gateway payment ID
- Transaction ID
- Método
- Data de criação
- Data de pagamento
- Data de cancelamento/falha, se houver
- Último retorno do gateway, se existir

---

### Sincronizar status

Manter botão existente.

Usar rota já confirmada:

```http
PATCH /api/v1/admin/billing/payments/{payment}/sync-status
````

Regras:

* Disponível para pagamentos `pending`, `failed` ou status compatíveis definidos pela API.
* Exibir loading apenas no botão acionado.
* Após sucesso, invalidar queries de:

  * pagamentos
  * assinatura vinculada
  * fatura vinculada
  * summary se existir

---

### Editar pagamento

Criar modal de edição apenas para campos operacionais permitidos pela API.

Campos possíveis, conforme OpenAPI:

* Status
* Método
* Valor
* Gateway
* Gateway payment ID
* Transaction ID
* Observações internas, se existir
* Datas operacionais, se existirem

Regras:

* Não permitir editar pagamento já aprovado/pago sem confirmação especial.
* Não permitir alteração que gere inconsistência com assinatura/fatura se a API bloquear.
* Mostrar mensagens de validação retornadas pela API.

---

### Cancelar pagamento

Adicionar ação `Cancelar pagamento`.

Disponível para status:

* `pending`
* `failed`
* `processing`, se existir

Não disponível para:

* `paid`
* `approved`
* `refunded`, salvo se API permitir fluxo próprio

Confirmar antes de executar.

Mensagem sugerida:

> Deseja cancelar este pagamento? Esta ação não remove o registro, apenas altera sua condição operacional conforme regras da API.

---

### Marcar como pago / aprovado

Adicionar somente se existir endpoint administrativo no OpenAPI.

Uso esperado:

* Ajuste manual quando gateway não notificou webhook.
* Deve exigir confirmação forte.
* Deve atualizar assinatura/fatura vinculada se a API fizer isso.

Mensagem:

> Confirma marcar este pagamento como pago? Essa ação pode ativar assinatura e liquidar fatura vinculada.

---

# Módulo: Faturas

Página atual:

`/admin/billing/invoices`

## Implementar ações por fatura

### Visualizar dossiê

Manter modal atual.

Deve exibir:

* Número da fatura
* Tenant / cliente
* E-mail
* Valor
* Status
* Assinatura vinculada
* Pagamento vinculado
* Gateway
* Emissão
* Vencimento
* Pagamento
* Cancelamento
* Histórico operacional, se disponível

---

### Editar fatura

Criar modal de edição com campos permitidos pela API:

* Status
* Valor
* Data de vencimento
* Data de pagamento
* Observações internas, se existir

Regras:

* Não editar número da fatura se for gerado pela API.
* Não editar tenant ou assinatura diretamente.
* Não permitir inconsistência entre fatura paga e pagamento pendente, salvo se backend aceitar.

---

### Cancelar fatura

Adicionar ação `Cancelar fatura`.

Disponível para:

* `pending`
* `open`
* `overdue`
* `failed`

Não disponível para:

* `paid`, salvo endpoint específico

Confirmar antes de executar.

---

### Marcar como paga

Adicionar somente se existir endpoint no OpenAPI.

Deve exigir confirmação.

Após sucesso, atualizar:

* lista de faturas
* lista de pagamentos
* lista de assinaturas
* detalhes do tenant, se existir cache relacionado

---

# UX das ações

## Ícones

Padronizar ações:

* Visualizar: olho
* Editar: lápis
* Sincronizar: refresh
* Suspender: pause/bloqueio
* Reativar/Ativar: check/play
* Cancelar: shield/x/trash sem remover registro

Evitar excesso visual. Usar tooltip em todas as ações.

---

## Estados de loading

Cada linha deve ter loading individual.

Não travar a tela inteira para ações simples.

---

## Confirmações

Toda ação crítica deve usar modal de confirmação global.

Exemplos:

* Cancelar assinatura
* Suspender assinatura
* Reativar assinatura
* Cancelar pagamento
* Marcar pagamento como pago
* Cancelar fatura
* Marcar fatura como paga

---

## Tratamento de erros

Exibir claramente:

* 422: mensagens por campo ou alerta no modal
* 403: sem permissão
* 404: registro não encontrado
* 409: conflito operacional
* 500: erro inesperado com mensagem amigável

Não ocultar mensagem retornada pela API.

---

# Integração com API

Antes de implementar, verificar no OpenAPI quais rotas existem para:

## Assinaturas admin

Possíveis endpoints esperados:

```http
GET    /api/v1/admin/billing/subscriptions
GET    /api/v1/admin/billing/subscriptions/{subscription}
PATCH  /api/v1/admin/billing/subscriptions/{subscription}
PATCH  /api/v1/admin/billing/subscriptions/{subscription}/suspend
PATCH  /api/v1/admin/billing/subscriptions/{subscription}/reactivate
PATCH  /api/v1/admin/billing/subscriptions/{subscription}/cancel
PATCH  /api/v1/admin/billing/subscriptions/{subscription}/activate
```

## Pagamentos admin

```http
GET    /api/v1/admin/billing/payments
GET    /api/v1/admin/billing/payments/{payment}
PATCH  /api/v1/admin/billing/payments/{payment}
PATCH  /api/v1/admin/billing/payments/{payment}/sync-status
PATCH  /api/v1/admin/billing/payments/{payment}/cancel
PATCH  /api/v1/admin/billing/payments/{payment}/mark-as-paid
```

## Faturas admin

```http
GET    /api/v1/admin/billing/invoices
GET    /api/v1/admin/billing/invoices/{invoice}
PATCH  /api/v1/admin/billing/invoices/{invoice}
PATCH  /api/v1/admin/billing/invoices/{invoice}/cancel
PATCH  /api/v1/admin/billing/invoices/{invoice}/mark-as-paid
```

Se alguma rota não existir no OpenAPI, não implementar chamada manual. Apenas ocultar a ação ou deixar como melhoria dependente da API.

---

# Cache e invalidação

Após qualquer mutação, invalidar somente queries necessárias:

* `admin billing subscriptions`
* `admin billing payments`
* `admin billing invoices`
* detalhe do registro alterado
* billing summary se existir

Evitar refetch duplicado.

---

# Validações de status

Criar helpers reutilizáveis:

```ts
canEditSubscription(subscription)
canSuspendSubscription(subscription)
canReactivateSubscription(subscription)
canCancelSubscription(subscription)
canActivateSubscription(subscription)

canEditPayment(payment)
canSyncPayment(payment)
canCancelPayment(payment)
canMarkPaymentAsPaid(payment)

canEditInvoice(invoice)
canCancelInvoice(invoice)
canMarkInvoiceAsPaid(invoice)
```

Esses helpers devem centralizar regras de exibição de ações.

---

# Segurança

Não permitir ações com base apenas no front.

O front apenas exibe/oculta ações para UX.

A API continua sendo autoridade final.

---

# Resultado esperado

Ao final, no admin global deve ser possível:

1. Gerenciar assinaturas SaaS.
2. Editar dados operacionais permitidos.
3. Suspender, cancelar, reativar ou ativar assinaturas conforme API.
4. Sincronizar pagamentos pendentes/falhados.
5. Cancelar pagamentos quando permitido.
6. Marcar pagamento como pago somente se houver endpoint.
7. Editar faturas operacionais.
8. Cancelar ou liquidar faturas conforme API.
9. Visualizar dossiês completos.
10. Manter padrão visual atual do admin.
11. Não quebrar fluxo existente de cobrança manual e Mercado Pago.

---

# Testes obrigatórios

Validar manualmente:

* Listagem de assinaturas carrega sem duplicidade.
* Filtros continuam funcionando.
* Visualização de dossiê continua funcionando.
* Editar assinatura com sucesso.
* Editar assinatura com erro 422 não fecha modal.
* Suspender assinatura.
* Reativar assinatura.
* Cancelar assinatura.
* Sincronizar pagamento pendente.
* Cancelar pagamento pendente.
* Editar pagamento.
* Visualizar fatura.
* Editar fatura.
* Cancelar fatura.
* Erros 403/404/409/500 são exibidos corretamente.
* Nenhuma ação inexistente no OpenAPI é chamada manualmente.

```
```
