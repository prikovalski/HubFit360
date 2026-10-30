# HubFit360

Plataforma web de avaliações de saúde e comportamento, desenvolvida como projeto open source
de portfólio. Todas as funcionalidades são gratuitas e não há nenhum tipo de cobrança.

> As avaliações e análises geradas não substituem o acompanhamento de um profissional de saúde.

## Funcionalidades

- **Composição corporal**: estimativa de % de gordura, massa magra e IMC a partir de medidas
  (fórmulas de Deurenberg e Navy), com análise detalhada opcional gerada por IA.
- **Pollock 7 dobras**: protocolo de dobras cutâneas, totalmente determinístico.
- **Big Five**: inventário de personalidade (44 itens) com análise detalhada por IA gerada na
  criação.
- **TDAH (ASRS-18 e DIVA 2.0)**: triagem com pontuação, classificação e análise detalhada
  opcional por IA.
- Relatórios em PDF, perfis de paciente para profissionais e exclusão completa de conta.

## Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui, TanStack Query,
  React Hook Form + Zod, jsPDF
- **Backend**: Supabase (Postgres com RLS, Auth, Storage) e Edge Functions em Deno
- **IA**: OpenAI (composição corporal) e Lovable AI Gateway (Big Five e TDAH), chamadas
  apenas pelas Edge Functions

## Rodando localmente

Requisitos: Node.js 20+ e npm.

```sh
git clone https://github.com/prikovalski/HubFit360.git
cd HubFit360
npm ci
npm run dev        # http://localhost:8080
```

Outros comandos: `npm run build`, `npm run lint`.

O frontend aponta para o projeto Supabase configurado em
`src/integrations/supabase/client.ts`. Para usar o seu próprio projeto, troque a URL e a chave
publishable nesse arquivo, aplique as migrations de `supabase/migrations/` e publique as
funções de `supabase/functions/` (`supabase db push` e `supabase functions deploy`).

### Secrets das Edge Functions

| Secret | Usado por | Sem ele |
|---|---|---|
| `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` | Todas (fornecidos pelo Supabase) | As funções não funcionam |
| `OPENAI_API_KEY` | `create-assessment`, `generate-body-analysis` | Cálculos funcionam; a análise detalhada de composição corporal fica indisponível |
| `LOVABLE_API_KEY` | `create-big-five-assessment`, `generate-tdah-analysis` | Escores funcionam; a análise detalhada de Big Five/TDAH fica indisponível |

A `LOVABLE_API_KEY` só está disponível em projetos hospedados no [Lovable](https://lovable.dev).

## Spec-Driven Development

Este projeto usa o [GitHub Spec Kit](https://github.com/github/spec-kit). Os princípios do
projeto estão em `.specify/memory/constitution.md` e o fluxo de trabalho com Claude Code é:

1. `/speckit-specify <descrição da feature>`
2. `/speckit-clarify` (obrigatório para dados de saúde ou IA)
3. `/speckit-plan <decisões técnicas>`
4. `/speckit-tasks` → `/speckit-analyze` → `/speckit-implement`

As specs de cada feature ficam em `specs/NNN-nome-da-feature/`.
