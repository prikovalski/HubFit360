# Skills de terceiros

Copiadas sem modificações, revisadas em 2026-10-30. Para atualizar, clone o repositório,
revise o diff e substitua a pasta correspondente.

| Pasta | Origem | Commit | Licença |
|---|---|---|---|
| supabase-postgres-best-practices | https://github.com/supabase/agent-skills | c9be0e9 | MIT |
| supabase | https://github.com/supabase/agent-skills | c9be0e9 | MIT |
| vercel-react-best-practices | https://github.com/vercel-labs/agent-skills (skills/react-best-practices) | 1a2c79d | MIT |
| vercel-composition-patterns | https://github.com/vercel-labs/agent-skills (skills/composition-patterns) | 1a2c79d | MIT |
| webapp-testing | https://github.com/anthropics/skills | ca45fc4 | Apache-2.0 |

Notas de uso no HubFit360 (React 18 + Vite, sem Next.js):
- vercel-react-best-practices: ignorar regras `server-*`, RSC/hydration e `next/dynamic`
  (usar `React.lazy` em `src/components/lazy/`); `client-swr-dedup` → TanStack Query.
- vercel-composition-patterns: seção `react19-*` não se aplica (React 18).
- webapp-testing: requer `pip install playwright && playwright install chromium`; dev server na porta 8080.
