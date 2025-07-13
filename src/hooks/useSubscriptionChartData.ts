
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

        // Query based on type with different date fields
        let processedData: ChartDataItem[] = [];

        if (type === 'subscriptions') {
          // Query subscription events
          let eventsQuery = supabase
            .from('subscription_events')
            .select('event_date, amount, plan, event_type')
            .gte('event_date', startDateStr)
            .lte('event_date', endDateStr);

          if (filters.plan !== 'all') {
            eventsQuery = eventsQuery.eq('plan', filters.plan);
          }

          if (filters.eventType !== 'all') {
            eventsQuery = eventsQuery.eq('event_type', filters.eventType);
          }

          const { data: eventsData, error: eventsError } = await eventsQuery;
          if (eventsError) throw eventsError;

          processedData = (eventsData || []).map(item => ({
            date: format(new Date(item.event_date), 'yyyy-MM-dd'),
            revenue: item.amount || 0,
            plan: item.plan
          }));
        } else {
          // Query subscription renewals
          let renewalsQuery = supabase
            .from('subscription_renewals')
            .select('created_at, amount, plan, subscription_status')
            .gte('created_at', startDateStr)
            .lte('created_at', endDateStr);

          if (filters.plan !== 'all') {
            renewalsQuery = renewalsQuery.eq('plan', filters.plan);
          }

          if (filters.status !== 'all') {
            renewalsQuery = renewalsQuery.eq('subscription_status', filters.status);
          }

          const { data: renewalsData, error: renewalsError } = await renewalsQuery;
          if (renewalsError) throw renewalsError;

          processedData = (renewalsData || []).map(item => ({
            date: format(new Date(item.created_at), 'yyyy-MM-dd'),
            revenue: item.amount || 0,
            plan: item.plan
          }));
        }

        setChartData(processedData);

        console.log(`✅ ${type} chart data loaded:`, processedData.length, 'items');

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
