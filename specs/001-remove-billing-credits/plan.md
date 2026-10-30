# Implementation Plan: Remover cobrança e créditos

**Branch**: `001-remove-billing-credits` | **Date**: 2026-10-30 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-remove-billing-credits/spec.md`

## Summary

Remover toda a monetização do HubFit360 (créditos, compra via Hotmart, gates "premium") e
liberar a análise detalhada por IA, sem cota, para qualquer usuário autenticado. Abordagem:
(1) excluir 4 Edge Functions e o código de créditos do frontend; (2) renomear as funções de
"upgrade" para `generate-*` sem lógica de saldo e idempotentes; (3) fazer a exibição da
análise depender só do estado da avaliação (não de transações); (4) duas migrations novas: M1
troca `tier 'premium'→'detailed'`, renomeia `is_premium →
has_detailed_analysis` e recria `handle_new_user` sem crédito de boas-vindas; M2 remove as 4 tabelas de cobrança;
(5) deploy em ordem código + M1 → M2 → limpeza das funções publicadas; (6) emendar a constituição para 2.0.0.
Detalhes e racional em [research.md](./research.md).

## Technical Context

**Language/Version**: TypeScript 5 (frontend, Vite/React 18); TypeScript em Deno (Edge Functions); SQL (PostgreSQL 15, Supabase)

**Primary Dependencies**: React 18, shadcn/ui, TanStack Query, React Hook Form + Zod, jsPDF, `@supabase/supabase-js` 2; Deno std `http/server`; OpenAI API (composição corporal) e Lovable AI Gateway (Big Five/TDAH)

**Storage**: Supabase Postgres com RLS; Storage bucket privado `assessments`

**Testing**: Sem test runner no projeto. Validação por `npm run lint`, `npm run build`, varredura de termos e roteiro manual ([quickstart.md](./quickstart.md))

**Target Platform**: Web SPA (navegadores modernos) + Supabase Edge Runtime

**Project Type**: Aplicação web (SPA + backend serverless)

**Performance Goals**: Sem mudança; relatório completo acessível em ≤ 1 ação (SC-005)

**Constraints**: Migrations históricas imutáveis; deploy em ordem código + M1 → M2 (R1); indisponibilidade de minutos aceitável; textos pt-BR

**Scale/Scope**: ~30 arquivos de frontend, 9 Edge Functions (4 excluídas, 2 renomeadas, 3 alteradas), 2 migrations, 4 tabelas removidas, 3 colunas alteradas

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Ver `.specify/memory/constitution.md` (v1.1.0). Marque cada gate; justifique violações em Complexity Tracking.

- [x] **I. LGPD/Dados de saúde**: nenhuma tabela nova; remove dados pessoais de compradores sem finalidade (minimização); `delete-user-profile` continua removendo dados do usuário; logs existentes com prompt/resposta/medidas em `upgrade-assessment` são removidos ao reescrevê-lo como `generate-body-analysis` (T012); nenhum log novo com dado sensível
- [x] **II. Identidade via JWT**: `generate-*`, `create-big-five-assessment` e `create-tdah-assessment` já usam `auth.getUser(token)` e filtram pela posse da avaliação; erros via `_shared/errorHandler.ts`. (`create-assessment` com `userId` do body permanece como dívida TODO(P-II), fora do escopo por decisão da spec)
- [x] **III. Cálculos determinísticos**: nenhuma fórmula alterada
- [ ] **IV. IA controlada**: IA continua só no backend; resposta validada antes de persistir via `_shared/aiResponse.ts` (T004a); rate limit em todas as funções que chamam IA, incluindo `create-big-five-assessment`, que hoje não tem e perderia o único freio (o crédito) (T005); falha mantém a avaliação em `basic`/sem análise e o relatório com cálculos; aviso profissional adicionado aos relatórios de composição corporal e Big Five. **Não atendido**: prompts não estão em módulos dedicados (ver Complexity Tracking)
- [x] **V. Créditos/pagamentos**: N/A — esta feature elimina o domínio; o princípio é retirado na emenda 2.0.0 (FR-012, R11)
- [ ] **VI. Testes por risco**: sem testes automatizados (ver Complexity Tracking)
- [x] **VII. Stack/simplicidade**: remove código e dependências internas; nenhuma dependência nova; 1 componente pequeno novo (card "Gerar análise detalhada") reutilizado por 2 telas; textos pt-BR; skills `supabase`/`supabase-postgres-best-practices` aplicam-se à migration

**Re-check pós-design (Phase 1)**: mantido. O design não introduz tabelas, endpoints públicos
nem dependências. **Re-check pós-`/speckit-analyze` (2026-10-30)**: corrigidos C1 (logs
sensíveis), C2 (rate limit no Big Five) e C3 (validação da resposta da IA). Gates não atendidos:
IV (parcial: prompts fora de módulo dedicado) e VI, ambos justificados abaixo.

## Project Structure

### Documentation (this feature)

```text
specs/001-remove-billing-credits/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── edge-functions.md
│   └── ui.md
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit-tasks
```

### Source Code (repository root)

```text
supabase/
├── config.toml                          # remover 4 blocos; renomear 2
├── migrations/
│   ├── 20261030120000_rename_analysis_flags.sql   # NOVA M1 (data-model.md)
│   └── 20261030120100_drop_billing_tables.sql     # NOVA M2
└── functions/
    ├── _shared/errorHandler.ts          # remover INSUFFICIENT_CREDITS
    ├── hotmart-webhook/                 # EXCLUIR
    ├── check-transaction-status/        # EXCLUIR
    ├── check-user-credits/              # EXCLUIR
    ├── consume-credit/                  # EXCLUIR
    ├── upgrade-assessment/              # → generate-body-analysis/
    ├── upgrade-tdah-assessment/         # → generate-tdah-analysis/
    ├── create-big-five-assessment/      # remover saldo; flag por full_report
    ├── create-tdah-assessment/          # remover saldo
    └── delete-user-profile/             # remover passos de crédito

