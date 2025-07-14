
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format, startOfDay, endOfDay } from 'date-fns';
import { fromZonedTime } from 'date-fns-tz';

interface CreativeRankingData {
  creative_name: string;
  total_sales: number;
  total_revenue: number;
  avg_order_value: number;
  completion_rate: number;
}

interface DateRange {
  from: Date;
  to: Date;
}

export const useSalesRankingData = (dateRange: DateRange) => {
  const [rankingData, setRankingData] = useState<CreativeRankingData[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingDataStats, setMissingDataStats] = useState({
    totalSales: 0,
    salesWithMissingCreative: 0,
    percentageMissing: 0,
    missingRevenue: 0
  });
  const { toast } = useToast();

  const fetchRankingData = async () => {
    try {
      setLoading(true);
      
      // Convert local dates to Brazil timezone for proper filtering
      const startDate = fromZonedTime(startOfDay(dateRange.from), 'America/Sao_Paulo');
      const endDate = fromZonedTime(endOfDay(dateRange.to), 'America/Sao_Paulo');
      
      console.log('Fetching creative sales data - Start:', startDate.toISOString(), 'End:', endDate.toISOString());

      // Query creative_sales table with date filtering
      const { data: salesData, error } = await supabase
        .from('creative_sales')
        .select('*')
        .gte('sale_date', startDate.toISOString())
        .lte('sale_date', endDate.toISOString())
        .order('sale_date', { ascending: false });

      if (error) {
        console.error('Error fetching creative sales:', error);
        throw error;
      }

      console.log('Raw sales data for ranking:', salesData?.length || 0, 'records');

      if (!salesData || salesData.length === 0) {
        console.log('No sales data found for the selected date range');
        setRankingData([]);
        setMissingDataStats({
          totalSales: 0,
          salesWithMissingCreative: 0,
          percentageMissing: 0,
          missingRevenue: 0
        });
        return;
      }

      // Analyze missing data
      const totalSales = salesData.length;
      const salesWithMissingCreative = salesData.filter(sale => 
        !sale.creative_name || sale.creative_name.trim() === ''
      ).length;
      const missingRevenue = salesData
        .filter(sale => !sale.creative_name || sale.creative_name.trim() === '')
        .reduce((acc, sale) => acc + (sale.net_value || 0), 0);
      const percentageMissing = totalSales > 0 ? (salesWithMissingCreative / totalSales) * 100 : 0;

      setMissingDataStats({
        totalSales,
        salesWithMissingCreative,
        percentageMissing,
        missingRevenue
      });

      console.log('Missing data analysis:', {
        totalSales,
        salesWithMissingCreative,
        percentageMissing: percentageMissing.toFixed(1) + '%',
        missingRevenue
      });

      // Process data for ranking - treat empty/null creative_name as "Não informado"
      const creativesMetrics = salesData.reduce((acc, sale) => {
        // Normalize creative name - treat empty, null, or whitespace-only as "Não informado"
        const creativeName = (sale.creative_name && sale.creative_name.trim()) 
          ? sale.creative_name.trim() 
          : 'Não informado';
        
        if (!acc[creativeName]) {
          acc[creativeName] = { 
            total_sales: 0, 
            total_revenue: 0,
            completed_sales: 0 
          };
        }
        
        acc[creativeName].total_sales += 1;
        acc[creativeName].total_revenue += (sale.net_value || 0);
        
        // Check if status indicates completed sale
        if (sale.status === 'completed' || sale.status === 'Completed') {
          acc[creativeName].completed_sales += 1;
        }
        
        return acc;
      }, {} as Record<string, { total_sales: number; total_revenue: number; completed_sales: number }>);

      // Transform to ranking data with calculated metrics
      const rankingData: CreativeRankingData[] = Object.entries(creativesMetrics)
        .map(([creative_name, metrics]) => ({
          creative_name,
          total_sales: metrics.total_sales,
          total_revenue: metrics.total_revenue,
          avg_order_value: metrics.total_sales > 0 ? metrics.total_revenue / metrics.total_sales : 0,
          completion_rate: metrics.total_sales > 0 ? (metrics.completed_sales / metrics.total_sales) * 100 : 0
        }))
        .sort((a, b) => b.total_revenue - a.total_revenue); // Sort by revenue desc

      console.log('Processed ranking data:', rankingData.slice(0, 5));
      console.log('Total creatives found:', rankingData.length);

      setRankingData(rankingData);

    } catch (error) {
      console.error('Error fetching ranking data:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados de ranking dos criativos.",
        variant: "destructive",
      });
      setRankingData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRankingData();
  }, [dateRange]);

  return { 
    rankingData, 
    loading, 
    refetch: fetchRankingData,
    missingDataStats
  };
};
