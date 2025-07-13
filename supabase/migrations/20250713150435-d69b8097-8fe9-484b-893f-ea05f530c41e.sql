-- Atualizar as datas dos registros na tabela creative_insights para corresponder com as datas dos registros de vendas
-- Vamos distribuir os registros existentes ao longo das datas onde temos vendas

-- Primeiro, vamos atualizar alguns registros para datas recentes (últimos dias)
UPDATE public.creative_insights 
SET date_reported = '2025-07-13'
WHERE creative_name IN ('Creative A', 'Creative B', 'Creative C');

UPDATE public.creative_insights 
SET date_reported = '2025-07-12'
WHERE creative_name IN ('Creative D', 'Creative E');

-- Agora vamos distribuir o resto pelos dias de janeiro/fevereiro de 2024
UPDATE public.creative_insights 
SET date_reported = '2024-02-01'
WHERE creative_name = 'Creative F';

UPDATE public.creative_insights 
SET date_reported = '2024-01-31'
WHERE creative_name = 'Creative G';

UPDATE public.creative_insights 
SET date_reported = '2024-01-30'
WHERE creative_name = 'Creative H';

UPDATE public.creative_insights 
SET date_reported = '2024-01-29'
WHERE creative_name = 'Creative I';

UPDATE public.creative_insights 
SET date_reported = '2024-01-28'
WHERE creative_name = 'Creative J';

-- Atualizar alguns registros adicionais para espalhar ao longo de janeiro
UPDATE public.creative_insights 
SET date_reported = '2024-01-27'
WHERE creative_name = 'Creative A' AND date_reported != '2025-07-13';

UPDATE public.creative_insights 
SET date_reported = '2024-01-26'
WHERE creative_name = 'Creative B' AND date_reported != '2025-07-13';

UPDATE public.creative_insights 
SET date_reported = '2024-01-25'
WHERE creative_name = 'Creative C' AND date_reported != '2025-07-13';

UPDATE public.creative_insights 
SET date_reported = '2024-01-24'
WHERE creative_name = 'Creative D' AND date_reported != '2025-07-12';

UPDATE public.creative_insights 
SET date_reported = '2024-01-23'
WHERE creative_name = 'Creative E' AND date_reported != '2025-07-12';