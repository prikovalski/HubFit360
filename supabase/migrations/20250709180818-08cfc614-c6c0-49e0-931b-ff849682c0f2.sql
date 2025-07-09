-- Remover tabelas de pagamento direto que não são mais necessárias
-- Agora só usamos créditos e Hotmart

-- Remover tabela de preferências de pagamento
DROP TABLE IF EXISTS public.payment_preferences;

-- Remover tabela de pagamentos
DROP TABLE IF EXISTS public.payments;

-- Remover tabela de produtos
DROP TABLE IF EXISTS public.products;