import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

export interface CreativeMetrics {
  id: string;
  creative_name: string;
  campaign_name: string;
  start_date: string;
  end_date: string;
  amount_spent: number;
  views_3s: number;
  views_75_percent: number;
  views_total: number;
  clicks: number;
  pr_hook_rate: number;
  hook_rate: number;
  body_rate: number;
  cta_rate: number;
  ctr: number;
  conv_body_rate: number;
  sales_count: number;
  gross_sales: number;
  profit: number;
  cpa: number;
  roi: number;
  status: string;
  products: string[];
  tags: string[];
}

export const useCreativesData = (
  dateRange: { from: Date; to: Date },
  creativesFilter: string[],
  statusFilter: string
) => {
  const [creatives, setCreatives] = useState<CreativeMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('📊 Fetching creative insights data...');
        
        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd");
        const endDateStr = format(endDate, "yyyy-MM-dd");

        // Build query for creative insights
        let insightsQuery = supabase
          .from('creative_insights')
          .select('*')
          .gte('date_reported', startDateStr)
          .lte('date_reported', endDateStr);

        // Apply status filter
        if (statusFilter !== 'all') {
          insightsQuery = insightsQuery.eq('status', statusFilter);
        }

        // Apply creatives filter
        if (creativesFilter.length > 0) {
          insightsQuery = insightsQuery.in('creative_name', creativesFilter);
        }

        const { data: insightsData, error: insightsError } = await insightsQuery;

        if (insightsError) throw insightsError;

        // Get sales data for ROI calculations
        const { data: salesData, error: salesError } = await supabase
          .from('creative_sales')
          .select('creative_name, gross_value, net_value')
          .gte('sale_date', startDateStr)
          .lte('sale_date', endDateStr);

        if (salesError) throw salesError;

        // Process and combine data
        const processedCreatives: CreativeMetrics[] = (insightsData || []).map(insight => {
          // Calculate sales metrics for this creative
          const creativeSales = salesData?.filter(sale => sale.creative_name === insight.creative_name) || [];
          const totalSales = creativeSales.reduce((sum, sale) => sum + (sale.gross_value || 0), 0);
          const totalNetSales = creativeSales.reduce((sum, sale) => sum + (sale.net_value || 0), 0);
          const salesCount = creativeSales.length;
          
          // Calculate profit and ROI
          const spent = insight.amount_spent || 0;
          const profit = totalNetSales - spent;
          const roi = spent > 0 ? ((profit / spent) * 100) : 0;
          const cpa = salesCount > 0 ? (spent / salesCount) : 0;

          return {
            id: insight.id,
            creative_name: insight.creative_name,
            campaign_name: insight.campaign_name || '',
            start_date: insight.date_reported || '',
            end_date: insight.date_reported || '',
            amount_spent: spent,
            views_3s: insight.views_3s || 0,
            views_75_percent: insight.views_75_percent || 0,
            views_total: insight.views_total || 0,
            clicks: insight.clicks || 0,
            pr_hook_rate: insight.ph_hook_rate || 0,
            hook_rate: insight.hook_rate || 0,
            body_rate: insight.body_rate || 0,
            cta_rate: insight.cta_rate || 0,
            ctr: insight.ctr || 0,
            conv_body_rate: insight.body_rate || 0,
            sales_count: salesCount,
            gross_sales: totalSales,
            profit: profit,
            cpa: cpa,
            roi: roi,
            status: insight.status || 'active',
            products: [],
            tags: []
          };
        });

        setCreatives(processedCreatives);
        console.log('✅ Creative insights data loaded:', processedCreatives.length, 'items');

      } catch (error) {
        console.error('❌ Error fetching creatives data:', error);
        setCreatives([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, creativesFilter, statusFilter]);

  // Calculate total metrics
  const totalMetrics = creatives.reduce((acc, creative) => ({
    spent: acc.spent + creative.amount_spent,
    revenue: acc.revenue + creative.gross_sales,
    orders: acc.orders + creative.sales_count,
    profit: acc.profit + creative.profit,
  }), {
    spent: 0,
    revenue: 0,
    orders: 0,
    profit: 0,
  });

  const avgROI = totalMetrics.spent > 0 ? ((totalMetrics.profit / totalMetrics.spent) * 100) : 0;

  return {
    creatives,
    loading,
    totalMetrics,
    avgROI,
  };
};