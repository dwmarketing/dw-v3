-- Insert comprehensive mock data for creative_insights table
-- This data covers Jan 2024 - Jun 2024 and correlates with existing creative_sales data

INSERT INTO public.creative_insights (
  creative_name, ad_id, campaign_id, campaign_name, adset_name, 
  amount_spent, impressions, clicks, ctr, cost_per_click, cost_per_mille,
  views_total, views_3s, views_75_percent, hook_rate, body_rate, cta_rate,
  ph_hook_rate, status, date_reported
) VALUES
-- Creative A - High Performer (January 2024)
('Creative A', 'ad_001', 'camp_001', 'Campaign Launch Q1', 'AdSet Interest 18-35', 15000, 250000, 3750, 1.5, 4.00, 60.00, 200000, 150000, 80000, 75.0, 65.0, 40.0, 78.0, 'active', '2024-01-15'),
('Creative A', 'ad_001', 'camp_001', 'Campaign Launch Q1', 'AdSet Interest 18-35', 18000, 300000, 4200, 1.4, 4.29, 60.00, 240000, 180000, 95000, 75.0, 65.0, 39.5, 78.0, 'active', '2024-01-30'),

-- Creative B - Medium Performer (January-February 2024)
('Creative B', 'ad_002', 'camp_001', 'Campaign Launch Q1', 'AdSet Lookalike 1%', 8000, 180000, 1800, 1.0, 4.44, 44.44, 144000, 108000, 54000, 60.0, 55.0, 30.0, 62.0, 'active', '2024-01-15'),
('Creative B', 'ad_002', 'camp_001', 'Campaign Launch Q1', 'AdSet Lookalike 1%', 9500, 220000, 2200, 1.0, 4.32, 43.18, 176000, 132000, 66000, 60.0, 55.0, 30.0, 62.0, 'active', '2024-02-15'),

-- Creative C - Variable Performer (February-March 2024)
('Creative C', 'ad_003', 'camp_002', 'Campaign Retargeting Q1', 'AdSet Warm Audience', 12000, 200000, 2400, 1.2, 5.00, 60.00, 160000, 120000, 64000, 80.0, 70.0, 40.0, 82.0, 'active', '2024-02-15'),
('Creative C', 'ad_003', 'camp_002', 'Campaign Retargeting Q1', 'AdSet Warm Audience', 14500, 250000, 2750, 1.1, 5.27, 58.00, 200000, 150000, 80000, 80.0, 70.0, 38.5, 82.0, 'active', '2024-03-15'),

-- Creative D - Declining Performance (March-April 2024)
('Creative D', 'ad_004', 'camp_002', 'Campaign Retargeting Q1', 'AdSet Custom Audience', 11000, 220000, 2200, 1.0, 5.00, 50.00, 176000, 132000, 70400, 75.0, 68.0, 32.0, 77.0, 'active', '2024-03-15'),
('Creative D', 'ad_004', 'camp_002', 'Campaign Retargeting Q1', 'AdSet Custom Audience', 13000, 260000, 2340, 0.9, 5.56, 50.00, 208000, 156000, 83200, 72.0, 65.0, 30.0, 74.0, 'paused', '2024-04-15'),

-- Creative E - New Launch High Performer (April-May 2024)
('Creative E', 'ad_005', 'camp_003', 'Campaign Spring Launch', 'AdSet Broad Targeting', 20000, 400000, 6000, 1.5, 3.33, 50.00, 320000, 240000, 128000, 80.0, 72.0, 45.0, 83.0, 'active', '2024-04-15'),
('Creative E', 'ad_005', 'camp_003', 'Campaign Spring Launch', 'AdSet Broad Targeting', 25000, 500000, 7500, 1.5, 3.33, 50.00, 400000, 300000, 160000, 80.0, 72.0, 45.0, 83.0, 'active', '2024-05-15'),

-- Creative F - Consistent Medium Performer (May-June 2024)
('Creative F', 'ad_006', 'camp_003', 'Campaign Spring Launch', 'AdSet Interest Stacking', 16000, 320000, 3520, 1.1, 4.55, 50.00, 256000, 192000, 102400, 75.0, 68.0, 35.0, 78.0, 'active', '2024-05-15'),
('Creative F', 'ad_006', 'camp_003', 'Campaign Spring Launch', 'AdSet Interest Stacking', 18000, 360000, 3960, 1.1, 4.55, 50.00, 288000, 216000, 115200, 75.0, 68.0, 35.0, 78.0, 'active', '2024-06-15'),

