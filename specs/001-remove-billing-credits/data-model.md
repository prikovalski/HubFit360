# Data Model: Remover cobrança e créditos

**Feature**: [spec.md](./spec.md) | **Research**: [research.md](./research.md)

As mudanças vão em **duas** migrations novas em `supabase/migrations/` (migrations
históricas não são alteradas):

- **M1** `20261030120000_rename_analysis_flags.sql`: valores de `tier`, renomeação de
  `is_premium` e `handle_new_user` sem crédito. Aplicada junto com o deploy do código novo.
- **M2** `20261030120100_drop_billing_tables.sql`: remoção das 4 tabelas. Aplicada **depois**
  que o código novo está no ar e M1 aplicada (o trigger antigo grava em `user_credits`; dropar
  antes de M1 quebraria cadastros).

Ordem de aplicação: ver [quickstart.md](./quickstart.md).

## Entidades removidas

| Tabela | Conteúdo | Dependências removidas junto (CASCADE) |
|---|---|---|
| `credit_transactions` | Histórico de débitos/créditos; FK para `users` e `assessments` | policies RLS, FKs |
| `user_credits` | Saldo por usuário | policies RLS, trigger `update_user_credits_updated_at` |
| `hotmart_transactions` | Compras externas (dados de compradores); FK para `hotmart_products` e `users` | policies RLS, FKs |
| `hotmart_products` | Catálogo de produtos e preços | policy "Anyone can view hotmart products", trigger `update_hotmart_products_updated_at` |

Ordem do `DROP TABLE IF EXISTS … CASCADE`: `credit_transactions` → `user_credits` →
`hotmart_transactions` → `hotmart_products`.

## Entidades alteradas

### `assessments` (composição corporal)

| Campo | Antes | Depois |
|---|---|---|
| `tier` | `'basic' \| 'premium'`, `CHECK (tier IN ('basic','premium'))` | `'basic' \| 'detailed'`, `CHECK (tier IN ('basic','detailed'))` |

Migração de dados: `UPDATE assessments SET tier = 'detailed' WHERE tier = 'premium'`, feita
**entre** o drop da constraint antiga e a criação da nova.

Significado: `detailed` = a análise detalhada por IA já foi gerada e está em
`assessment_text`; `basic` = só os cálculos.

Transição de estado:

```text
basic ──(generate-body-analysis ok)──▶ detailed
basic ──(falha da IA)──▶ basic (sem alteração; pode tentar de novo)
detailed ──(generate-body-analysis)──▶ detailed (idempotente; retorna a análise existente)
```

### `tdah_assessments` e `big_five_assessments`

| Campo | Antes | Depois |
|---|---|---|
| `is_premium boolean NOT NULL DEFAULT false` | — | `RENAME COLUMN` → `has_detailed_analysis` (mesmo tipo e default) |

Regra de validação (novo comportamento):
- Big Five: `has_detailed_analysis = true` somente se `full_report` não estiver vazio
  na criação.
- TDAH: `false` na criação; `true` após `generate-tdah-analysis` com sucesso.

### Função `public.handle_new_user()` (trigger de cadastro)

- `CREATE OR REPLACE` com o corpo idêntico ao da migration
  `20251014211344_d19df68a-9be0-437b-b955-c7312a8b68be.sql`, **menos** o bloco
  `-- Grant welcome bonus credits` (inserts em `user_credits` e `credit_transactions`).
- Mantém `LANGUAGE plpgsql`, `SECURITY DEFINER`, `SET search_path = public`.

## Entidades inalteradas

`users`, `user_roles`, `patient_profiles`, `pollock_assessments`, `estados`, `cidades`,
bucket `assessments` (privado).

## Tipos gerados

`src/integrations/supabase/types.ts` deve refletir: remoção das 4 tabelas; `is_premium` →
`has_detailed_analysis` em `tdah_assessments` e `big_five_assessments`.