src/
├── components/
│   ├── credits/                         # EXCLUIR (CreditsModal, CreditsWidget)
│   ├── report/
│   │   ├── UpgradeModal.tsx             # EXCLUIR
│   │   ├── PremiumSection.tsx           # EXCLUIR (usar StructuredReportSection)
│   │   ├── GenerateAnalysisCard.tsx     # NOVO
│   │   └── ReportHeader.tsx             # remover isPaid / verificação de pagamento
│   ├── ReportViewer.tsx, TDAHReportViewer.tsx, BigFiveReportViewer.tsx
│   ├── BigFiveAssessmentForm.tsx, TDAHAssessmentForm.tsx, DIVA2AssessmentForm.tsx
│   ├── BigFiveDashboard.tsx, PhysicalAssessmentDashboard.tsx, PollockAssessmentDashboard.tsx
│   ├── AppContent.tsx
│   ├── dashboard/{DashboardHeader,DashboardStats,OptimizedAssessmentsList,AssessmentsList}.tsx
│   ├── layout/{AppSidebar,LoggedPageLayout}.tsx
│   └── profile/DeleteProfileDialog.tsx
├── hooks/
│   ├── useUserCredits.tsx               # EXCLUIR
│   ├── useDashboardData.tsx             # remover join/isPaid
│   ├── useBigFiveAssessments.tsx, useTDAHAssessments.tsx   # is_premium → has_detailed_analysis
├── types/report.ts                      # remover payment_status/upgrade_via_credits
├── utils/{pdfGenerator,tdahPdfGenerator}.ts
└── integrations/supabase/types.ts       # regenerar

README.md, CLAUDE.md, .specify/memory/constitution.md, .specify/templates/plan-template.md
```

**Structure Decision**: Estrutura existente do projeto (SPA em `src/` + Supabase em
`supabase/`); nenhuma pasta nova além de 2 funções renomeadas e 1 componente.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| IV (parcial) — prompts montados dentro de `generate-body-analysis/index.ts` (cópia local de `buildAssessmentPrompt`), `generate-tdah-analysis/index.ts` e `create-big-five-assessment/index.ts`, em vez de módulos dedicados | Dívida pré-existente; esta feature não altera o conteúdo dos prompts, só renomeia/remove cobrança ao redor | Extrair e unificar os prompts (inclusive eliminar a cópia duplicada de `promptBuilder.ts`) muda o comportamento da IA e merece spec própria com comparação de saídas; misturar aqui dificultaria validar a remoção de cobrança. Registrar como TODO(P-IV) na emenda 2.0.0 (T047) |
| VI — sem testes automatizados para `generate-*` e funções de criação alteradas | O projeto não tem test runner (dívida TODO(P-VI)); a feature remove lógica em vez de adicionar regras novas | Configurar Vitest + `deno test` aqui dobraria o escopo de uma feature de remoção; a cobertura é feita por build, varredura SC-002, verificações SQL e roteiro manual de 13 passos no quickstart. Recomenda-se feature dedicada a testes logo em seguida |
