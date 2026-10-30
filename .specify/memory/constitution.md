<!--
Sync Impact Report
- Version change: 1.1.0 → 2.0.0 (MAJOR: remoção do princípio de créditos/pagamentos —
  o projeto passa a ser open source de portfólio sem cobrança; feature 001-remove-billing-credits)
- Histórico: 1.0.0 (2026-10-30) ratificação inicial; 1.1.0 (2026-10-30) skills de referência
- Princípios modificados:
  IV. IA como Componente Controlado — "sem consumir crédito" → "MUST NOT impedir o relatório
      nem o acesso aos cálculos"; abrange todos os provedores de IA (OpenAI, Lovable AI)
  VI. Testes Proporcionais ao Risco → V (renumerado; removido "consumo de créditos e webhooks")
  VII. Consistência com a Stack e Simplicidade → VI (renumerado, sem mudança de conteúdo)
- Princípios removidos: V. Créditos e Pagamentos Íntegros
- Seções alteradas: Restrições Técnicas (sem Hotmart); Fluxo SDD (clarify sem "créditos";
  gates I–VI)
- Templates:
  ✅ .specify/templates/plan-template.md (gate V removido; gates I–VI)
  ✅ .specify/templates/spec-template.md (sem alteração necessária)
  ✅ .specify/templates/tasks-template.md (sem alteração necessária)
  ✅ README.md (passo de clarify sem "créditos")
  ✅ CLAUDE.md (não referencia números de princípios)
  ⚠ specs/001-remove-billing-credits/* usam a numeração 1.1.0 (I–VII); são artefatos
    históricos da feature e não precisam ser renumerados
- TODOs de follow-up (dívida existente que viola esta constituição):
  - TODO(P-II): create-assessment e create-pollock-assessment usam data.userId do body
    com service role key; migrar para auth.getUser(token).
  - TODO(P-IV): prompts de generate-body-analysis (cópia local de buildAssessmentPrompt),
    generate-tdah-analysis e create-big-five-assessment montados fora de módulo dedicado.
  - TODO(P-V): não há test runner configurado (adicionar Vitest + deno test).
-->

# HubFit360 Constitution

## Core Principles

### I. Privacidade e Dados Sensíveis de Saúde (LGPD)

O HubFit360 processa dados pessoais sensíveis (art. 5º, II da LGPD): medidas corporais,
fotos, composição corporal, avaliações TDAH/DIVA-2 e Big Five, de usuários e de pacientes
de profissionais.

- Toda tabela nova no schema `public` MUST ter RLS habilitado e políticas explícitas
  na mesma migration que a cria.
- Fotos e relatórios MUST ficar em buckets privados, acessados por URL assinada.
- Logs (`console.log`/`console.error`) MUST NOT conter fotos, base64, nomes de pacientes,
  respostas de questionários ou valores clínicos identificáveis; logar IDs e flags.
- Toda spec que coleta um dado novo MUST declarar finalidade, base legal e o
  comportamento na exclusão de conta (`delete-user-profile`).
- Dados enviados a provedores de IA MUST ser os mínimos necessários para o prompt.

**Racional**: vazamento de dado de saúde é o pior risco de negócio e regulatório do produto.

### II. Identidade Derivada do JWT, Nunca do Payload

- Edge Functions com `verify_jwt = true` MUST obter o usuário via
  `supabase.auth.getUser(token)` e usar esse ID; `userId` vindo do body MUST NOT ser
  usado para autorização nem para consultas com service role.
- O uso de `SUPABASE_SERVICE_ROLE_KEY` MUST ser restrito a operações que o RLS não
  cobre, e sempre filtrado pelo usuário autenticado.
- Funções públicas (`verify_jwt = false`) MUST ser justificadas na spec e ter
  verificação própria (assinatura, rate limit).
- Erros retornados ao cliente MUST passar por `_shared/errorHandler.ts` (mensagem
  genérica); entradas MUST ser validadas com `_shared/validation.ts` ou Zod.

**Racional**: confiar no `userId` do payload permite que um usuário crie ou leia
avaliações em nome de outro (IDOR).

### III. Cálculos Determinísticos Antes da IA

- Fórmulas antropométricas e escores (Pollock, Deurenberg, Navy, pontuação Big Five,
  TDAH/DIVA-2) MUST ser funções puras, isoladas em módulos próprios
  (ex.: `pollockCalculations.ts`, `deurenbergFormula.ts`), com a referência
  científica citada em comentário.
- Resultados numéricos exibidos ao usuário MUST vir dessas funções, não do texto do LLM.
- Toda alteração em fórmula MUST ter teste com casos de referência conhecidos.

**Racional**: números de saúde precisam ser reprodutíveis e auditáveis.

### IV. IA como Componente Controlado

- Chamadas a provedores de IA (OpenAI, Lovable AI) MUST ocorrer somente em Edge
  Functions, nunca no frontend.
- Prompts MUST ser construídos em módulos dedicados (`promptBuilder.ts`) e versionados
  no código; a troca de modelo MUST ser registrada na spec/plan da feature.
- A resposta MUST ser validada (formato/tamanho mínimo esperado, ex.:
  `_shared/aiResponse.ts`) antes de ser persistida; em falha, o fluxo MUST degradar com
  mensagem clara e MUST NOT impedir o relatório nem o acesso aos cálculos.
- Textos gerados MUST incluir aviso de que não substituem avaliação profissional
  (nutricionista, educador físico, psicólogo/psiquiatra).

**Racional**: saídas de LLM são não-determinísticas; o produto precisa ser seguro mesmo
quando a IA falha.

### V. Testes Proporcionais ao Risco

- MUST ter testes automatizados: fórmulas e escores (P-III), validação de entrada e
  autorização de Edge Functions (P-II) e validação de respostas de IA (P-IV).
- Frontend: Vitest + Testing Library para hooks e lógica; UI puramente visual MAY
  ser validada manualmente com o roteiro do `quickstart.md` da feature.
- Edge Functions: `deno test` para módulos puros.
- Cada user story da spec MUST ter critério de aceitação verificável.

**Racional**: foco de teste onde o erro causa dano real, sem burocracia em UI simples.

### VI. Consistência com a Stack e Simplicidade

- Frontend: React 18 + TypeScript + Vite, shadcn/ui (`src/components/ui`), Tailwind,
  TanStack Query para dados de servidor, React Hook Form + Zod para formulários,
  `@/` como alias. Backend: Supabase (Postgres, Auth, Storage) + Edge Functions Deno.
- Nova dependência MUST ser justificada no plan (Complexity Tracking).
- Telas pesadas MUST ser carregadas via `src/components/lazy/`.
- Textos de interface MUST estar em pt-BR.
- Preferir estender componentes/hooks existentes a criar paralelos; YAGNI.
- Skills de referência (`.claude/skills/`, procedência em `.claude/THIRD_PARTY_SKILLS.md`)
  MUST ser consultadas no plan e na implementação da área correspondente:
  `supabase` e `supabase-postgres-best-practices` (migrations, RLS, Edge Functions),
  `vercel-react-best-practices` e `vercel-composition-patterns` (componentes e hooks),
  `webapp-testing` (validação E2E). Regras específicas de Next.js/RSC e React 19 não
  se aplicam; em conflito, esta constituição prevalece.

**Racional**: o projeto também é editado via Lovable; padrões consistentes evitam
divergência entre ferramentas.

## Restrições Técnicas e de Segurança

- Mudanças de schema MUST ser feitas exclusivamente por migrations em
  `supabase/migrations/`, e `src/integrations/supabase/types.ts` MUST ser regenerado.
- Segredos (OpenAI, Lovable AI, service role) MUST existir apenas como secrets das Edge
  Functions; variáveis `VITE_*` são públicas e MUST conter só a chave publishable.
- Novas Edge Functions MUST ser declaradas em `supabase/config.toml` com `verify_jwt`
  explícito.
- Rate limiting (`_shared/rateLimiter.ts`) MUST ser aplicado a funções que chamam IA
  ou são públicas.
- Geração de PDF permanece no cliente (`src/utils/*PdfGenerator.ts`) e MUST NOT
  incluir dados de outro usuário/paciente.

## Fluxo de Desenvolvimento (SDD)

1. `/speckit-specify` — o quê e por quê (sem decisões técnicas). Specs em `specs/NNN-nome/`.
2. `/speckit-clarify` — obrigatório quando a feature toca dados de saúde ou IA.
3. `/speckit-plan` — o plano MUST passar no Constitution Check (gates I–VI).
4. `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`.
5. Uma branch por feature (`NNN-nome`); PR referencia a spec e informa o resultado do
   Constitution Check.
6. Bugfixes pequenos MAY dispensar spec completa, mas MUST respeitar os princípios.
7. Antes do merge: `npm run lint`, `npm run build` e testes MUST passar.

## Governance

- Esta constituição prevalece sobre outras práticas do projeto. Em conflito, ela vence.
- Emendas são feitas via `/speckit-constitution`, com Sync Impact Report e versão
  semântica: MAJOR (remoção/redefinição de princípio), MINOR (princípio/seção nova),
  PATCH (redação).
- Violações intencionais MUST ser justificadas na tabela Complexity Tracking do plan.
- Dívidas existentes listadas no Sync Impact Report MUST ser tratadas antes de
  features novas nas áreas afetadas.
- Orientação de runtime para agentes: `CLAUDE.md`.

**Version**: 2.0.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
