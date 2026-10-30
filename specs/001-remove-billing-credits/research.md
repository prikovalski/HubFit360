# Research: Remover cobrança e créditos

**Feature**: [spec.md](./spec.md) | **Date**: 2026-10-30

Levantamento feito no código em `main@ea19eb1`. Cada item: decisão, racional, alternativas.

## R1. Ordem de implantação (código antes do banco)

- **Decision**: Duas migrations. M1 (renomeações + `handle_new_user` sem crédito) é aplicada
  na mesma janela do deploy do código novo; M2 (drop das tabelas de cobrança) só depois, quando
  nada mais as lê ou escreve. Sequência: deploy do app/funções → M1 → M2 → remoção das funções
  antigas publicadas.
- **Rationale**: `useDashboardData` faz join com `credit_transactions`, `ReportViewer`
  consulta `credit_transactions` e várias telas chamam `check-user-credits`. Se o banco mudar
  antes, dashboard e relatórios quebram.
- **Alternatives**: Migration primeiro (quebra o app em produção); manter tabelas vazias por um
  tempo (contraria a decisão de exclusão definitiva e deixa código morto).
- **Observação**: As renomeações de coluna (R3) quebram o app antigo; por isso o deploy do app
  e a migration devem ocorrer em sequência imediata. Por ser projeto de portfólio, uma
  indisponibilidade de minutos é aceitável.

## R2. Preservar análises detalhadas já pagas (FR-008)

- **Finding**: `ReportViewer` só exibe a análise premium se existir `credit_transactions` com
  `type='usage'` para a avaliação. Apagar a tabela esconderia análises já pagas.
- **Decision**: A exibição passa a depender apenas do estado da própria avaliação
  (`tier = 'detailed'` / `has_detailed_analysis = true`), nunca de transações.
- **Alternatives**: Migrar transações para um flag `paid` (desnecessário: o tier já indica que
  a análise foi gerada).

## R3. Nomenclatura do nível de análise (SC-002: zero "premium" no código ativo)

- **Decision**:
  - `assessments.tier`: manter a coluna, trocar o valor `'premium'` → `'detailed'` e a
    constraint para `CHECK (tier IN ('basic','detailed'))`.
  - `tdah_assessments.is_premium` e `big_five_assessments.is_premium`: `RENAME COLUMN` para
    `has_detailed_analysis` (preserva dados e índices).
- **Rationale**: "tier" não é termo de cobrança; renomear só o valor minimiza impacto. Para os
  booleanos, o nome antigo é intrinsecamente comercial.
- **Alternatives**: Manter nomes (viola SC-002); derivar de `full_report IS NOT NULL` e dropar a
  coluna (mais mudanças no front e perde semântica explícita).

## R4. Edge Functions

| Função atual | Destino | Motivo |
|---|---|---|
| `hotmart-webhook` | **Excluir** | Compra; vulnerável (não valida segredo) |
| `check-transaction-status` | **Excluir** | Compra |
| `check-user-credits` | **Excluir** | Saldo |
| `consume-credit` | **Excluir** | Saldo |
| `upgrade-assessment` | **Renomear** → `generate-body-analysis` | Mantém IA, sem crédito |
| `upgrade-tdah-assessment` | **Renomear** → `generate-tdah-analysis` | Mantém IA, sem crédito |
| `create-big-five-assessment` | Alterar | Remover checagem/consumo de crédito |
| `create-tdah-assessment` | Alterar | Remover checagem/consumo de crédito |
| `delete-user-profile` | Alterar | Remover passos 1–2 (tabelas de crédito) |
| `create-assessment` | Alterar mínimo | Só se referenciar `'premium'`; hoje grava `tier: 'basic'` (ok) |
| `_shared/errorHandler.ts` | Alterar | Remover `INSUFFICIENT_CREDITS` |

- **Decision (idempotência)**: As funções `generate-*` retornam 200 com a análise existente
  quando ela já foi gerada (hoje lançam erro "já é premium").
- **Decision (deploy)**: Apagar a pasta no repositório não remove a função publicada. A
  remoção no Supabase é passo explícito do quickstart (`supabase functions delete <nome>`
  ou painel), junto com a remoção dos secrets `HOTMART_WEBHOOK_SECRET`.
- **Alternatives**: Manter os nomes `upgrade-*` (viola SC-002).

## R5. Big Five: flag de análise detalhada

- **Finding**: Hoje `is_premium = true` sempre que havia saldo, mesmo se a IA falhou ou a chave
  não estava configurada (relatório "premium" vazio).
- **Decision**: `has_detailed_analysis = (full_report não vazio)`. Sem análise, o relatório
  mostra os escores e uma mensagem neutra "Análise detalhada indisponível".
- **Rationale**: Princípio IV (falha da IA não degrada o resto) e edge case da spec.

## R6. Cadastro sem crédito de boas-vindas (FR-005)

