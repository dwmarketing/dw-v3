
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateRangeForQuery } from '@/lib/dateUtils';

interface MonthlyKPIs {
  totalSpent: number;
  totalRevenue: number;
  totalOrders: number;
  avgROI: number;
  avgTicket: number;
}

export const useMonthlyKPIs = (dateRange: { from: Date; to: Date }) => {
  const [kpis, setKpis] = useState<MonthlyKPIs>({
    totalSpent: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgROI: 0,
    avgTicket: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMonthlyKPIs = async () => {
    try {
      setLoading(true);
      console.log('📊 Fetching monthly KPIs...');
      
      const { startDateStr, endDateStr } = formatDateRangeForQuery(dateRange);

      // Get creative insights for total spent
      const { data: insightsData, error: insightsError } = await supabase
        .from('creative_insights')
        .select('amount_spent')
        .gte('date_reported', startDateStr)
        .lte('date_reported', endDateStr);

      if (insightsError) throw insightsError;

      // Get creative sales for revenue and orders
      const { data: salesData, error: salesError } = await supabase
        .from('creative_sales')
        .select('gross_value, net_value')
        .gte('sale_date', startDateStr)
        .lte('sale_date', endDateStr)
        .eq('status', 'completed');

      if (salesError) throw salesError;

      // Get product sales for additional revenue
      const { data: productSalesData, error: productSalesError } = await supabase
        .from('product_sales')
        .select('sale_value')
        .gte('sale_date', startDateStr)
        .lte('sale_date', endDateStr);

      if (productSalesError) throw productSalesError;

      // Calculate totals
      const totalSpent = (insightsData || []).reduce((sum, item) => sum + (item.amount_spent || 0), 0);
      const creativesRevenue = (salesData || []).reduce((sum, item) => sum + (item.gross_value || 0), 0);
      const productRevenue = (productSalesData || []).reduce((sum, item) => sum + (item.sale_value || 0), 0);
      const totalRevenue = creativesRevenue + productRevenue;
      const totalOrders = (salesData || []).length + (productSalesData || []).length;
      
      const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const profit = totalRevenue - totalSpent;
      const avgROI = totalSpent > 0 ? Number(((profit / totalSpent) * 100).toFixed(2)) : 0;

      setKpis({
        totalSpent,
        totalRevenue,
        totalOrders,
        avgROI,
        avgTicket
      });

      console.log('✅ Monthly KPIs loaded:', { totalSpent, totalRevenue, totalOrders, avgROI, avgTicket });
      
    } catch (error) {
      console.error('❌ Error fetching monthly KPIs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as métricas mensais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyKPIs();
  }, [dateRange]);

  return { kpis, loading, refetch: fetchMonthlyKPIs };
};
