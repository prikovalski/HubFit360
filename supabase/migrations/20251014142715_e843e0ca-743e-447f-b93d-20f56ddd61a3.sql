-- Remove user_roles table and has_role function
DROP POLICY IF EXISTS "Only admins can delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can insert roles" ON public.user_roles;
DROP POLICY IF EXISTS "Only admins can update roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;

DROP TABLE IF EXISTS public.user_roles;

DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);

DROP TYPE IF EXISTS public.app_role;