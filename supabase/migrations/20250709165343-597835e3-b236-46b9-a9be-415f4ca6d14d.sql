
-- Remover constraint atual
ALTER TABLE public.credit_transactions 
DROP CONSTRAINT credit_transactions_source_check;

-- Criar nova constraint incluindo 'system' como valor válido
ALTER TABLE public.credit_transactions 
ADD CONSTRAINT credit_transactions_source_check 
CHECK (source = ANY (ARRAY['hotmart'::text, 'mercadopago'::text, 'manual'::text, 'promo'::text, 'system'::text]));
