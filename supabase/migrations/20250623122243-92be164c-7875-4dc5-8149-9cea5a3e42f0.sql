
-- Tabela para saldo de créditos dos usuários
CREATE TABLE public.user_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela para histórico de transações de créditos
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'usage', 'refund', 'bonus')),
  amount INTEGER NOT NULL,
  source TEXT NOT NULL DEFAULT 'hotmart' CHECK (source IN ('hotmart', 'mercadopago', 'manual', 'promo')),
  reference_id TEXT,
  description TEXT,
  assessment_id UUID REFERENCES public.assessments(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para mapeamento de produtos Hotmart
CREATE TABLE public.hotmart_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hotmart_product_id TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('credits', 'direct_access')),
  credits_amount INTEGER,
  assessment_access BOOLEAN DEFAULT false,
  price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para log de transações Hotmart
CREATE TABLE public.hotmart_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE,
  user_id INTEGER REFERENCES public.users(id),
  hotmart_product_id TEXT REFERENCES public.hotmart_products(hotmart_product_id),
  status TEXT NOT NULL,
  webhook_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Trigger para atualizar updated_at em user_credits
CREATE TRIGGER update_user_credits_updated_at
  BEFORE UPDATE ON public.user_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para atualizar updated_at em hotmart_products
CREATE TRIGGER update_hotmart_products_updated_at
  BEFORE UPDATE ON public.hotmart_products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir produtos padrão Hotmart
INSERT INTO public.hotmart_products (hotmart_product_id, product_name, type, credits_amount, price) VALUES
('HUBFIT_1_CREDIT', '1 Avaliação HubFit360', 'credits', 1, 8.90),
('HUBFIT_5_CREDITS', 'Pacote 5 Avaliações', 'credits', 5, 39.90),
('HUBFIT_10_CREDITS', 'Pacote 10 Avaliações', 'credits', 10, 69.90),
('HUBFIT_DIRECT_ASSESSMENT', 'Avaliação Física Completa', 'direct_access', 0, 8.90);

-- Habilitar RLS nas novas tabelas
ALTER TABLE public.user_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotmart_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hotmart_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para user_credits
CREATE POLICY "Users can view their own credits" 
  ON public.user_credits 
  FOR SELECT 
  USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Políticas RLS para credit_transactions
CREATE POLICY "Users can view their own credit transactions" 
  ON public.credit_transactions 
  FOR SELECT 
  USING (auth.uid() = (SELECT auth_user_id FROM public.users WHERE id = user_id));

-- Políticas RLS para hotmart_products (público para leitura)
CREATE POLICY "Anyone can view hotmart products" 
  ON public.hotmart_products 
  FOR SELECT 
  TO public
  USING (true);

-- Políticas RLS para hotmart_transactions (admin only)
CREATE POLICY "Only admins can view hotmart transactions" 
  ON public.hotmart_transactions 
  FOR SELECT 
  USING (auth.uid() IN (SELECT auth_user_id FROM public.users WHERE role = 'ADMIN'));
