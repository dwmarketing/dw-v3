
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

        // Placeholder implementation - replace with actual data sources
        const mockData: ProductSalesDataItem[] = [
          { date: '2024-01-01', revenue: 5000, product_name: 'Produto A' },
          { date: '2024-01-02', revenue: 3200, product_name: 'Produto B' },
          { date: '2024-01-03', revenue: 4800, product_name: 'Produto C' },
          { date: '2024-01-04', revenue: 2100, product_name: 'Produto D' },
        ];

        setChartData(mockData);

        console.log('✅ Product sales data loaded:', mockData?.length || 0);

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
