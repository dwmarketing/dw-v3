
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatInTimeZone } from 'date-fns-tz';

interface SubscriptionMetrics {
  activeSubscriptions: number;
  newSubscriptions: number;
  mrr: number;
  cancellations: number;
  activeSubscriptionsGrowth: number;
  newSubscriptionsGrowth: number;
  mrrGrowth: number;
  cancellationsGrowth: number;
}

interface Filters {
  plan: string;
  eventType: string;
  paymentMethod: string;
  status?: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

const TIMEZONE = 'America/Sao_Paulo';

export const useSubscriptionMetrics = (
  dateRange: DateRange,
  filters: Filters
) => {
  const [metrics, setMetrics] = useState<SubscriptionMetrics>({
    activeSubscriptions: 0,
    newSubscriptions: 0,
    mrr: 0,
    cancellations: 0,
    activeSubscriptionsGrowth: 0,
    newSubscriptionsGrowth: 0,
    mrrGrowth: 0,
    cancellationsGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        console.log('📊 [SUBSCRIPTION METRICS] Fetching metrics with filters:', filters);

        const fromDate = formatInTimeZone(dateRange.from, TIMEZONE, 'yyyy-MM-dd');
        const toDate = formatInTimeZone(dateRange.to, TIMEZONE, 'yyyy-MM-dd');
        
        // Calculate previous period for growth comparison
        const periodDays = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
        const prevFromDate = new Date(dateRange.from.getTime() - (periodDays * 24 * 60 * 60 * 1000));
        const prevToDate = new Date(dateRange.to.getTime() - (periodDays * 24 * 60 * 60 * 1000));
        const prevFromFormatted = formatInTimeZone(prevFromDate, TIMEZONE, 'yyyy-MM-dd');
        const prevToFormatted = formatInTimeZone(prevToDate, TIMEZONE, 'yyyy-MM-dd');

        // Build filters for queries
        const buildQuery = (query: any) => {
          if (filters.plan && filters.plan !== 'all') {
            query = query.eq('plan', filters.plan);
          }
          if (filters.paymentMethod && filters.paymentMethod !== 'all') {
            query = query.eq('payment_method', filters.paymentMethod);
          }
          return query;
        };

        // 1. Active Subscriptions (from subscription_status)
        let activeQuery = supabase
          .from('subscription_status')
          .select('amount', { count: 'exact' })
          .eq('subscription_status', 'active');
        
        activeQuery = buildQuery(activeQuery);
        const { data: activeData, count: activeCount, error: activeError } = await activeQuery;
        
        if (activeError) throw activeError;

        // 2. New Subscriptions (from subscription_events where event_type = 'subscription' - using created_at)
        let newQuery = supabase
          .from('subscription_events')
          .select('amount', { count: 'exact' })
          .eq('event_type', 'subscription')
          .gte('created_at', fromDate + 'T00:00:00.000Z')
          .lte('created_at', toDate + 'T23:59:59.999Z');
        
        newQuery = buildQuery(newQuery);
        const { data: newData, count: newCount, error: newError } = await newQuery;
        
        if (newError) throw newError;

        // 3. Previous period new subscriptions for growth (using created_at)
        let prevNewQuery = supabase
          .from('subscription_events')
          .select('amount', { count: 'exact' })
          .eq('event_type', 'subscription')
          .gte('created_at', prevFromFormatted + 'T00:00:00.000Z')
          .lte('created_at', prevToFormatted + 'T23:59:59.999Z');
        
        prevNewQuery = buildQuery(prevNewQuery);
        const { data: prevNewData, count: prevNewCount, error: prevNewError } = await prevNewQuery;
        
        if (prevNewError) throw prevNewError;

        // 4. Cancellations (from subscription_events where event_type = 'cancellation')
        let cancelQuery = supabase
          .from('subscription_events')
          .select('amount', { count: 'exact' })
          .eq('event_type', 'cancellation')
          .gte('event_date', fromDate)
          .lte('event_date', toDate);
        
        cancelQuery = buildQuery(cancelQuery);
        const { data: cancelData, count: cancelCount, error: cancelError } = await cancelQuery;
        
        if (cancelError) throw cancelError;

        // 5. Previous period cancellations for growth
        let prevCancelQuery = supabase
          .from('subscription_events')
          .select('amount', { count: 'exact' })
          .eq('event_type', 'cancellation')
          .gte('event_date', prevFromFormatted)
          .lte('event_date', prevToFormatted);
        
        prevCancelQuery = buildQuery(prevCancelQuery);
        const { data: prevCancelData, count: prevCancelCount, error: prevCancelError } = await prevCancelQuery;
        
        if (prevCancelError) throw prevCancelError;

        // Calculate MRR from active subscriptions
        const mrr = activeData?.reduce((sum, sub) => sum + (Number(sub.amount) || 0), 0) || 0;
        
        // Calculate growth percentages
        const calculateGrowth = (current: number, previous: number) => {
          if (previous === 0) return current > 0 ? 100 : 0;
          return ((current - previous) / previous) * 100;
        };

        const activeSubscriptions = activeCount || 0;
        const newSubscriptions = newCount || 0;
        const cancellations = cancelCount || 0;
        
        const newSubscriptionsGrowth = calculateGrowth(newSubscriptions, prevNewCount || 0);
        const cancellationsGrowth = calculateGrowth(cancellations, prevCancelCount || 0);

        // For active subscriptions and MRR growth, we'd need historical data
        // For now, we'll calculate based on the difference between new and cancelled
        const netGrowth = newSubscriptions - cancellations;
        const prevNetGrowth = (prevNewCount || 0) - (prevCancelCount || 0);
        const activeSubscriptionsGrowth = calculateGrowth(netGrowth, prevNetGrowth);
        
        // MRR growth approximation based on net subscriber change
        const mrrGrowth = activeSubscriptionsGrowth;

        const calculatedMetrics: SubscriptionMetrics = {
          activeSubscriptions,
          newSubscriptions,
          mrr,
          cancellations,
          activeSubscriptionsGrowth,
          newSubscriptionsGrowth,
          mrrGrowth,
          cancellationsGrowth
        };

        setMetrics(calculatedMetrics);
        console.log('✅ [SUBSCRIPTION METRICS] Real metrics loaded:', calculatedMetrics);

      } catch (error) {
        console.error('❌ [SUBSCRIPTION METRICS] Error fetching metrics:', error);
        setMetrics({
          activeSubscriptions: 0,
          newSubscriptions: 0,
          mrr: 0,
          cancellations: 0,
          activeSubscriptionsGrowth: 0,
          newSubscriptionsGrowth: 0,
          mrrGrowth: 0,
          cancellationsGrowth: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange, filters]);

  return { metrics, loading };
};
