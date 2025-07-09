-- Atualizar o trigger handle_new_user para incluir gender e birth_date
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_user_id INTEGER;
BEGIN
  -- Inserir o usuário na tabela users com gender e birth_date
  INSERT INTO public.users (auth_user_id, name, email, gender, birth_date, profession, role)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data ->> 'name', new.email),
    new.email,
    new.raw_user_meta_data ->> 'gender',
    CASE 
      WHEN new.raw_user_meta_data ->> 'birth_date' IS NOT NULL 
      THEN (new.raw_user_meta_data ->> 'birth_date')::date 
      ELSE NULL 
    END,
    CASE 
      WHEN new.raw_user_meta_data ->> 'profession' IS NOT NULL 
      THEN (new.raw_user_meta_data ->> 'profession')::profession_type 
      ELSE NULL 
    END,
    COALESCE(
      (new.raw_user_meta_data ->> 'role')::user_role, 
      'PATIENT'::user_role
    )
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
$function$;