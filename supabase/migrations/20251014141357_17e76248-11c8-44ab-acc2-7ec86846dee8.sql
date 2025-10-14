-- Create user_roles table for proper role management
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles without RLS recursion
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Only admins can insert roles"
ON public.user_roles
FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
ON public.user_roles
FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
ON public.user_roles
FOR DELETE
USING (public.has_role(auth.uid(), 'admin'));

-- Add missing DELETE policies
CREATE POLICY "Users can delete their own patient profile"
ON public.patient_profiles
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM users
  WHERE users.id = patient_profiles.user_id 
  AND users.auth_user_id = auth.uid()
));

-- Migrate existing admin users to user_roles table
INSERT INTO public.user_roles (user_id, role)
SELECT auth_user_id, 'admin'::app_role
FROM public.users
WHERE role = 'ADMIN'
ON CONFLICT (user_id, role) DO NOTHING;

-- Insert default 'user' role for all existing users
INSERT INTO public.user_roles (user_id, role)
SELECT auth_user_id, 'user'::app_role
FROM public.users
ON CONFLICT (user_id, role) DO NOTHING;