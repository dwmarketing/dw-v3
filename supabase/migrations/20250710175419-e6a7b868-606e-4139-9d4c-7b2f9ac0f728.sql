-- Criar tabela para permissões granulares de charts
CREATE TABLE public.user_chart_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chart_type chart_type NOT NULL,
  can_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chart_type)
);

-- Habilitar RLS
ALTER TABLE public.user_chart_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS
CREATE POLICY "Users can view their own chart permissions" 
ON public.user_chart_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all chart permissions" 
ON public.user_chart_permissions 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage chart permissions" 
ON public.user_chart_permissions 
FOR ALL 
USING (has_role(auth.uid(), 'admin'))
WITH CHECK (has_role(auth.uid(), 'admin'));

-- Função para atribuir permissões padrão de charts para novos usuários
CREATE OR REPLACE FUNCTION public.assign_default_chart_permissions(_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Permissões padrão para charts (todas desabilitadas por padrão)
  INSERT INTO public.user_chart_permissions (user_id, chart_type, can_access)
  VALUES 
    (_user_id, 'kpi_total_investido', false),
    (_user_id, 'kpi_receita', false),
    (_user_id, 'kpi_ticket_medio', false),
    (_user_id, 'kpi_total_pedidos', false),
    (_user_id, 'creative_performance_chart', false),
    (_user_id, 'creative_sales_chart', false),
    (_user_id, 'sales_summary_cards', false),
    (_user_id, 'sales_chart', false),
    (_user_id, 'country_sales_chart', false),
    (_user_id, 'state_sales_chart', false),
    (_user_id, 'affiliate_chart', false),
    (_user_id, 'subscription_renewals_chart', false),
    (_user_id, 'subscription_status_chart', false),
    (_user_id, 'new_subscribers_chart', false)
  ON CONFLICT (user_id, chart_type) DO NOTHING;
END;
$$;

-- Atualizar a função handle_new_user para incluir permissões de charts
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
$function$;

-- Atribuir permissões de charts para usuários existentes
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM auth.users LOOP
    PERFORM public.assign_default_chart_permissions(user_record.id);
  END LOOP;
END
$$;