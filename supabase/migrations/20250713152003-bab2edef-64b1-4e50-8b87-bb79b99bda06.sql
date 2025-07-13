-- Popular a tabela creative_insights com dados mock baseados nos dados da tabela creative_sales
-- Primeiro, vamos limpar dados existentes se houver
DELETE FROM public.creative_insights;

-- Inserir dados realistas de insights para cada creative encontrado na tabela creative_sales
-- com datas correspondentes e métricas realistas para campanhas de marketing

-- Creative A - Alto performance
INSERT INTO public.creative_insights (
  creative_name, date_reported, amount_spent, impressions, clicks, 
  ctr, cost_per_click, cost_per_mille, views_3s, views_75_percent, 
  views_total, hook_rate, body_rate, cta_rate, ph_hook_rate, status
) VALUES 
('Creative A', '2025-07-13'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 1500.00, 45000, 1350, 3.0, 1.11, 33.33, 13500, 6750, 18000, 75.0, 50.0, 10.0, 80.0, 'active'),
('Creative A', '2025-07-12'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 1200.00, 38000, 1140, 3.0, 1.05, 31.58, 11400, 5700, 15200, 75.0, 50.0, 10.0, 80.0, 'active'),
('Creative A', '2024-02-01'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 2800.00, 85000, 2550, 3.0, 1.10, 32.94, 25500, 12750, 34000, 75.0, 50.0, 10.0, 80.0, 'active'),
('Creative A', '2024-01-31'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 2500.00, 78000, 2340, 3.0, 1.07, 32.05, 23400, 11700, 31200, 75.0, 50.0, 10.0, 80.0, 'active');

-- Creative B - Performance médio
INSERT INTO public.creative_insights (
  creative_name, date_reported, amount_spent, impressions, clicks, 
  ctr, cost_per_click, cost_per_mille, views_3s, views_75_percent, 
  views_total, hook_rate, body_rate, cta_rate, ph_hook_rate, status
) VALUES 
('Creative B', '2025-07-13'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 1800.00, 50000, 1000, 2.0, 1.80, 36.00, 10000, 4000, 15000, 66.7, 40.0, 6.7, 70.0, 'active'),
('Creative B', '2025-07-12'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 1600.00, 45000, 900, 2.0, 1.78, 35.56, 9000, 3600, 13500, 66.7, 40.0, 6.7, 70.0, 'active'),
('Creative B', '2024-02-01'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 3200.00, 90000, 1800, 2.0, 1.78, 35.56, 18000, 7200, 27000, 66.7, 40.0, 6.7, 70.0, 'active'),
('Creative B', '2024-01-30'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 2900.00, 82000, 1640, 2.0, 1.77, 35.37, 16400, 6560, 24600, 66.7, 40.0, 6.7, 70.0, 'active');

-- Creative C - Performance baixo
INSERT INTO public.creative_insights (
  creative_name, date_reported, amount_spent, impressions, clicks, 
  ctr, cost_per_click, cost_per_mille, views_3s, views_75_percent, 
  views_total, hook_rate, body_rate, cta_rate, ph_hook_rate, status
) VALUES 
('Creative C', '2025-07-13'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 2200.00, 55000, 825, 1.5, 2.67, 40.00, 8250, 2475, 11000, 45.5, 30.0, 3.0, 50.0, 'active'),
('Creative C', '2025-07-12'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 2000.00, 50000, 750, 1.5, 2.67, 40.00, 7500, 2250, 10000, 45.5, 30.0, 3.0, 50.0, 'active'),
('Creative C', '2024-01-29'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 4400.00, 110000, 1650, 1.5, 2.67, 40.00, 16500, 4950, 22000, 45.5, 30.0, 3.0, 50.0, 'active'),
('Creative C', '2024-01-28'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 3800.00, 95000, 1425, 1.5, 2.67, 40.00, 14250, 4275, 19000, 45.5, 30.0, 3.0, 50.0, 'active');

-- Creative D - Performance alto
INSERT INTO public.creative_insights (
  creative_name, date_reported, amount_spent, impressions, clicks, 
  ctr, cost_per_click, cost_per_mille, views_3s, views_75_percent, 
  views_total, hook_rate, body_rate, cta_rate, ph_hook_rate, status
) VALUES 
('Creative D', '2025-07-12'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 1400.00, 42000, 1260, 3.0, 1.11, 33.33, 12600, 6300, 16800, 75.0, 50.0, 10.0, 80.0, 'active'),
('Creative D', '2024-01-27'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 2600.00, 78000, 2340, 3.0, 1.11, 33.33, 23400, 11700, 31200, 75.0, 50.0, 10.0, 80.0, 'active'),
('Creative D', '2024-01-26'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 2200.00, 66000, 1980, 3.0, 1.11, 33.33, 19800, 9900, 26400, 75.0, 50.0, 10.0, 80.0, 'active');

-- Creative E - Performance médio
INSERT INTO public.creative_insights (
  creative_name, date_reported, amount_spent, impressions, clicks, 
  ctr, cost_per_click, cost_per_mille, views_3s, views_75_percent, 
  views_total, hook_rate, body_rate, cta_rate, ph_hook_rate, status
) VALUES 
('Creative E', '2025-07-12'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 1700.00, 47000, 940, 2.0, 1.81, 36.17, 9400, 3760, 14100, 66.7, 40.0, 6.7, 70.0, 'active'),
('Creative E', '2024-01-25'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 3000.00, 85000, 1700, 2.0, 1.76, 35.29, 17000, 6800, 25500, 66.7, 40.0, 6.7, 70.0, 'active'),
('Creative E', '2024-01-24'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 2500.00, 70000, 1400, 2.0, 1.79, 35.71, 14000, 5600, 21000, 66.7, 40.0, 6.7, 70.0, 'active');

-- Adicionar alguns creativos adicionais para ter uma base mais rica
INSERT INTO public.creative_insights (
  creative_name, date_reported, amount_spent, impressions, clicks, 
  ctr, cost_per_click, cost_per_mille, views_3s, views_75_percent, 
  views_total, hook_rate, body_rate, cta_rate, ph_hook_rate, status
) VALUES 
('Creative F', '2024-01-23'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 1900.00, 60000, 900, 1.5, 2.11, 31.67, 9000, 2700, 12000, 45.5, 30.0, 3.0, 50.0, 'active'),
('Creative G', '2024-01-22'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 2100.00, 63000, 1890, 3.0, 1.11, 33.33, 18900, 9450, 25200, 75.0, 50.0, 10.0, 80.0, 'active'),
('Creative H', '2024-01-21'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 1600.00, 48000, 960, 2.0, 1.67, 33.33, 9600, 3840, 14400, 66.7, 40.0, 6.7, 70.0, 'active'),
('Creative I', '2024-01-20'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 2300.00, 70000, 1050, 1.5, 2.19, 32.86, 10500, 3150, 14000, 45.5, 30.0, 3.0, 50.0, 'active'),
('Creative J', '2024-01-19'::timestamp with time zone AT TIME ZONE 'UTC' AT TIME ZONE 'America/Sao_Paulo', 1800.00, 54000, 1620, 3.0, 1.11, 33.33, 16200, 8100, 21600, 75.0, 50.0, 10.0, 80.0, 'active');