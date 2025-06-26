
-- Adicionar coluna offer_id na tabela hotmart_products
ALTER TABLE public.hotmart_products 
ADD COLUMN offer_id TEXT;

-- Atualizar os produtos existentes com os offer_ids corretos
UPDATE public.hotmart_products 
SET offer_id = 'eppmv6cm' 
WHERE hotmart_product_id = 'HUBFIT_1_CREDIT';

UPDATE public.hotmart_products 
SET offer_id = 'mc0my8q7' 
WHERE hotmart_product_id = 'HUBFIT_5_CREDITS';

UPDATE public.hotmart_products 
SET offer_id = 'puafdvn5' 
WHERE hotmart_product_id = 'HUBFIT_10_CREDITS';

-- Criar índice para melhorar performance na busca por offer_id
CREATE INDEX idx_hotmart_products_offer_id ON public.hotmart_products(offer_id);
