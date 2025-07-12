-- Remove a política restritiva atual de UPDATE
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Cria nova política que permite:
-- 1. Usuários atualizarem seus próprios perfis
-- 2. Admins atualizarem qualquer perfil
CREATE POLICY "Users can update profiles"
ON public.profiles
FOR UPDATE
USING (
  auth.uid() = id OR 
  public.has_role(auth.uid(), 'admin'::app_role)
);