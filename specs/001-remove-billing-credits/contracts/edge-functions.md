# Contracts: Edge Functions

Todas exigem JWT (`verify_jwt = true`) e identificam o usuário via `auth.getUser(token)`.
Erros seguem `_shared/errorHandler.ts`: `{ "success": false, "error": "<mensagem genérica>" }`.

## Removidas

| Função | Comportamento após o deploy |
|---|---|
| `hotmart-webhook` | Inexistente (404 da plataforma) |
| `check-transaction-status` | Inexistente |
| `check-user-credits` | Inexistente |
| `consume-credit` | Inexistente |

## `generate-body-analysis` (substitui `upgrade-assessment`)

Gera a análise detalhada por IA de uma avaliação de composição corporal do usuário.

**Request** `POST` body:

```json
{ "assessment_id": "<uuid>" }
```

**Responses**

| Status | Quando | Body |
|---|---|---|
| 200 | Análise gerada agora | `{ "success": true, "already_generated": false }` |
| 200 | Já existia (`tier = 'detailed'`) | `{ "success": true, "already_generated": true }` |
| 400 | `assessment_id` ausente/inválido | erro `INVALID_INPUT` |
| 401 | Sem token ou token inválido | erro `UNAUTHORIZED` |
| 404 | Avaliação não existe ou não pertence ao usuário | erro `NOT_FOUND` |
| 429 | Mais de 10 req/min do mesmo usuário | erro `RATE_LIMIT_EXCEEDED` |
| 500/502 | Falha da IA ou IA não configurada | erro `DEFAULT`; avaliação permanece `basic` |

Não há campos `new_balance` nem verificação de saldo. O cliente recarrega a avaliação após
o 200.

## `generate-tdah-analysis` (substitui `upgrade-tdah-assessment`)

**Request** `POST` body:

```json
{ "assessment_id": "<uuid>" }
```

**Responses**

| Status | Quando | Body |
|---|---|---|
| 200 | Gerada ou já existente | `{ "success": true, "full_report": "<texto>", "already_generated": <bool> }` |
| 400 | `assessment_id` ausente/inválido | `INVALID_INPUT` |
| 401 | Não autenticado | `UNAUTHORIZED` |
| 404 | Não encontrada / não pertence ao usuário | `NOT_FOUND` |
| 429 | Rate limit | `RATE_LIMIT_EXCEEDED` |
| 500/502 | Falha da IA ou IA não configurada | `DEFAULT`; `has_detailed_analysis` permanece `false` |

O status 402 ("Insufficient credits") deixa de existir.

## `create-big-five-assessment` (alterada)

- Request inalterado.
- Remove: leitura de `user_credits`, erro "Insufficient credits", débito e registro de
  transação.
- Response: o registro criado passa a expor `has_detailed_analysis` (no lugar de
  `is_premium`), `true` apenas se a análise foi gerada.

## `create-tdah-assessment` (alterada)

- Request inalterado.
- Remove: checagem de saldo (402), débito e registro de transação.
- Response: registro criado com `has_detailed_analysis: false`.

## `delete-user-profile` (alterada)

- Request/response inalterados.
- Remove os passos de exclusão em `credit_transactions` e `user_credits`; demais passos
  permanecem na mesma ordem.
