-- Criar políticas para permitir inserções via service role (para n8n e outras integrações)

-- Creative Insights - permitir inserções via service role
CREATE POLICY "Service role can insert creative insights" 
ON public.creative_insights 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Creative Sales - permitir inserções via service role
CREATE POLICY "Service role can insert creative sales" 
ON public.creative_sales 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Product Sales - permitir inserções via service role
CREATE POLICY "Service role can insert product sales" 
ON public.product_sales 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Subscription Events - permitir inserções via service role
CREATE POLICY "Service role can insert subscription events" 
ON public.subscription_events 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Subscription Renewals - permitir inserções via service role
CREATE POLICY "Service role can insert subscription renewals" 
ON public.subscription_renewals 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Subscription Status - permitir inserções via service role
CREATE POLICY "Service role can insert subscription status" 
ON public.subscription_status 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Também permitir atualizações via service role para sincronização de dados
CREATE POLICY "Service role can update creative insights" 
ON public.creative_insights 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can update creative sales" 
ON public.creative_sales 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can update product sales" 
ON public.product_sales 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can update subscription events" 
ON public.subscription_events 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can update subscription renewals" 
ON public.subscription_renewals 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can update subscription status" 
ON public.subscription_status 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);