- **Decision**: Nova migration com `CREATE OR REPLACE FUNCTION public.handle_new_user()`
  copiando integralmente a versão vigente
  (`supabase/migrations/20251014211344_d19df68a-….sql`, linhas 61+) **sem** o bloco
  "Grant welcome bonus credits". Manter `SECURITY DEFINER` e `SET search_path = public`
  idênticos.
- **Alternatives**: Editar migration antiga (proibido: migrations históricas não são
  reescritas).

## R7. Exclusão dos dados de cobrança (FR-010)

- **Decision**: `DROP TABLE IF EXISTS … CASCADE` para `credit_transactions`, `user_credits`,
  `hotmart_transactions`, `hotmart_products` (nessa ordem). CASCADE remove policies,
  triggers (`update_user_credits_updated_at`, `update_hotmart_products_updated_at`) e FKs.
- **Rationale**: Clarificação 2026-10-30; minimização LGPD (dados de compradores).
- **Pré-requisito**: backup opcional pela mantenedora antes de aplicar (quickstart).

## R8. Componentes de interface

- **Excluir**: `src/components/credits/` (CreditsModal, CreditsWidget),
  `src/hooks/useUserCredits.tsx`, `src/components/report/UpgradeModal.tsx`,
  `src/components/report/PremiumSection.tsx`.
- **Finding**: `PremiumSection` calcula conteúdo fictício (análise muscular e suplementos a
  partir só do gênero) que não é renderizado; o que aparece é o cabeçalho "Premium" +
  `StructuredReportSection`. → Renderizar `StructuredReportSection` diretamente.
- **Novo (pequeno)**: um card "Gerar análise detalhada" reutilizado por `ReportViewer` e
  `TDAHReportViewer` (botão → função `generate-*`, estado de carregamento e erro).
- **Alterar**: AppContent, LoggedPageLayout (blocos de texto sobre créditos), AppSidebar
  (saldo), DashboardHeader/DashboardStats (widget), Physical/Pollock dashboards (modal),
  formulários Big Five/TDAH/DIVA-2 (gate e avisos), Big Five/TDAH viewers e dashboard,
  OptimizedAssessmentsList/AssessmentsList (status `paid`), useDashboardData (join e
  `isPaid`), `src/types/report.ts`, DeleteProfileDialog, `pdfGenerator.ts`,
  `tdahPdfGenerator.ts`, `ReportHeader.tsx` (props `isPaid`/`onManualPaymentCheck` e botão
  "Verificar Pagamento").
- **Manter**: `SecurityHeaders.tsx` `payment=()` na Permissions-Policy — é endurecimento de
  segurança (desliga a Payment Request API), não cobrança. Exceção explícita na varredura SC-002.
- **Princípio IV (aviso profissional)**: só o relatório TDAH tem o aviso "não substitui
  avaliação profissional". Como os viewers de composição corporal e Big Five serão tocados,
  incluir o aviso neles junto da análise detalhada.
- **Big Five viewer**: o botão "Fazer Upgrade" atual não tem handler (código morto) → remover.

## R9. Tipos gerados

- **Decision**: Regenerar `src/integrations/supabase/types.ts` após a migration
  (`supabase gen types typescript --project-id bqixlrinahtauahcnpoc`) ou, sem CLI logada,
  editar manualmente removendo as 4 tabelas e renomeando os campos. `npm run build` valida.

## R10. Testes (Princípio VI)

- **Finding**: Não há test runner no projeto (dívida TODO(P-VI) da constituição).
- **Decision**: Validação desta feature por `npm run lint`, `npm run build`, varredura de termos
  (SC-002) e roteiro manual do [quickstart.md](./quickstart.md). Configurar Vitest fica fora
  do escopo (ver Complexity Tracking).
- **Alternatives**: Configurar Vitest + `deno test` agora (aumenta o escopo de uma feature de
  remoção; melhor em feature dedicada).

## R11. Constituição (FR-012)

- **Decision**: Emenda MAJOR → 2.0.0 via `/speckit-constitution`: remover Princípio V;
  no Princípio IV trocar "falha não consome crédito" por "falha não impede o relatório nem o
  acesso aos cálculos"; remover "créditos/webhooks" do Princípio VI; remover gate V do
  `plan-template.md`; remover TODO(P-V) do Sync Impact Report.

## R12. Documentação e configuração

- **README**: reescrever como projeto open source de portfólio; listar secrets necessários
  (`OPENAI_API_KEY` para composição corporal; `LOVABLE_API_KEY` para Big Five/TDAH) e que,
  sem eles, a análise detalhada fica indisponível mas o resto funciona.
- **`supabase/config.toml`**: remover blocos das 4 funções excluídas; renomear os 2 de upgrade.
- **Follow-up (fora do escopo)**: `LOVABLE_API_KEY` só funciona dentro do Lovable; quem
  clonar o repositório não terá IA em Big Five/TDAH. Unificar provedor em feature futura.
- **Follow-up (fora do escopo)**: `delete-user-profile` não apaga explicitamente
  `big_five_assessments`, `tdah_assessments` e `pollock_assessments` (depende de CASCADE
  não verificado) — tratar em feature de LGPD.
