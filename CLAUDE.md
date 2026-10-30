# HubFit360 — guia para agentes

Plataforma SaaS de avaliações (composição corporal por IA, Pollock 7 dobras, Big Five,
TDAH/DIVA-2) com sistema de créditos via Hotmart.

- Frontend: React 18 + TypeScript + Vite, shadcn/ui, Tailwind, TanStack Query, RHF + Zod (`src/`)
- Backend: Supabase (Postgres + RLS, Auth, Storage) e Edge Functions Deno (`supabase/functions/`)
- IA: OpenAI chamada apenas nas Edge Functions

## Spec-Driven Development (GitHub Spec Kit)

Princípios não negociáveis: [.specify/memory/constitution.md](.specify/memory/constitution.md).

Fluxo: `/speckit-specify` → `/speckit-clarify` → `/speckit-plan` → `/speckit-tasks` →
`/speckit-analyze` → `/speckit-implement`. Specs ficam em `specs/NNN-nome/`.

## Skills de referência

Em `.claude/skills/` (origem em `.claude/THIRD_PARTY_SKILLS.md`):

- `supabase`, `supabase-postgres-best-practices` — migrations, RLS, Edge Functions, Auth
- `vercel-react-best-practices`, `vercel-composition-patterns` — performance e composição React
  (ignorar regras de Next.js/RSC e React 19; o projeto é React 18 + Vite)
- `webapp-testing` — testes E2E com Playwright (dev server em `localhost:8080`)

## Comandos

- `npm run dev` · `npm run build` · `npm run lint`
