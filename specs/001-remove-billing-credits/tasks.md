---

description: "Task list for 001-remove-billing-credits"
---

# Tasks: Remover cobrança e créditos

**Input**: Design documents from `/specs/001-remove-billing-credits/`

**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md),
[data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Não solicitados na spec e sem test runner no projeto (Complexity Tracking do plan).
Cada fase termina com um checkpoint de verificação manual referenciando o quickstart.

**Organization**: Tarefas agrupadas por user story. Termos proibidos na UI/código ativo:
crédito(s), saldo, compra, preço, pagamento, premium, upgrade, Hotmart
([contracts/ui.md](./contracts/ui.md)).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Pode rodar em paralelo (arquivos diferentes, sem dependência pendente)
- **[Story]**: User story da spec (US1–US5)

---

## Phase 1: Setup

**Purpose**: Registrar o estado inicial para comparar depois

- [X] T001 Rodar `npm run lint` e `npm run build` na raiz e anotar erros/avisos pré-existentes em specs/001-remove-billing-credits/baseline.md (para não confundi-los com regressões)
- [X] T002 [P] Rodar a varredura SC-002 do specs/001-remove-billing-credits/quickstart.md §1 e salvar a lista de ocorrências iniciais em specs/001-remove-billing-credits/baseline.md

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Novos nomes de dados e cadastro sem crédito — todas as stories dependem disso

**⚠️ CRITICAL**: Nenhuma story começa antes desta fase

- [X] T003 Criar a migration M1 em supabase/migrations/20261030120000_rename_analysis_flags.sql conforme data-model.md: (a) `ALTER TABLE public.assessments DROP CONSTRAINT` da check de `tier` (descobrir o nome com `pg_constraint`; usar `DO $$ … $$` para dropar a constraint cuja definição contém `'premium'`), (b) `UPDATE public.assessments SET tier = 'detailed' WHERE tier = 'premium'`, (c) `ADD CONSTRAINT assessments_tier_check CHECK (tier IN ('basic','detailed'))`, (d) `ALTER TABLE public.tdah_assessments RENAME COLUMN is_premium TO has_detailed_analysis`, (e) idem para `public.big_five_assessments`, (f) `CREATE OR REPLACE FUNCTION public.handle_new_user()` copiando integralmente o corpo da versão em supabase/migrations/20251014211344_d19df68a-9be0-437b-b955-c7312a8b68be.sql (linha 61 em diante) e removendo apenas o bloco `-- Grant welcome bonus credits` (inserts em `user_credits` e `credit_transactions`); manter `LANGUAGE plpgsql`, `SECURITY DEFINER`, `SET search_path = public`. Consultar a skill `supabase-postgres-best-practices`
- [X] T004 Atualizar src/integrations/supabase/types.ts: em `assessments` nada muda de tipo (tier é string); em `tdah_assessments` e `big_five_assessments` renomear `is_premium` → `has_detailed_analysis` em Row/Insert/Update. (As tabelas de cobrança só saem dos tipos em T043, junto com M2)

- [X] T004a [P] Criar supabase/functions/_shared/aiResponse.ts exportando `isValidAnalysis(text: unknown): text is string` — retorna true somente se for string, `trim().length >= 200` e não começar com mensagens de recusa/erro óbvias (`"Desculpe"`, `"I'm sorry"`, `"Error"`); usado por T005, T012 e T013 para cumprir o Princípio IV ("resposta validada antes de ser persistida")

**Checkpoint**: M1 escrita e tipos coerentes; `npm run build` mostra erros apenas nos pontos que as stories vão corrigir

---

## Phase 3: User Story 1 - Criar qualquer avaliação sem créditos (Priority: P1) 🎯 MVP

**Goal**: Qualquer usuário autenticado cria Big Five, TDAH (ASRS-18 e DIVA 2.0), composição corporal e Pollock sem checagem ou consumo de saldo

**Independent Test**: Conta nova cria 3 avaliações de cada tipo em sequência sem bloqueio (quickstart §4 passos 3, 4, 10)

### Backend

- [X] T005 [P] [US1] Em supabase/functions/create-big-five-assessment/index.ts: remover a leitura de `user_credits` e o `throw new Error('Insufficient credits')`; remover `if (creditsData.balance >= 1)` executando sempre a tentativa de análise por IA quando `LOVABLE_API_KEY` existir; gravar `has_detailed_analysis: fullReport.trim().length > 0` (no lugar de `is_premium: isPremium`); remover o bloco "Consume credit" (update em `user_credits` e insert em `credit_transactions`); renomear comentários "premium" para "análise detalhada"; **(C2)** aplicar rate limit com `checkRateLimit(user.id, { maxRequests: 10, windowMs: 60000 })` de supabase/functions/_shared/rateLimiter.ts logo após autenticar, retornando `createErrorResponse(…, 'RATE_LIMIT_EXCEEDED', 429, { ...corsHeaders, ...getRateLimitHeaders(user.id) })` (mesmo padrão de supabase/functions/upgrade-assessment/index.ts); **(C3)** só gravar `full_report` se passar em `isValidAnalysis` (T004a), senão gravar `''` e `has_detailed_analysis: false`
- [X] T006 [P] [US1] Em supabase/functions/create-tdah-assessment/index.ts: remover a checagem de saldo (resposta 402 "Insufficient credits"), o bloco "Consume 1 credit" e o insert em `credit_transactions`; trocar `is_premium: false` por `has_detailed_analysis: false`

### Frontend

- [X] T007 [P] [US1] Em src/components/BigFiveAssessmentForm.tsx: remover import/uso de `useUserCredits`, o early return com toast "Você precisa de créditos…", o alerta `{!hasCredits && (…)}` e a condição `|| !hasCredits` do `disabled` do botão de envio
- [X] T008 [P] [US1] Em src/components/TDAHAssessmentForm.tsx: remover import/uso de `useUserCredits` (`hasCredits`, `balance`), gates de envio e qualquer texto sobre consumo de crédito
- [X] T009 [P] [US1] Em src/components/DIVA2AssessmentForm.tsx: remover import/uso de `useUserCredits`, o early return com toast "Você precisa de créditos…" e o aviso "Esta avaliação consome 1 crédito…" (por volta da linha 449)
- [X] T010 [P] [US1] Em src/hooks/useBigFiveAssessments.tsx e src/hooks/useTDAHAssessments.tsx: renomear o campo `is_premium` → `has_detailed_analysis` nas interfaces e selects
- [X] T011 [US1] Em src/components/BigFiveDashboard.tsx: remover o badge condicionado a `assessment.is_premium` (linha ~124) — contrato ui.md: sem badge "Premium" (depende de T010)

**Checkpoint**: Com M1 aplicada em ambiente de teste, quickstart §4 passos 3, 4 e 10 passam

---

## Phase 4: User Story 2 - Relatório completo para todos (Priority: P1)

**Goal**: Análise detalhada por IA gratuita, sem cota, em 1 ação, preservando as já geradas

**Independent Test**: quickstart §4 passos 5–9 e 13

### Backend

- [X] T012 [US2] `git mv supabase/functions/upgrade-assessment supabase/functions/generate-body-analysis` e, em supabase/functions/generate-body-analysis/index.ts: remover verificação de saldo, update de `user_credits`, insert em `credit_transactions` e `new_balance`; se `assessment.tier === 'detailed'` retornar 200 `{ success: true, already_generated: true }`; ao gerar, gravar `tier: 'detailed'` e retornar `{ success: true, already_generated: false }`; em falha da IA não alterar a avaliação e responder via `createErrorResponse` (ver contracts/edge-functions.md); trocar textos/logs "premium"/"upgrade" por "análise detalhada"; **(C1)** remover todos os logs com dado sensível — `=== CONSTRUÇÃO DO PROMPT DE UPGRADE ===` (~linha 27), `=== PROMPT ENVIADO PARA OPENAI ===`/`console.log(prompt)` (~linhas 204–206), `=== RESPOSTA COMPLETA DO OPENAI ===` (~linha 239) e o log "Dados da avaliação para upgrade" com circunferências/medidas — mantendo apenas logs com `assessment_id`, flags booleanas e tamanho da resposta; **(C3)** antes do update, validar com `isValidAnalysis` (T004a): se inválida, não alterar a avaliação e responder erro `DEFAULT` (502)
- [X] T013 [US2] `git mv supabase/functions/upgrade-tdah-assessment supabase/functions/generate-tdah-analysis` e, em supabase/functions/generate-tdah-analysis/index.ts: remover checagem de saldo (402), consumo e transação; se `has_detailed_analysis` já for true retornar 200 com `full_report` existente e `already_generated: true`; ao gerar, gravar `has_detailed_analysis: true` e retornar `{ success: true, full_report, already_generated: false }`; renomear textos "premium"/"upgrade"; **(C3)** antes do update, validar com `isValidAnalysis` (T004a): se inválida, manter `has_detailed_analysis: false` e responder erro `DEFAULT` (502); **(C1)** garantir que nenhum log inclua `responses`, prompt ou texto gerado
- [X] T014 [US2] Em supabase/config.toml: renomear `[functions.upgrade-assessment]` → `[functions.generate-body-analysis]` e `[functions.upgrade-tdah-assessment]` → `[functions.generate-tdah-analysis]`, mantendo `verify_jwt = true`

### Frontend

- [X] T015 [P] [US2] Criar src/components/report/GenerateAnalysisCard.tsx (shadcn `Card` + `Button`): props `functionName: 'generate-body-analysis' | 'generate-tdah-analysis'`, `assessmentId: string`, `onGenerated: (data) => void | Promise<void>`; estados inicial/gerando/erro conforme contracts/ui.md (toast de erro "Não foi possível gerar a análise agora. Tente novamente."); sem menção a custo
- [X] T016 [P] [US2] Criar src/components/report/ProfessionalDisclaimer.tsx com o texto "Esta análise é gerada por IA e não substitui a avaliação de um profissional qualificado." (reutilizar estilo do aviso existente em src/components/TDAHReportViewer.tsx ~linha 318)
- [X] T017 [P] [US2] Em src/types/report.ts: remover `payment_status` e `upgrade_via_credits`; tipar `tier` como `'basic' | 'detailed'`
- [X] T018 [P] [US2] Em src/components/report/ReportHeader.tsx: remover props `isPaid`, `onManualPaymentCheck`, `isCheckingPayment` e o botão "Verificar Pagamento"
- [X] T019 [US2] Em src/components/ReportViewer.tsx: remover imports de `PremiumSection` e `UpgradeModal`, estados `showUpgradeModal`/`isPaid`/`loading`, o `useEffect` que consulta `credit_transactions`, `handleUpgradeSuccess`, o bloco "Análise Básica Completa! … Fazer Upgrade para Premium", o `<UpgradeModal>` e os campos `payment_status`/`upgrade_via_credits` da interface local; renderizar `<StructuredReportSection assessmentText=… />` + `<ProfessionalDisclaimer />` quando `tier === 'detailed'`, senão `<GenerateAnalysisCard functionName="generate-body-analysis" … onGenerated={refetchAssessmentData} />`; não passar mais `isPaid` ao `ReportHeader` (depende de T015–T018)
- [X] T020 [US2] Em src/components/TDAHReportViewer.tsx: remover `useUserCredits`, `handleUpgrade` e o card "O que está incluído na análise premium… Custo do upgrade… Fazer Upgrade (1 crédito)"; usar `<GenerateAnalysisCard functionName="generate-tdah-analysis" … onGenerated={(d) => setCurrentReport({ ...currentReport, has_detailed_analysis: true, full_report: d.full_report })} />` quando `!currentReport.has_detailed_analysis`; manter o aviso existente (depende de T015)
- [X] T021 [US2] Em src/components/BigFiveReportViewer.tsx: renomear `is_premium` → `has_detailed_analysis`; remover o badge "Premium" (~linha 67) e o card "Análise Premium Disponível / Fazer Upgrade" (~linhas 161–172); quando houver `full_report` exibir com `<ProfessionalDisclaimer />`, senão o texto "Análise detalhada indisponível para esta avaliação." (depende de T016)
- [X] T022 [P] [US2] Em src/utils/pdfGenerator.ts: remover a condição `if (report.status === 'paid' || report.tier === 'premium')` (~linha 287) para que a seção de recomendações seja sempre incluída; trocar comentário "versão premium"
- [X] T023 [P] [US2] Em src/utils/tdahPdfGenerator.ts: renomear `is_premium` → `has_detailed_analysis` (interface ~linha 14 e condição ~linha 402)
- [X] T024 [US2] Excluir src/components/report/UpgradeModal.tsx e src/components/report/PremiumSection.tsx (depende de T019)

**Checkpoint**: quickstart §4 passos 5–9 e 13 passam em ambiente de teste

---

## Phase 5: User Story 3 - Interface sem qualquer menção a cobrança (Priority: P2)

**Goal**: Nenhuma tela, menu, toast ou PDF menciona cobrança

**Independent Test**: Navegar por todas as telas + quickstart §4 passos 1, 2, 11

- [X] T025 [P] [US3] Em src/components/layout/AppSidebar.tsx: remover `useUserCredits` e a exibição de `{balance}` (~linhas 33, 68, 77)
- [X] T026 [P] [US3] Em src/components/AppContent.tsx (~linhas 365–392): remover a frase "Faça upgrade para relatório premium…" e substituir o bloco "Cada avaliação consome 1 crédito… Adquira mais créditos…" por texto neutro sobre as avaliações disponíveis (ou remover o bloco)
- [X] T027 [P] [US3] Em src/components/layout/LoggedPageLayout.tsx (~linhas 105–125): mesma alteração de T026
- [X] T028 [P] [US3] Em src/components/dashboard/DashboardHeader.tsx: remover import/uso de `CreditsWidget` e a prop `onBuyCredits` da interface e da assinatura
- [X] T029 [P] [US3] Em src/components/dashboard/DashboardStats.tsx: remover import/uso de `CreditsWidget`
- [X] T030 [US3] Em src/components/PhysicalAssessmentDashboard.tsx: remover `useUserCredits`, `CreditsModal`, estado `creditsModalOpen`, `handleBuyCredits`, a prop `onBuyCredits` passada ao header e o `<CreditsModal>` (depende de T028)
- [X] T031 [P] [US3] Em src/components/PollockAssessmentDashboard.tsx: remover `useUserCredits`, `CreditsWidget`, `CreditsModal` e o estado `showCreditsModal`
- [X] T032 [P] [US3] Em src/hooks/useDashboardData.tsx: remover `useUserCredits`, o join `credit_transactions!left (…)`, a lógica `isPaid` e o campo `payment_status`; manter `tier`
- [X] T033 [P] [US3] Em src/components/dashboard/OptimizedAssessmentsList.tsx: remover `payment_status`/`upgrade_via_credits` e a lógica `isPaid`; badge "Análise detalhada" quando `tier === 'detailed'`, senão "Concluída"
- [X] T034 [P] [US3] Em src/components/dashboard/AssessmentsList.tsx: no `getStatusBadge`, trocar `case 'paid'` por `case 'completed'` (label "Concluída"); confirmar os valores reais de `status` gravados em supabase/functions/create-assessment/assessmentService.ts
- [X] T035 [P] [US3] Em src/components/profile/DeleteProfileDialog.tsx: remover o item "Histórico de pagamentos" (~linha 48)
- [X] T036 [US3] Excluir src/hooks/useUserCredits.tsx e a pasta src/components/credits/ (CreditsModal.tsx, CreditsWidget.tsx) após confirmar com `grep -rn "useUserCredits\|components/credits" src` que não há mais consumidores (depende de T007–T009, T020, T024, T025, T028–T032)

**Checkpoint**: `npm run build` sem erros; quickstart §4 passos 1, 2 e 11 passam

---

## Phase 6: User Story 4 - Remover a infraestrutura de cobrança (Priority: P2)

**Goal**: Sem código, endpoints ou configuração de cobrança no repositório

**Independent Test**: quickstart §1 (varredura e `ls supabase/functions`) e §4 passo 12

- [X] T037 [P] [US4] Excluir as pastas supabase/functions/hotmart-webhook/, supabase/functions/check-transaction-status/, supabase/functions/check-user-credits/ e supabase/functions/consume-credit/
- [X] T038 [US4] Em supabase/config.toml: remover os blocos `[functions.hotmart-webhook]`, `[functions.check-transaction-status]`, `[functions.check-user-credits]` e `[functions.consume-credit]` (depende de T014 por ser o mesmo arquivo)
- [X] T039 [P] [US4] Em supabase/functions/_shared/errorHandler.ts: remover a entrada `INSUFFICIENT_CREDITS`
- [X] T040 [P] [US4] Em supabase/functions/delete-user-profile/index.ts: remover os passos "1. Delete credit transactions" e "2. Delete user credits" (~linhas 67–89) e renumerar os comentários seguintes
- [X] T041 [US4] Rodar a varredura SC-002 do quickstart §1 e corrigir qualquer ocorrência restante em src/, supabase/functions/ e supabase/config.toml (exceções: `payment=()` em src/components/security/SecurityHeaders.tsx e src/components/ui/) (depende de US1–US3 e T037–T040)

**Checkpoint**: Varredura vazia; `ls supabase/functions` sem as 6 funções antigas

---

## Phase 7: User Story 5 - Tratamento dos dados de cobrança existentes (Priority: P3)

**Goal**: Exclusão definitiva das tabelas/dados de cobrança sem perder avaliações

**Independent Test**: quickstart §3 (consultas SQL)

- [X] T042 [US5] Criar a migration M2 em supabase/migrations/20261030120100_drop_billing_tables.sql com, nesta ordem, `DROP TABLE IF EXISTS public.credit_transactions CASCADE;`, `public.user_credits`, `public.hotmart_transactions`, `public.hotmart_products` (CASCADE remove policies, triggers e FKs — data-model.md); comentário no topo indicando que só deve ser aplicada após M1 e o deploy do código novo
- [X] T043 [US5] Em src/integrations/supabase/types.ts: remover as definições das tabelas `credit_transactions`, `user_credits`, `hotmart_transactions` e `hotmart_products` (ou regenerar com `supabase gen types typescript --project-id bqixlrinahtauahcnpoc` após aplicar M2) (depende de T042)
- [X] T044 [US5] Rodar `npm run build` para confirmar que nenhum código ainda referencia as tabelas removidas dos tipos (depende de T043 e Phase 5)
- [X] T045 [US5] Revisar as duas migrations contra a checklist de segurança da skill `supabase` (SECURITY DEFINER com search_path fixo, sem grants novos) e registrar o resultado em specs/001-remove-billing-credits/baseline.md

**Checkpoint**: Migrations prontas para a sequência do quickstart §2

---

## Phase 8: Polish & Cross-Cutting Concerns

- [X] T046 [P] Reescrever README.md como projeto open source de portfólio (FR-011): o que é, stack, como rodar localmente, secrets das Edge Functions (`OPENAI_API_KEY` para composição corporal, `LOVABLE_API_KEY` para Big Five/TDAH) e comportamento sem eles; manter a seção de Spec-Driven Development; sem planos/compra
- [X] T047 Emendar a constituição para 2.0.0 executando `/speckit-constitution` com a instrução de research R11: remover Princípio V; no Princípio IV trocar "falha MUST NOT consumir crédito" por "falha MUST NOT impedir o relatório nem o acesso aos cálculos"; remover "consumo de créditos e webhooks (P-V)" do Princípio VI; remover TODO(P-V) do Sync Impact Report e adicionar TODO(P-IV): prompts de generate-body-analysis, generate-tdah-analysis e create-big-five-assessment fora de módulo dedicado (ver Complexity Tracking do plan); atualizar .specify/memory/constitution.md e remover o gate V de .specify/templates/plan-template.md (FR-012)
- [X] T048 [P] Em CLAUDE.md: remover a seção "Feature ativa" e a menção a créditos no resumo do produto ("com sistema de créditos via Hotmart")
- [X] T049 Rodar `npm run lint` e `npm run build` e comparar com specs/001-remove-billing-credits/baseline.md; nenhum erro novo (depende de todas as fases)
- [ ] T050 Executar o roteiro completo do specs/001-remove-billing-credits/quickstart.md (§1 a §4) em ambiente de teste e marcar o resultado de cada passo em specs/001-remove-billing-credits/baseline.md; os passos de implantação em produção (§2) são executados pela mantenedora

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (1)** → **Foundational (2)** → bloqueia todas as stories (T004a é pré-requisito de T005, T012 e T013)
- **US1 (3)** e **US2 (4)**: após Phase 2; independentes entre si, exceto que ambas alimentam T036
- **US3 (5)**: após Phase 2; T036 depende de US1 (T007–T009) e US2 (T020, T024)
- **US4 (6)**: T037–T040 após Phase 2; T041 depende de US1–US3
- **US5 (7)**: T042 pode ser escrita a qualquer momento; T043–T044 dependem de Phase 5 (nenhum consumidor das tabelas)
- **Polish (8)**: após todas as stories

### Story completion order

```text
Setup → Foundational ─┬─ US1 ─┐
                      ├─ US2 ─┼─ US3 ─ US4(T041) ─ US5(T043/T044) ─ Polish
                      └───────┘
```

### Ordem de implantação (não é ordem de implementação)

Código + M1 juntos → validar cadastro → M2 → apagar funções publicadas antigas
(quickstart §2).

## Parallel Example

```text
# Phase 3 (US1) — todos em arquivos distintos:
T005 create-big-five-assessment  |  T006 create-tdah-assessment
T007 BigFiveAssessmentForm       |  T008 TDAHAssessmentForm  |  T009 DIVA2AssessmentForm
T010 hooks Big Five/TDAH

# Phase 4 (US2) — preparar peças antes dos viewers:
T015 GenerateAnalysisCard  |  T016 ProfessionalDisclaimer  |  T017 types/report  |  T018 ReportHeader
T022 pdfGenerator          |  T023 tdahPdfGenerator

# Phase 5 (US3):
T025 AppSidebar | T026 AppContent | T027 LoggedPageLayout | T028 DashboardHeader | T029 DashboardStats
T031 Pollock dashboard | T032 useDashboardData | T033/T034 listas | T035 DeleteProfileDialog
```

## Implementation Strategy

### MVP (US1 + US2, ambos P1)

1. Phases 1–2
2. US1 → validar criação sem bloqueio
3. US2 → validar análise detalhada gratuita e preservação das antigas
4. Nesse ponto o app já é utilizável sem cobrança, mas ainda contém UI/código de créditos
   inativos — **não publicar** só o MVP, pois US3/US4 removem telas que chamariam funções
   apagadas; publicar ao fim da Phase 6

### Entrega incremental

- Commits por fase (um por story) na branch `001-remove-billing-credits`
- Um único PR e uma única janela de implantação ao final (quickstart §2)

## Notes

- Total: 51 tarefas (T004a inserida após a análise; IDs existentes preservados)
- Termos proibidos e exceções: contracts/ui.md e quickstart §1
- Não editar migrations históricas
