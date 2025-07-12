-- Criar tabelas para o sistema de agentes de IA e analytics

-- Tabela de configurações dos agentes
CREATE TABLE public.agent_configurations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agent_name text NOT NULL DEFAULT 'Copy Chief',
  agent_description text,
  default_language text NOT NULL DEFAULT 'pt-BR',
  voice_tone text NOT NULL DEFAULT 'formal',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de conversas com agentes
CREATE TABLE public.agent_conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Nova Conversa',
  status agent_conversation_status NOT NULL DEFAULT 'active',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de mensagens das conversas
CREATE TABLE public.agent_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id uuid NOT NULL REFERENCES public.agent_conversations(id) ON DELETE CASCADE,
  role message_role NOT NULL,
  content text NOT NULL,
  webhook_response jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de dados de treinamento dos agentes
CREATE TABLE public.agent_training_data (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tab_name text NOT NULL,
  data_type text NOT NULL CHECK (data_type = ANY (ARRAY['file'::text, 'link'::text, 'manual_prompt'::text])),
  file_name text,
  file_type text,
  file_size bigint,
  file_url text,
  file_content text,
  link_title text,
  link_url text,
  link_description text,
  manual_prompt text,
  title text,
  description text,
  metadata jsonb DEFAULT '{}',
  status training_data_status NOT NULL DEFAULT 'pending',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de contas de business manager
CREATE TABLE public.business_manager_accounts (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bm_name text NOT NULL,
  access_token text NOT NULL,
  app_id text,
  app_secret text,
  ad_account_name text,
  ad_account_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de insights de criativos
CREATE TABLE public.creative_insights (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creative_name text NOT NULL,
  ad_id text,
  campaign_id text,
  campaign_name text,
  adset_name text,
  amount_spent numeric DEFAULT 0,
  ph_hook_rate numeric,
  hook_rate numeric,
  body_rate numeric,
  cta_rate numeric,
  views_3s integer DEFAULT 0,
  views_75_percent integer DEFAULT 0,
  views_total integer DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  ctr numeric,
  cost_per_click numeric,
  cost_per_mille numeric,
  date_reported timestamp with time zone DEFAULT now(),
  status text DEFAULT 'active',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de vendas de criativos
CREATE TABLE public.creative_sales (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sale_date timestamp with time zone DEFAULT now(),
  order_id text NOT NULL,
  creative_name text NOT NULL,
  status text NOT NULL DEFAULT 'completed',
  payment_method text NOT NULL,
  gross_value numeric DEFAULT 0,
  net_value numeric DEFAULT 0,
  discount_value numeric DEFAULT 0,
  tax_value numeric DEFAULT 0,
  commission_value_produtor numeric DEFAULT 0,
  comission_value_coprodutor numeric DEFAULT 0,
  customer_name text,
  customer_email text,
  customer_phone text,
  affiliate_id text,
  affiliate_name text,
  is_affiliate boolean DEFAULT false,
  affiliate_commission numeric DEFAULT 0,
  country text,
  state text,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela de vendas de produtos
CREATE TABLE public.product_sales (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text NOT NULL,
  product_id text NOT NULL,
  product_name text NOT NULL,
  sale_value numeric NOT NULL DEFAULT 0,
  sale_date timestamp with time zone NOT NULL DEFAULT now(),
  is_subscription boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de eventos de assinatura
CREATE TABLE public.subscription_events (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type text NOT NULL,
  subscription_id text NOT NULL,
  customer_id text NOT NULL,
  customer_email text NOT NULL,
  customer_name text,
  plan text NOT NULL,
  amount numeric NOT NULL DEFAULT 0.00,
  currency text NOT NULL DEFAULT 'BRL',
  frequency text,
  subscription_number numeric,
  payment_method text,
  event_date timestamp with time zone NOT NULL DEFAULT now(),
  cartpanda_event_id text UNIQUE,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de renovações de assinatura
CREATE TABLE public.subscription_renewals (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id text,
  customer_id text,
  customer_email text,
  customer_name text,
  plan text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  frequency text,
  subscription_status text NOT NULL,
  subscription_number integer,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Tabela de status de assinaturas
CREATE TABLE public.subscription_status (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id text UNIQUE,
  customer_id text,
  customer_email text,
  customer_name text,
  plan text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'BRL',
  frequency text,
  subscription_status text NOT NULL,
  subscription_number integer,
  canceled_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Ativar RLS em todas as tabelas
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_manager_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_status ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para agent_configurations
CREATE POLICY "Users can manage their own agent configurations"
  ON public.agent_configurations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para agent_conversations  
CREATE POLICY "Users can manage their own conversations"
  ON public.agent_conversations
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para agent_messages
CREATE POLICY "Users can manage messages in their conversations"
  ON public.agent_messages
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.agent_conversations 
      WHERE id = agent_messages.conversation_id 
      AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.agent_conversations 
      WHERE id = agent_messages.conversation_id 
      AND user_id = auth.uid()
    )
  );

-- Políticas RLS para agent_training_data
CREATE POLICY "Users can manage their own training data"
  ON public.agent_training_data
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para business_manager_accounts
CREATE POLICY "Users can manage their own business manager accounts"
  ON public.business_manager_accounts
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Políticas RLS para dados analíticos (somente admins e business managers)
CREATE POLICY "Admins and business managers can view creative insights"
  ON public.creative_insights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'business_manager')
    )
  );

CREATE POLICY "Admins and business managers can view creative sales"
  ON public.creative_sales
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'business_manager')
    )
  );

CREATE POLICY "Admins and business managers can view product sales"
  ON public.product_sales
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'business_manager')
    )
  );

CREATE POLICY "Admins and business managers can view subscription events"
  ON public.subscription_events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'business_manager')
    )
  );

CREATE POLICY "Admins and business managers can view subscription renewals"
  ON public.subscription_renewals
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'business_manager')
    )
  );

CREATE POLICY "Admins and business managers can view subscription status"
  ON public.subscription_status
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'business_manager')
    )
  );

-- Políticas para admins gerenciarem dados analíticos
CREATE POLICY "Admins can manage creative insights"
  ON public.creative_insights
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage creative sales"
  ON public.creative_sales
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage product sales"
  ON public.product_sales
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscription events"
  ON public.subscription_events
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscription renewals"
  ON public.subscription_renewals
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage subscription status"
  ON public.subscription_status
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Criar triggers para atualizar updated_at automaticamente
CREATE TRIGGER update_agent_configurations_updated_at
  BEFORE UPDATE ON public.agent_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_conversations_updated_at
  BEFORE UPDATE ON public.agent_conversations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_agent_training_data_updated_at
  BEFORE UPDATE ON public.agent_training_data
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_business_manager_accounts_updated_at
  BEFORE UPDATE ON public.business_manager_accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creative_insights_updated_at
  BEFORE UPDATE ON public.creative_insights
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creative_sales_updated_at
  BEFORE UPDATE ON public.creative_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_sales_updated_at
  BEFORE UPDATE ON public.product_sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_events_updated_at
  BEFORE UPDATE ON public.subscription_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_renewals_updated_at
  BEFORE UPDATE ON public.subscription_renewals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_subscription_status_updated_at
  BEFORE UPDATE ON public.subscription_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();