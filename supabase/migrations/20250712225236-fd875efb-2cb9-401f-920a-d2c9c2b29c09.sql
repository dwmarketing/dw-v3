-- Grant explicit permissions to service_role for n8n integration

-- Grant permissions on creative_insights table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creative_insights TO service_role;

-- Grant permissions on creative_sales table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creative_sales TO service_role;

-- Grant permissions on product_sales table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_sales TO service_role;

-- Grant permissions on subscription_events table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_events TO service_role;

-- Grant permissions on subscription_renewals table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_renewals TO service_role;

-- Grant permissions on subscription_status table
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_status TO service_role;

-- Grant usage on sequences for auto-incrementing columns
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO service_role;