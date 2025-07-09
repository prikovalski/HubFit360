-- Modificar o trigger existente para incluir crédito de cortesia
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_user_id INTEGER;
BEGIN
  -- Inserir o usuário na tabela users
  INSERT INTO public.users (auth_user_id, name, email)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    new.email
  ) RETURNING id INTO new_user_id;

  -- Adicionar 1 crédito de cortesia para o novo usuário
  INSERT INTO public.user_credits (user_id, balance)
  VALUES (new_user_id, 1);

  -- Registrar a transação do crédito de cortesia
  INSERT INTO public.credit_transactions (
    user_id, 
    type, 
    amount, 
    source, 
    reference_id,
    description
  )
  VALUES (
    new_user_id,
    'bonus',
    1,
    'system',
    CONCAT('welcome-bonus-', new_user_id),
    'Crédito de cortesia para novo usuário'
  );

  RETURN new;
END;
$$;