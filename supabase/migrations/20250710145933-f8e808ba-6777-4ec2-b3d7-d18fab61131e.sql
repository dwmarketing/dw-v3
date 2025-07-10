
-- Create profiles table first (referenced by other tables)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(user_id, role)
);

-- Create user_page_permissions table
CREATE TABLE public.user_page_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  page page NOT NULL,
  can_access BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(user_id, page)
);

-- Create user_chart_permissions table
CREATE TABLE public.user_chart_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  chart_type chart_type NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(user_id, chart_type)
);

-- Create subscription_events table
CREATE TABLE public.subscription_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  event_type TEXT NOT NULL,
  subscription_id TEXT,
  customer_id TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_name TEXT,
  plan TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BRL',
  frequency TEXT,
  event_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  payment_method TEXT,
  subscription_number INTEGER,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo')
);

-- Create creative_performance table
CREATE TABLE public.creative_performance (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creative_id TEXT NOT NULL,
  creative_name TEXT NOT NULL,
  date DATE NOT NULL,
  impressions INTEGER NOT NULL DEFAULT 0,
  clicks INTEGER NOT NULL DEFAULT 0,
  conversions INTEGER NOT NULL DEFAULT 0,
  revenue NUMERIC NOT NULL DEFAULT 0,
  cost NUMERIC NOT NULL DEFAULT 0,
  ctr NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN impressions > 0 THEN (clicks::NUMERIC / impressions::NUMERIC) * 100
      ELSE 0
    END
  ) STORED,
  conversion_rate NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN clicks > 0 THEN (conversions::NUMERIC / clicks::NUMERIC) * 100
      ELSE 0
    END
  ) STORED,
  roas NUMERIC GENERATED ALWAYS AS (
    CASE 
      WHEN cost > 0 THEN revenue / cost
      ELSE 0
    END
  ) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(creative_id, date)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_page_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_chart_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_performance ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update all profiles" 
ON public.profiles 
FOR UPDATE 
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for user_roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles" 
ON public.user_roles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for user_page_permissions
CREATE POLICY "Users can view their own page permissions" 
ON public.user_page_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all page permissions" 
ON public.user_page_permissions 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for user_chart_permissions
CREATE POLICY "Users can view their own chart permissions" 
ON public.user_chart_permissions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all chart permissions" 
ON public.user_chart_permissions 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for subscription_events
CREATE POLICY "Admins and business managers can view subscription events" 
ON public.subscription_events 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'business_manager')
);

CREATE POLICY "Admins can manage subscription events" 
ON public.subscription_events 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for creative_performance
CREATE POLICY "Admins and business managers can view creative performance" 
ON public.creative_performance 
FOR SELECT 
USING (
  public.has_role(auth.uid(), 'admin') OR 
  public.has_role(auth.uid(), 'business_manager')
);

CREATE POLICY "Admins can manage creative performance" 
ON public.creative_performance 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create indexes for better performance
CREATE INDEX idx_profiles_email ON public.profiles(email);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_user_page_permissions_user_id ON public.user_page_permissions(user_id);
CREATE INDEX idx_user_page_permissions_page ON public.user_page_permissions(page);
CREATE INDEX idx_user_chart_permissions_user_id ON public.user_chart_permissions(user_id);
CREATE INDEX idx_user_chart_permissions_chart_type ON public.user_chart_permissions(chart_type);
CREATE INDEX idx_subscription_events_customer_id ON public.subscription_events(customer_id);
CREATE INDEX idx_subscription_events_subscription_id ON public.subscription_events(subscription_id);
CREATE INDEX idx_subscription_events_event_type ON public.subscription_events(event_type);
CREATE INDEX idx_subscription_events_event_date ON public.subscription_events(event_date);
CREATE INDEX idx_subscription_events_plan ON public.subscription_events(plan);
CREATE INDEX idx_creative_performance_creative_id ON public.creative_performance(creative_id);
CREATE INDEX idx_creative_performance_date ON public.creative_performance(date);
CREATE INDEX idx_creative_performance_creative_date ON public.creative_performance(creative_id, date);

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_page_permissions_updated_at
BEFORE UPDATE ON public.user_page_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_chart_permissions_updated_at
BEFORE UPDATE ON public.user_chart_permissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_creative_performance_updated_at
BEFORE UPDATE ON public.creative_performance
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update the existing handle_new_user function to work with the new schema
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Assign default page permissions
  INSERT INTO public.user_page_permissions (user_id, page, can_access)
  VALUES 
    (NEW.id, 'dashboard', true),
    (NEW.id, 'settings', true);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger for new user handling
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
