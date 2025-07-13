-- Inserir dados de exemplo na tabela creative_insights
INSERT INTO public.creative_insights (
  creative_name,
  amount_spent,
  date_reported,
  impressions,
  clicks,
  ctr,
  cost_per_click,
  cost_per_mille,
  views_3s,
  views_total,
  views_75_percent,
  hook_rate,
  body_rate,
  cta_rate,
  campaign_name,
  campaign_id,
  ad_id,
  adset_name,
  status
) VALUES 
  ('Creative Health Box V1', 2500.75, '2025-07-12', 45000, 890, 1.98, 2.81, 55.57, 3200, 4500, 2100, 71.1, 46.7, 19.8, 'Campanha Health Box', 'camp_001', 'ad_001', 'Adset Interesses', 'active'),
  ('Creative Health Box V2', 1890.50, '2025-07-12', 38000, 720, 1.89, 2.63, 49.75, 2800, 3600, 1850, 77.8, 51.9, 20.5, 'Campanha Health Box', 'camp_001', 'ad_002', 'Adset Lookalike', 'active'),
  ('Creative Wellness Pro', 3200.00, '2025-07-12', 52000, 1100, 2.12, 2.91, 61.54, 4100, 5200, 2800, 78.8, 61.3, 25.4, 'Campanha Wellness', 'camp_002', 'ad_003', 'Adset Retargeting', 'active'),
  ('Creative Fit Life', 1650.25, '2025-07-12', 31000, 580, 1.87, 2.85, 53.23, 2200, 2900, 1650, 75.9, 48.3, 20.0, 'Campanha Fit Life', 'camp_003', 'ad_004', 'Adset Interesses', 'active'),
  ('Creative Premium Health', 4100.80, '2025-07-12', 68000, 1350, 1.99, 3.04, 60.31, 5100, 6400, 3200, 79.7, 55.1, 21.1, 'Campanha Premium', 'camp_004', 'ad_005', 'Adset Broad', 'active'),
  
  -- Dados para ontem também
  ('Creative Health Box V1', 2200.50, '2025-07-11', 42000, 820, 1.95, 2.68, 52.38, 3000, 4200, 2000, 71.4, 47.2, 19.5, 'Campanha Health Box', 'camp_001', 'ad_001', 'Adset Interesses', 'active'),
  ('Creative Health Box V2', 1750.25, '2025-07-11', 35000, 680, 1.94, 2.57, 50.01, 2600, 3400, 1750, 76.2, 50.1, 20.2, 'Campanha Health Box', 'camp_001', 'ad_002', 'Adset Lookalike', 'active'),
  ('Creative Wellness Pro', 2980.75, '2025-07-11', 49000, 1020, 2.08, 2.92, 60.83, 3800, 4900, 2650, 77.1, 59.8, 24.8, 'Campanha Wellness', 'camp_002', 'ad_003', 'Adset Retargeting', 'active'),
  ('Creative Fit Life', 1520.00, '2025-07-11', 28000, 540, 1.93, 2.81, 54.29, 2000, 2700, 1500, 74.1, 46.7, 19.8, 'Campanha Fit Life', 'camp_003', 'ad_004', 'Adset Interesses', 'active'),
  ('Creative Premium Health', 3850.60, '2025-07-11', 64000, 1280, 2.00, 3.01, 60.17, 4800, 6100, 3000, 78.3, 53.9, 20.7, 'Campanha Premium', 'camp_004', 'ad_005', 'Adset Broad', 'active');