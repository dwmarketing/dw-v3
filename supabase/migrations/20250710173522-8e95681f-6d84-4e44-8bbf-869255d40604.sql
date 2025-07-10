-- Atualizar a função handle_new_user para incluir a nova página
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Atribuir role padrão de user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Atribuir permissões padrão (nenhuma por padrão, admin pode conceder)
  INSERT INTO public.user_page_permissions (user_id, page, can_access)
  VALUES 
    (NEW.id, 'creatives', false),
    (NEW.id, 'sales', false),
    (NEW.id, 'affiliates', false),
    (NEW.id, 'revenue', false),
    (NEW.id, 'users', false),
    (NEW.id, 'business-managers', false),
    (NEW.id, 'subscriptions', false),
    (NEW.id, 'ai-agents', true); -- AI Agents liberado por padrão
  
  RETURN NEW;
END;
$function$;

-- Adicionar permissão ai-agents para usuários existentes
INSERT INTO public.user_page_permissions (user_id, page, can_access)
SELECT id, 'ai-agents', true
FROM auth.users
WHERE id NOT IN (
  SELECT user_id 
  FROM public.user_page_permissions 
  WHERE page = 'ai-agents'
);