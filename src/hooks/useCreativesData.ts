import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { format } from 'date-fns';
import { 
  standardizeCreativeName, 
  createCreativeNameMapping,
  getInsightsForCreative,
  getSalesForCreative 
} from './useCreativeNameStandardization';

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
        console.log('📊 [CREATIVES DATA] Fetching data for date range:', dateRange);
        
        const startDateStr = format(dateRange.from, "yyyy-MM-dd");
        const endDateStr = format(dateRange.to, "yyyy-MM-dd");

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

        console.log('📊 [CREATIVES DATA] Insights data fetched:', insightsData?.length || 0, 'records');
        console.log('📊 [CREATIVES DATA] Creative names in insights:', insightsData?.map(i => i.creative_name) || []);

        // Get sales data for ROI calculations
        let salesQuery = supabase
          .from('creative_sales')
          .select('creative_name, gross_value, net_value, tags, order_id')
          .gte('sale_date', startDateStr)
          .lte('sale_date', endDateStr);

        const { data: salesData, error: salesError } = await salesQuery;

        if (salesError) throw salesError;

        console.log('📊 [CREATIVES DATA] Sales data fetched:', salesData?.length || 0, 'records');
        console.log('📊 [CREATIVES DATA] Creative names in sales:', [...new Set(salesData?.map(s => s.creative_name) || [])]);

        // Standardize creative names and create mappings
        const insightsNames = insightsData?.map(i => i.creative_name).filter(Boolean) || [];
        const salesNames = salesData?.map(s => s.creative_name).filter(Boolean) || [];
        
        const nameMapping = createCreativeNameMapping(insightsNames, salesNames);
        console.log('📊 [CREATIVES DATA] Name mapping created:', nameMapping.size, 'standardized names');

        // Get all unique standardized creative names
        const allStandardizedNames = Array.from(nameMapping.keys());
        console.log('📊 [CREATIVES DATA] Standardized creative names:', allStandardizedNames);

        // Group insights by original creative name to aggregate data
        const insightsMap = new Map<string, any[]>();
        insightsData?.forEach(insight => {
          const name = insight.creative_name;
          if (!insightsMap.has(name)) {
            insightsMap.set(name, []);
          }
          insightsMap.get(name)!.push(insight);
        });

        // Group sales by original creative name
        const salesMap = new Map<string, any[]>();
        salesData?.forEach(sale => {
          const name = sale.creative_name;
          if (!salesMap.has(name)) {
            salesMap.set(name, []);
          }
          salesMap.get(name)!.push(sale);
        });

        console.log('📊 [CREATIVES DATA] Insights map keys:', Array.from(insightsMap.keys()));
        console.log('📊 [CREATIVES DATA] Sales map keys:', Array.from(salesMap.keys()));

        // Process and combine data for each standardized creative
        const processedCreatives: CreativeMetrics[] = [];
        
        allStandardizedNames.forEach(standardizedName => {
          console.log(`📊 [PROCESSING] Processing standardized creative: ${standardizedName}`);
          
          // Get all original names that map to this standardized name
          const mappings = nameMapping.get(standardizedName) || [];
          const insightsNames = mappings.filter(m => m.source === 'insights').map(m => m.originalName);
          const salesNames = mappings.filter(m => m.source === 'sales').map(m => m.originalName);
          
          // Collect insights from all matching names
          let creativeInsights: any[] = [];
          insightsNames.forEach(name => {
            const insights = getInsightsForCreative(name, insightsMap);
            creativeInsights = [...creativeInsights, ...insights];
          });
          
          // Collect sales from all matching names
          let creativeSales: any[] = [];
          salesNames.forEach(name => {
            const sales = getSalesForCreative(name, salesMap);
            creativeSales = [...creativeSales, ...sales];
          });
          
          console.log(`📊 [PROCESSING] ${standardizedName} - Insights: ${creativeInsights.length}, Sales: ${creativeSales.length}`);

          // Skip if no data for this creative
          if (creativeInsights.length === 0 && creativeSales.length === 0) {
            console.log(`📊 [SKIP] No data for creative: ${standardizedName}`);
            return;
          }

          // Aggregate insights data
          const aggregatedInsight = creativeInsights.reduce((acc, insight) => ({
            amount_spent: (acc.amount_spent || 0) + (insight.amount_spent || 0),
            views_3s: (acc.views_3s || 0) + (insight.views_3s || 0),
            views_75_percent: (acc.views_75_percent || 0) + (insight.views_75_percent || 0),
            views_total: (acc.views_total || 0) + (insight.views_total || 0),
            clicks: (acc.clicks || 0) + (insight.clicks || 0),
            impressions: (acc.impressions || 0) + (insight.impressions || 0),
            // For rates, take the average weighted by views_total
            ph_hook_rate: insight.views_total > 0 ? 
              ((acc.ph_hook_rate_weighted || 0) + (insight.ph_hook_rate || 0) * insight.views_total) : 
              (acc.ph_hook_rate_weighted || 0),
            hook_rate: insight.views_total > 0 ? 
              ((acc.hook_rate_weighted || 0) + (insight.hook_rate || 0) * insight.views_total) : 
              (acc.hook_rate_weighted || 0),
            body_rate: insight.views_total > 0 ? 
              ((acc.body_rate_weighted || 0) + (insight.body_rate || 0) * insight.views_total) : 
              (acc.body_rate_weighted || 0),
            cta_rate: insight.views_total > 0 ? 
              ((acc.cta_rate_weighted || 0) + (insight.cta_rate || 0) * insight.views_total) : 
              (acc.cta_rate_weighted || 0),
            ph_hook_rate_weighted: insight.views_total > 0 ? 
              ((acc.ph_hook_rate_weighted || 0) + (insight.ph_hook_rate || 0) * insight.views_total) : 
              (acc.ph_hook_rate_weighted || 0),
            hook_rate_weighted: insight.views_total > 0 ? 
              ((acc.hook_rate_weighted || 0) + (insight.hook_rate || 0) * insight.views_total) : 
              (acc.hook_rate_weighted || 0),
            body_rate_weighted: insight.views_total > 0 ? 
              ((acc.body_rate_weighted || 0) + (insight.body_rate || 0) * insight.views_total) : 
              (acc.body_rate_weighted || 0),
            cta_rate_weighted: insight.views_total > 0 ? 
              ((acc.cta_rate_weighted || 0) + (insight.cta_rate || 0) * insight.views_total) : 
              (acc.cta_rate_weighted || 0),
            campaign_name: acc.campaign_name || insight.campaign_name,
            status: acc.status || insight.status,
            date_start: acc.date_start ? 
              (new Date(insight.date_reported || 0) < new Date(acc.date_start) ? insight.date_reported : acc.date_start) : 
              insight.date_reported,
            date_end: acc.date_end ? 
              (new Date(insight.date_reported || 0) > new Date(acc.date_end) ? insight.date_reported : acc.date_end) : 
              insight.date_reported,
          }), {} as any);

          // Calculate weighted averages for rates
          const totalViews = aggregatedInsight.views_total || 0;
          const finalPhHookRate = totalViews > 0 ? (aggregatedInsight.ph_hook_rate_weighted || 0) / totalViews : 0;
          const finalHookRate = totalViews > 0 ? (aggregatedInsight.hook_rate_weighted || 0) / totalViews : 0;
          const finalBodyRate = totalViews > 0 ? (aggregatedInsight.body_rate_weighted || 0) / totalViews : 0;
          const finalCtaRate = totalViews > 0 ? (aggregatedInsight.cta_rate_weighted || 0) / totalViews : 0;

          // Calculate sales metrics
          const totalSales = creativeSales.reduce((sum, sale) => sum + (sale.gross_value || 0), 0);
          const totalNetSales = creativeSales.reduce((sum, sale) => sum + (sale.net_value || 0), 0);
          const salesCount = creativeSales.length;

          // Get unique tags
          const allTags = creativeSales
            .flatMap(sale => sale.tags || [])
            .filter((tag, index, arr) => arr.indexOf(tag) === index);

          // Calculate metrics
          const spent = aggregatedInsight.amount_spent || 0;
          const profit = totalNetSales - spent;
          const roi = spent > 0 ? ((profit / spent) * 100) : 0;
          const cpa = salesCount > 0 ? (spent / salesCount) : 0;
          const ctr = aggregatedInsight.impressions > 0 ? 
            ((aggregatedInsight.clicks || 0) / aggregatedInsight.impressions) * 100 : 0;

          // Get product info from tags (assuming product names might be in tags)
          const products: string[] = [];

          console.log(`📊 [CREATIVE: ${standardizedName}] Final metrics:`, {
            spent,
            totalSales,
            profit,
            roi: roi.toFixed(2) + '%',
            salesCount,
            cpa: cpa.toFixed(2)
          });

          const creative: CreativeMetrics = {
            id: `creative_${standardizedName.replace(/\s+/g, '_').toLowerCase()}`,
            creative_name: standardizedName,
            campaign_name: aggregatedInsight.campaign_name || '',
            start_date: aggregatedInsight.date_start ? format(new Date(aggregatedInsight.date_start), 'dd/MM/yyyy') : '',
            end_date: aggregatedInsight.date_end ? format(new Date(aggregatedInsight.date_end), 'dd/MM/yyyy') : '',
            amount_spent: spent,
            views_3s: aggregatedInsight.views_3s || 0,
            views_75_percent: aggregatedInsight.views_75_percent || 0,
            views_total: aggregatedInsight.views_total || 0,
            clicks: aggregatedInsight.clicks || 0,
            pr_hook_rate: finalPhHookRate,
            hook_rate: finalHookRate,
            body_rate: finalBodyRate,
            cta_rate: finalCtaRate,
            ctr: ctr,
            conv_body_rate: finalBodyRate, // Using body_rate as conv_body_rate
            sales_count: salesCount,
            gross_sales: totalSales,
            profit: profit,
            cpa: cpa,
            roi: roi,
            status: aggregatedInsight.status || 'active',
            products: products,
            tags: allTags
          };

          processedCreatives.push(creative);
        });

        console.log('📊 [CREATIVES DATA] Processed creatives:', processedCreatives.length);
        console.log('📊 [CREATIVES DATA] Sample creative:', processedCreatives[0]);

        setCreatives(processedCreatives);

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