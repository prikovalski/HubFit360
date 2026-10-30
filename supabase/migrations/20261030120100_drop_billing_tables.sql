-- 001-remove-billing-credits — M2
-- ATENÇÃO: aplicar somente DEPOIS de:
--   1) o deploy do frontend e das Edge Functions sem cobrança estar no ar;
--   2) a M1 (20261030120000_rename_analysis_flags.sql) ter sido aplicada — o trigger
--      handle_new_user antigo grava em user_credits e quebraria cadastros.
-- Exclusão definitiva dos dados de cobrança (decisão de 2026-10-30, minimização LGPD).
-- Faça backup antes, se quiser guardar esses dados fora do sistema.
-- CASCADE remove policies RLS, triggers de updated_at e FKs dessas tabelas.

DROP TABLE IF EXISTS public.credit_transactions CASCADE;
DROP TABLE IF EXISTS public.user_credits CASCADE;
DROP TABLE IF EXISTS public.hotmart_transactions CASCADE;
DROP TABLE IF EXISTS public.hotmart_products CASCADE;
