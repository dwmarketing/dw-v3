
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
        
        console.log('📊 [SUBSCRIPTION METRICS] Date range:', { fromDate, toDate });
        
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
          return query;
        };

        // DEBUG: Vamos primeiro verificar todos os status únicos na tabela
        const { data: allStatuses } = await supabase
          .from('subscription_status')
          .select('subscription_status')
          .not('subscription_status', 'is', null);
        
        const uniqueStatuses = [...new Set(allStatuses?.map(item => item.subscription_status) || [])];
        console.log('📊 [DEBUG] Todos os status únicos encontrados:', uniqueStatuses);

        // DEBUG: Verificar registros cancelados sem filtro de data
        const { data: allCanceled, count: allCanceledCount } = await supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .in('subscription_status', ['canceled', 'cancelado', 'cancelled', 'Canceled', 'Cancelled', 'Cancelado']);
        
        console.log('📊 [DEBUG] Total de registros cancelados (sem filtro de data):', allCanceledCount);
        console.log('📊 [DEBUG] Primeiros 5 registros cancelados:', allCanceled?.slice(0, 5));

        // DEBUG: Verificar registros cancelados com canceled_at não nulo
        const { data: canceledWithDate, count: canceledWithDateCount } = await supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .in('subscription_status', ['canceled', 'cancelado', 'cancelled', 'Canceled', 'Cancelled', 'Cancelado'])
          .not('canceled_at', 'is', null);
        
        console.log('📊 [DEBUG] Registros cancelados com canceled_at não nulo:', canceledWithDateCount);
        console.log('📊 [DEBUG] Primeiros 5 com canceled_at:', canceledWithDate?.slice(0, 5));

        // 1. Active Subscriptions (from subscription_status)
        let activeQuery = supabase
          .from('subscription_status')
          .select('amount', { count: 'exact' })
          .in('subscription_status', ['active', 'ativo', 'Active', 'Ativo']);
        
        activeQuery = buildQuery(activeQuery);
        const { data: activeData, count: activeCount, error: activeError } = await activeQuery;
        
        if (activeError) throw activeError;

        // 2. New Subscriptions (from subscription_status - created in period with active status)
        let newQuery = supabase
          .from('subscription_status')
          .select('amount', { count: 'exact' })
          .gte('created_at', fromDate + 'T00:00:00.000Z')
          .lte('created_at', toDate + 'T23:59:59.999Z')
          .in('subscription_status', ['active', 'ativo', 'Active', 'Ativo']);
        
        newQuery = buildQuery(newQuery);
        const { data: newData, count: newCount, error: newError } = await newQuery;
        
        if (newError) throw newError;

        // 3. Previous period new subscriptions for growth (with active status)
        let prevNewQuery = supabase
          .from('subscription_status')
          .select('amount', { count: 'exact' })
          .gte('created_at', prevFromFormatted + 'T00:00:00.000Z')
          .lte('created_at', prevToFormatted + 'T23:59:59.999Z')
          .in('subscription_status', ['active', 'ativo', 'Active', 'Ativo']);
        
        prevNewQuery = buildQuery(prevNewQuery);
        const { data: prevNewData, count: prevNewCount, error: prevNewError } = await prevNewQuery;
        
        if (prevNewError) throw prevNewError;

        // 4. Cancellations (from subscription_status where status is canceled and created_at is in period)
        console.log('📊 [DEBUG] Buscando cancelamentos por created_at entre:', fromDate + 'T00:00:00.000Z', 'e', toDate + 'T23:59:59.999Z');
        
        let cancelQuery = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .in('subscription_status', ['canceled', 'cancelado', 'cancelled', 'Canceled', 'Cancelled', 'Cancelado'])
          .gte('created_at', fromDate + 'T00:00:00.000Z')
          .lte('created_at', toDate + 'T23:59:59.999Z');
        
        cancelQuery = buildQuery(cancelQuery);
        const { data: cancelData, count: cancelCount, error: cancelError } = await cancelQuery;
        
        console.log('📊 [DEBUG] Resultado da query de cancelamentos por created_at:', {
          count: cancelCount,
          data: cancelData,
          error: cancelError
        });
        
        if (cancelError) throw cancelError;

        // 5. Previous period cancellations for growth (using created_at)
        let prevCancelQuery = supabase
          .from('subscription_status')
          .select('amount', { count: 'exact' })
          .in('subscription_status', ['canceled', 'cancelado', 'cancelled', 'Canceled', 'Cancelled', 'Cancelado'])
          .gte('created_at', prevFromFormatted + 'T00:00:00.000Z')
          .lte('created_at', prevToFormatted + 'T23:59:59.999Z');
        
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
        console.log('✅ [SUBSCRIPTION METRICS] Metrics loaded:', {
          activeSubscriptions,
          newSubscriptions,
          cancellations,
          newSubscriptionsGrowth,
          cancellationsGrowth
        });

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
