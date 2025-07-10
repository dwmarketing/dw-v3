
-- Primeiro, vamos desabilitar as políticas RLS e remover os triggers
DROP TRIGGER IF EXISTS trigger_sync_subscription_renewals ON public.subscription_events;
DROP TRIGGER IF EXISTS trigger_sync_subscription_status ON public.subscription_events;
DROP TRIGGER IF EXISTS trigger_update_subscription_status_updated_at ON public.subscription_status;
DROP TRIGGER IF EXISTS trigger_update_subscription_renewals_updated_at ON public.subscription_renewals;
DROP TRIGGER IF EXISTS trigger_update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_agent_conversations_updated_at ON public.agent_conversations;
DROP TRIGGER IF EXISTS update_agent_training_data_updated_at ON public.agent_training_data;
DROP TRIGGER IF EXISTS update_agent_configurations_updated_at ON public.agent_configurations;
DROP TRIGGER IF EXISTS update_agent_training_files_updated_at ON public.agent_training_files;
DROP TRIGGER IF EXISTS update_agent_reference_links_updated_at ON public.agent_reference_links;
DROP TRIGGER IF EXISTS update_agent_manual_contexts_updated_at ON public.agent_manual_contexts;
DROP TRIGGER IF EXISTS update_agent_behavior_settings_updated_at ON public.agent_behavior_settings;
DROP TRIGGER IF EXISTS update_agent_conversation_flows_updated_at ON public.agent_conversation_flows;

-- Remover as funções
DROP FUNCTION IF EXISTS sync_subscription_renewals();
DROP FUNCTION IF EXISTS sync_subscription_status();
DROP FUNCTION IF EXISTS update_subscription_status_updated_at();
DROP FUNCTION IF EXISTS update_subscription_renewals_updated_at();
DROP FUNCTION IF EXISTS update_profiles_updated_at();
DROP FUNCTION IF EXISTS update_agent_updated_at_column();

-- Remover os tipos enum
DROP TYPE IF EXISTS agent_conversation_status CASCADE;
DROP TYPE IF EXISTS agent_message_role CASCADE;
DROP TYPE IF EXISTS training_data_status CASCADE;

-- Excluir todas as tabelas do projeto (mantendo apenas as tabelas do sistema Supabase)
DROP TABLE IF EXISTS public.agent_user_feedback CASCADE;
DROP TABLE IF EXISTS public.agent_conversation_flows CASCADE;
DROP TABLE IF EXISTS public.agent_behavior_settings CASCADE;
DROP TABLE IF EXISTS public.agent_manual_contexts CASCADE;
DROP TABLE IF EXISTS public.agent_reference_links CASCADE;
DROP TABLE IF EXISTS public.agent_training_files CASCADE;
DROP TABLE IF EXISTS public.agent_configurations CASCADE;
DROP TABLE IF EXISTS public.agent_messages CASCADE;
DROP TABLE IF EXISTS public.agent_conversations CASCADE;
DROP TABLE IF EXISTS public.agent_training_data CASCADE;
DROP TABLE IF EXISTS public.subscription_renewals CASCADE;
DROP TABLE IF EXISTS public.subscription_status CASCADE;
DROP TABLE IF EXISTS public.subscription_events CASCADE;
DROP TABLE IF EXISTS public.creative_performance CASCADE;
DROP TABLE IF EXISTS public.user_chart_permissions CASCADE;
DROP TABLE IF EXISTS public.user_page_permissions CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Remover tabelas que possam ter sido criadas mas não estão listadas nos arquivos de migração
DROP TABLE IF EXISTS public.creative_sales CASCADE;
DROP TABLE IF EXISTS public.business_managers CASCADE;
