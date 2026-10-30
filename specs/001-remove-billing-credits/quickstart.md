# Quickstart: validar a remoção de cobrança e créditos

**Feature**: [spec.md](./spec.md) · Contratos: [edge-functions](./contracts/edge-functions.md),
[ui](./contracts/ui.md) · Dados: [data-model.md](./data-model.md)

## 1. Verificações estáticas (antes do deploy)

```bash
npm run lint
npm run build
```

Varredura SC-002 (deve retornar **nada**):

```bash
grep -rniE "cr[eé]dito|credit|saldo|\bbalance\b|hotmart|premium|upgrade|pagamento|payment|checkout|compra" \
  src supabase/functions supabase/config.toml README.md \
  | grep -v "src/components/ui/" \
  | grep -v "payment=()"        # Permissions-Policy (segurança), exceção documentada
```

Funções removidas não existem mais no repositório:

```bash
ls supabase/functions   # sem hotmart-webhook, check-transaction-status, check-user-credits,
                        # consume-credit, upgrade-assessment, upgrade-tdah-assessment
```

## 2. Implantação (ordem obrigatória — research R1)

1. **Backup opcional** dos dados de cobrança (SQL Editor do Supabase → exportar
   `credit_transactions`, `user_credits`, `hotmart_transactions`, `hotmart_products` como CSV).
2. **Deploy do app e das Edge Functions** novas/alteradas (merge na `main`; o Lovable publica
   o frontend; funções via Lovable ou `supabase functions deploy`).
3. **Aplicar M1** (`20261030120000_rename_analysis_flags.sql`) imediatamente após o deploy
   (SQL Editor ou `supabase db push`). Testar um cadastro novo.
3b. **Aplicar M2** (`20261030120100_drop_billing_tables.sql`) somente depois de confirmar que
   o app novo está no ar e o cadastro funciona.
4. **Remover funções antigas publicadas**:
   `supabase functions delete hotmart-webhook check-transaction-status check-user-credits consume-credit upgrade-assessment upgrade-tdah-assessment`
   (ou pelo painel: Edge Functions → excluir).
5. **Remover secret** `HOTMART_WEBHOOK_SECRET` (painel → Edge Functions → Secrets).
6. Desativar o produto/webhook na conta Hotmart (fora do sistema).

## 3. Verificação do banco (após a migration)

```sql
-- Deve retornar 0 linhas
select table_name from information_schema.tables
where table_schema = 'public'
  and table_name in ('credit_transactions','user_credits','hotmart_transactions','hotmart_products');

-- Deve retornar apenas 'basic' e/ou 'detailed'
select tier, count(*) from public.assessments group by tier;

-- Deve listar has_detailed_analysis nas duas tabelas e nenhum is_premium
select table_name, column_name from information_schema.columns
where table_schema = 'public' and column_name in ('is_premium','has_detailed_analysis');

-- O trigger de cadastro não deve mais citar créditos
select position('user_credits' in pg_get_functiondef('public.handle_new_user'::regproc)) = 0 as ok;
```

## 4. Roteiro manual (app publicado ou `npm run dev` em http://localhost:8080)

| # | Passo | Esperado | Cobre |
|---|---|---|---|
| 1 | Criar conta nova | Cadastro ok; nenhuma mensagem de crédito | FR-005, US3 |
| 2 | Sidebar e painéis | Sem saldo/widget/botão de compra | FR-004 |
| 3 | Criar 3 avaliações Big Five seguidas | Todas criadas; relatório com escores (+ análise se IA configurada) | FR-001, SC-001 |
| 4 | Criar 3 TDAH (ASRS-18) e 1 DIVA 2.0 | Todas criadas, sem aviso de consumo | FR-001 |
| 5 | Relatório TDAH → "Gerar análise detalhada" | Análise aparece em 1 clique; clicar de novo não duplica | FR-002, SC-005 |
| 6 | Criar composição corporal → "Gerar análise detalhada" | Análise aparece + aviso profissional | FR-002 |
| 7 | Abrir avaliação antiga que era premium | Análise antiga continua visível | FR-008, SC-004 |
| 8 | Abrir avaliação antiga básica → gerar | Análise gerada | US2 cenário 3 |
| 9 | Exportar PDF de composição e TDAH | Recomendações incluídas; nenhum termo de cobrança | FR-009 |
| 10 | Criar Pollock | Funciona como antes | regressão |
| 11 | Excluir a conta de teste | Exclusão concluída sem erro; diálogo sem "pagamentos" | FR-007 |
| 12 | `curl -i -X POST https://bqixlrinahtauahcnpoc.supabase.co/functions/v1/hotmart-webhook` | 404 | SC-003 |
| 13 | Sem `OPENAI_API_KEY` (ambiente local/clonado): gerar análise | Erro amigável; cálculos continuam visíveis | Edge case |
