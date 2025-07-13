-- Ajustes na tabela subscription_status para corresponder ao schema desejado

-- 1. Atualizar o default do campo id para gen_random_uuid()
ALTER TABLE public.subscription_status 
ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Atualizar os defaults de created_at e updated_at para usar timezone America/Sao_Paulo
ALTER TABLE public.subscription_status 
ALTER COLUMN created_at SET DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'::text);

ALTER TABLE public.subscription_status 
ALTER COLUMN updated_at SET DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'::text);

-- 3. Adicionar constraint unique no subscription_id
ALTER TABLE public.subscription_status 
ADD CONSTRAINT subscription_status_subscription_id_key UNIQUE (subscription_id);

-- 4. Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_subscription_status_plan 
ON public.subscription_status USING btree (plan);

CREATE INDEX IF NOT EXISTS idx_subscription_status_customer_id 
ON public.subscription_status USING btree (customer_id);

CREATE INDEX IF NOT EXISTS idx_subscription_status_subscription_status 
ON public.subscription_status USING btree (subscription_status);

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.update_subscription_status_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = (now() AT TIME ZONE 'America/Sao_Paulo'::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para executar a função antes de cada update
CREATE TRIGGER trigger_update_subscription_status_updated_at
  BEFORE UPDATE ON public.subscription_status
  FOR EACH ROW
  EXECUTE FUNCTION public.update_subscription_status_updated_at();