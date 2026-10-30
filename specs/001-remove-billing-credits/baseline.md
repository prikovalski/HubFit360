# Baseline — 001-remove-billing-credits

Registrado em 2026-10-30, antes de qualquer alteração (T001/T002).

## Lint/Build (T001)

- `npm run build`: OK
- `npm run lint`: 154 problemas pré-existentes (133 errors, 21 warnings), a maioria `no-explicit-any`. Regra de aceite: nenhum erro novo.

Erros por regra:

```text
 125 error @typescript-eslint/no-explicit-any
  12 warning react-hooks/exhaustive-deps
   9 warning react-refresh/only-export-components
   3 error react-hooks/rules-of-hooks
   2 error @typescript-eslint/no-empty-object-type
   1 error prefer-const
   1 error no-case-declarations
   1 error @typescript-eslint/no-require-imports
```

## Varredura SC-002 (T002)

548 ocorrências iniciais. Por arquivo:

```text
  84 supabase/functions/hotmart-webhook/index.ts
  39 src/components/report/UpgradeModal.tsx
  36 src/components/credits/CreditsModal.tsx
  30 src/integrations/supabase/types.ts
  29 src/components/ReportViewer.tsx
  28 src/hooks/useUserCredits.tsx
  28 src/components/TDAHReportViewer.tsx
  27 supabase/functions/upgrade-tdah-assessment/index.ts
  20 supabase/functions/upgrade-assessment/index.ts
  20 src/components/credits/CreditsWidget.tsx
  17 supabase/functions/create-big-five-assessment/index.ts
  15 supabase/functions/create-tdah-assessment/index.ts
  14 supabase/functions/consume-credit/index.ts
  13 src/hooks/useDashboardData.tsx
  12 supabase/functions/delete-user-profile/index.ts
  11 src/components/PollockAssessmentDashboard.tsx
  11 src/components/PhysicalAssessmentDashboard.tsx
  10 src/components/report/PremiumSection.tsx
  10 src/components/TDAHAssessmentForm.tsx
   9 supabase/functions/check-transaction-status/index.ts
   9 src/components/BigFiveAssessmentForm.tsx
   8 supabase/functions/check-user-credits/index.ts
   8 src/components/report/ReportHeader.tsx
   6 src/components/layout/AppSidebar.tsx
   6 src/components/dashboard/OptimizedAssessmentsList.tsx
   6 src/components/dashboard/DashboardHeader.tsx
   6 src/components/DIVA2AssessmentForm.tsx
   6 src/components/BigFiveReportViewer.tsx
   5 supabase/config.toml
   4 src/components/layout/LoggedPageLayout.tsx
   4 src/components/AppContent.tsx
   3 src/utils/tdahPdfGenerator.ts
   2 src/utils/pdfGenerator.ts
   2 src/types/report.ts
   2 src/components/BigFiveDashboard.tsx
   1 supabase/functions/create-assessment/index.ts
   1 supabase/functions/_shared/errorHandler.ts
   1 src/hooks/useTDAHAssessments.tsx
   1 src/hooks/useBigFiveAssessments.tsx
   1 src/components/profile/DeleteProfileDialog.tsx
   1 src/components/dashboard/DashboardStats.tsx
   1 src/components/TDAHDashboard.tsx
   1 README.md
```

## Revisão de segurança das migrations (T045)

Checklist da skill `supabase` aplicada a M1 (`20261030120000_rename_analysis_flags.sql`) e
M2 (`20261030120100_drop_billing_tables.sql`):

- `handle_new_user` permanece `SECURITY DEFINER` com `SET search_path = public` (igual à
  versão vigente). Retorna `trigger`, portanto não é exposta como RPC pelo PostgREST. OK.
- Nenhum `GRANT`, view, policy ou bucket novo. OK.
- `user_metadata` continua sendo usado apenas para dados de perfil no cadastro (comportamento
  pré-existente); o papel vem de `raw_user_meta_data ->> 'role'` — **observação pré-existente,
  fora do escopo**: usuários podem escolher o próprio papel no cadastro (inclusive `ADMIN`).
  Registrar como follow-up de segurança.
- M2 usa `DROP TABLE IF EXISTS … CASCADE` só nas 4 tabelas de cobrança. OK.
- M1 e M2 não foram executadas contra um banco nesta sessão (sem acesso ao projeto
  Supabase); validar com o quickstart §3 após aplicar.

## Resultado após implementação (T049/T050)

- `npm run build`: OK
- `npm run lint`: 141 problemas (121 errors, 20 warnings) contra 154 no baseline; comparação
  por arquivo/regra: **nenhum erro novo** (todas as reduções vêm de código removido).
- `npx tsc --noEmit -p tsconfig.app.json`: OK
- `deno check` nas 8 Edge Functions: OK
- Varredura SC-002 (quickstart §1): **0 ocorrências** (era 548)
- `isValidAnalysis`: 6/6 casos de teste manuais OK
- Quickstart §1: ✅ concluído
- Quickstart §2–§4: ⏳ pendentes — exigem deploy no Supabase e aplicação de M1/M2 pela
  mantenedora (sem acesso ao projeto nesta sessão)
