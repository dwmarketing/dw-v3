-- Add is_active column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN is_active boolean NOT NULL DEFAULT false;

-- Update the handle_new_user function to set is_active to false by default
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, is_active)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    false  -- Set inactive by default
  );
  
  -- Atribuir role padrão de user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Atribuir permissões padrão de páginas
  INSERT INTO public.user_page_permissions (user_id, page, can_access)
  VALUES 
    (NEW.id, 'creatives', false),
    (NEW.id, 'sales', false),
    (NEW.id, 'affiliates', false),
    (NEW.id, 'revenue', false),
    (NEW.id, 'users', false),
    (NEW.id, 'business-managers', false),
    (NEW.id, 'subscriptions', false),
    (NEW.id, 'ai-agents', true),
    (NEW.id, 'performance', true);
  
  -- Atribuir permissões padrão de charts
  PERFORM public.assign_default_chart_permissions(NEW.id);
  
  RETURN NEW;
END;
$$;