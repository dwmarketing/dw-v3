
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface DateRange {
  from: Date;
  to: Date;
}

interface ProductSalesDataItem {
  date: string;
  revenue: number;
  product_name: string;
}

export const useProductSalesChartData = (
  dateRange: DateRange,
  subscriptionsOnly: boolean = true
) => {
  const [chartData, setChartData] = useState<ProductSalesDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProductSalesData = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching product sales data...');

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        // Query product sales data
        let query = supabase
          .from('product_sales')
          .select('sale_date, sale_value, product_name, is_subscription')
          .gte('sale_date', startDateStr)
          .lte('sale_date', endDateStr);

        // Apply subscription filter if specified
        if (subscriptionsOnly) {
          query = query.eq('is_subscription', true);
        }

        const { data, error } = await query;

        if (error) throw error;

        // Process data for chart
        const processedData: ProductSalesDataItem[] = (data || []).map(item => ({
          date: format(new Date(item.sale_date), 'yyyy-MM-dd'),
          revenue: item.sale_value || 0,
          product_name: item.product_name
        }));

        setChartData(processedData);

        console.log('✅ Product sales data loaded:', processedData?.length || 0);

      } catch (error) {
        console.error('❌ Error fetching product sales data:', error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProductSalesData();
  }, [dateRange, subscriptionsOnly]);

  return { chartData, loading };
};
