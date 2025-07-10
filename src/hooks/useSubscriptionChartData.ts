
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

interface ChartFilters {
  plan: string;
  eventType: string;
  paymentMethod: string;
  status: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

interface ChartDataItem {
  date: string;
  revenue: number;
  plan: string;
}

export const useSubscriptionChartData = (
  dateRange: DateRange,
  filters: ChartFilters,
  type: 'subscriptions' | 'renewals'
) => {
  const [chartData, setChartData] = useState<ChartDataItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        setLoading(true);
        console.log(`📊 Fetching ${type} chart data with product filter:`, filters.plan);

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        // Placeholder implementation - replace with actual data sources
        const mockData: ChartDataItem[] = [
          { date: '2024-01-01', revenue: 1500, plan: 'Plano A' },
          { date: '2024-01-02', revenue: 2200, plan: 'Plano B' },
          { date: '2024-01-03', revenue: 1800, plan: 'Plano C' },
          { date: '2024-01-04', revenue: 2500, plan: 'Plano A' },
        ];

        setChartData(mockData);

        console.log(`✅ ${type} chart data loaded:`, mockData.length, 'items');

      } catch (error) {
        console.error(`❌ Error fetching ${type} chart data:`, error);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, [dateRange, filters, type]);

  return { chartData, loading };
};
