
-- Corrigir o timezone das colunas created_at e updated_at para usar o timezone brasileiro
ALTER TABLE public.subscription_renewals 
ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo');

ALTER TABLE public.subscription_renewals 
ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo');

-- Criar índices em falta para melhorar a performance
CREATE INDEX IF NOT EXISTS idx_subscription_renewals_customer_email ON public.subscription_renewals(customer_email);
CREATE INDEX IF NOT EXISTS idx_subscription_renewals_frequency ON public.subscription_renewals(frequency);

-- Criar trigger para atualizar updated_at automaticamente
CREATE TRIGGER trigger_update_subscription_renewals_updated_at
    BEFORE UPDATE ON public.subscription_renewals
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_renewals_updated_at();
