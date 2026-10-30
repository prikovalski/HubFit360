<!--
Sync Impact Report
- Version change: 1.0.0 → 1.1.0 (MINOR: skills de referência adicionadas ao P-VII)
- Histórico: 1.0.0 (2026-10-30) ratificação inicial
- Princípios definidos:
  I. Privacidade e Dados Sensíveis de Saúde (LGPD)
  II. Identidade Derivada do JWT, Nunca do Payload
  III. Cálculos Determinísticos Antes da IA
  IV. IA como Componente Controlado
  V. Créditos e Pagamentos Íntegros
  VI. Testes Proporcionais ao Risco
  VII. Consistência com a Stack e Simplicidade
- Seções adicionadas: Restrições Técnicas e de Segurança; Fluxo de Desenvolvimento (SDD)
- Seções removidas: nenhuma
- Templates:
  ✅ .specify/templates/plan-template.md (Constitution Check preenchido com os gates I–VII)
  ✅ .specify/templates/spec-template.md (sem alteração necessária)
  ✅ .specify/templates/tasks-template.md (sem alteração necessária; testes já são condicionais)
  ✅ CLAUDE.md (criado, aponta para esta constituição e o fluxo /speckit-*)
- TODOs de follow-up (dívida existente que viola esta constituição):
  - TODO(P-II): create-assessment e create-pollock-assessment usam data.userId do body
    com service role key; migrar para auth.getUser(token).
  - TODO(P-V): hotmart-webhook não compara X-Hotmart-Hottok com HOTMART_WEBHOOK_SECRET
    e aceita requisições quando o segredo não está configurado.
  - TODO(P-VI): não há test runner configurado (adicionar Vitest + deno test).
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
- Dados enviados à OpenAI MUST ser os mínimos necessários para o prompt.

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

- Chamadas à OpenAI MUST ocorrer somente em Edge Functions, nunca no frontend.
- Prompts MUST ser construídos em módulos dedicados (`promptBuilder.ts`) e versionados
  no código; a troca de modelo MUST ser registrada na spec/plan da feature.
- A resposta MUST ser validada contra um schema esperado antes de ser persistida; em
  falha, o fluxo MUST degradar com mensagem clara e sem consumir crédito.
- Textos gerados MUST incluir aviso de que não substituem avaliação profissional
  (nutricionista, educador físico, psicólogo/psiquiatra).

**Racional**: saídas de LLM são não-determinísticas; o produto precisa ser seguro mesmo
quando a IA falha.

### V. Créditos e Pagamentos Íntegros

- Débito de crédito MUST ser atômico (função SQL/transação) e ocorrer somente após o
  sucesso da operação paga; falhas MUST NOT consumir crédito.
- Webhooks de pagamento (Hotmart) MUST verificar o segredo compartilhado e MUST
  rejeitar a requisição se o segredo não estiver configurado.
- Processamento de webhook MUST ser idempotente por ID de transação.

**Racional**: crédito é dinheiro; inconsistência gera prejuízo ou cobrança indevida.

### VI. Testes Proporcionais ao Risco

- MUST ter testes automatizados: fórmulas e escores (P-III), consumo de créditos e
  webhooks (P-V), validação de entrada e autorização de Edge Functions (P-II).
- Frontend: Vitest + Testing Library para hooks e lógica; UI puramente visual MAY
  ser validada manualmente com o roteiro do `quickstart.md` da feature.
- Edge Functions: `deno test` para módulos puros.
- Cada user story da spec MUST ter critério de aceitação verificável.

**Racional**: foco de teste onde o erro causa dano real, sem burocracia em UI simples.

### VII. Consistência com a Stack e Simplicidade

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
- Segredos (OpenAI, Hotmart, service role) MUST existir apenas como secrets das Edge
  Functions; variáveis `VITE_*` são públicas e MUST conter só a chave publishable.
- Novas Edge Functions MUST ser declaradas em `supabase/config.toml` com `verify_jwt`
  explícito.
- Rate limiting (`_shared/rateLimiter.ts`) MUST ser aplicado a funções que chamam IA
  ou são públicas.
- Geração de PDF permanece no cliente (`src/utils/*PdfGenerator.ts`) e MUST NOT
  incluir dados de outro usuário/paciente.

## Fluxo de Desenvolvimento (SDD)

1. `/speckit-specify` — o quê e por quê (sem decisões técnicas). Specs em `specs/NNN-nome/`.
2. `/speckit-clarify` — obrigatório quando a feature toca dados de saúde, créditos ou IA.
3. `/speckit-plan` — o plano MUST passar no Constitution Check (gates I–VII).
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

**Version**: 1.1.0 | **Ratified**: 2026-10-30 | **Last Amended**: 2026-10-30