-- Additional historical data for better trend analysis
-- Creative A - Extended performance
('Creative A', 'ad_001', 'camp_001', 'Campaign Launch Q1', 'AdSet Interest 18-35', 22000, 350000, 4900, 1.4, 4.49, 62.86, 280000, 210000, 112000, 74.0, 64.0, 38.0, 76.0, 'active', '2024-02-15'),
('Creative A', 'ad_001', 'camp_001', 'Campaign Launch Q1', 'AdSet Interest 18-35', 19000, 320000, 4160, 1.3, 4.57, 59.38, 256000, 192000, 102400, 72.0, 62.0, 36.0, 74.0, 'active', '2024-03-15'),

-- Creative B - Extended performance
('Creative B', 'ad_002', 'camp_001', 'Campaign Launch Q1', 'AdSet Lookalike 1%', 10000, 240000, 2400, 1.0, 4.17, 41.67, 192000, 144000, 76800, 58.0, 53.0, 29.0, 60.0, 'active', '2024-03-15'),
('Creative B', 'ad_002', 'camp_001', 'Campaign Launch Q1', 'AdSet Lookalike 1%', 7500, 200000, 1800, 0.9, 4.17, 37.50, 160000, 120000, 64000, 55.0, 50.0, 27.0, 57.0, 'paused', '2024-04-15'),

-- Creative C - Extended performance  
('Creative C', 'ad_003', 'camp_002', 'Campaign Retargeting Q1', 'AdSet Warm Audience', 16000, 280000, 3080, 1.1, 5.19, 57.14, 224000, 168000, 89600, 78.0, 68.0, 37.0, 80.0, 'active', '2024-04-15'),
('Creative C', 'ad_003', 'camp_002', 'Campaign Retargeting Q1', 'AdSet Warm Audience', 17500, 300000, 3300, 1.1, 5.30, 58.33, 240000, 180000, 96000, 76.0, 66.0, 36.0, 78.0, 'active', '2024-05-15'),

-- New creatives for Q2 2024
-- Creative G - New Video Creative
('Creative G', 'ad_007', 'camp_004', 'Campaign Summer Promo', 'AdSet Video Viewers', 14000, 280000, 2800, 1.0, 5.00, 50.00, 224000, 168000, 89600, 85.0, 75.0, 42.0, 87.0, 'active', '2024-05-01'),
('Creative G', 'ad_007', 'camp_004', 'Campaign Summer Promo', 'AdSet Video Viewers', 16000, 320000, 3200, 1.0, 5.00, 50.00, 256000, 192000, 102400, 85.0, 75.0, 42.0, 87.0, 'active', '2024-06-01'),

-- Creative H - Carousel Creative
('Creative H', 'ad_008', 'camp_004', 'Campaign Summer Promo', 'AdSet Carousel Testing', 13000, 260000, 2860, 1.1, 4.55, 50.00, 208000, 156000, 83200, 70.0, 60.0, 38.0, 72.0, 'active', '2024-05-01'),
('Creative H', 'ad_008', 'camp_004', 'Campaign Summer Promo', 'AdSet Carousel Testing', 15000, 300000, 3300, 1.1, 4.55, 50.00, 240000, 180000, 96000, 70.0, 60.0, 38.0, 72.0, 'active', '2024-06-01'),

-- Creative I - Static Image Creative
('Creative I', 'ad_009', 'camp_005', 'Campaign Content Marketing', 'AdSet Blog Readers', 9000, 180000, 1620, 0.9, 5.56, 50.00, 144000, 108000, 57600, 60.0, 55.0, 25.0, 62.0, 'active', '2024-05-15'),
('Creative I', 'ad_009', 'camp_005', 'Campaign Content Marketing', 'AdSet Blog Readers', 10500, 210000, 1890, 0.9, 5.56, 50.00, 168000, 126000, 67200, 60.0, 55.0, 25.0, 62.0, 'active', '2024-06-15'),

-- Creative J - UGC Creative
('Creative J', 'ad_010', 'camp_005', 'Campaign Content Marketing', 'AdSet UGC Audience', 12000, 240000, 2640, 1.1, 4.55, 50.00, 192000, 144000, 76800, 82.0, 78.0, 48.0, 85.0, 'active', '2024-06-01'),
('Creative J', 'ad_010', 'camp_005', 'Campaign Content Marketing', 'AdSet UGC Audience', 13500, 270000, 2970, 1.1, 4.55, 50.00, 216000, 162000, 86400, 82.0, 78.0, 48.0, 85.0, 'active', '2024-06-15');

-- Update existing records to have more realistic date distributions
UPDATE public.creative_insights SET date_reported = '2024-01-10' WHERE creative_name = 'Creative A' AND amount_spent = 15000;
UPDATE public.creative_insights SET date_reported = '2024-01-25' WHERE creative_name = 'Creative A' AND amount_spent = 18000;