
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatDateRangeForQuery } from '@/lib/dateUtils';

interface RenewalMetrics {
  totalRenewals: number;
  totalRenewalRevenue: number;
  averageRenewalValue: number;
  renewalsByPlan: Record<string, number>;
  renewalRevenueByPlan: Record<string, number>;
  renewalGrowth: number;
  revenueGrowth: number;
}

interface Filters {
  plan: string;
  eventType: string;
  paymentMethod: string;
  status: string;
}

interface DateRange {
  from: Date;
  to: Date;
}

export const useSubscriptionRenewalMetrics = (
  dateRange: DateRange,
  filters: Filters
) => {
  const [metrics, setMetrics] = useState<RenewalMetrics>({
    totalRenewals: 0,
    totalRenewalRevenue: 0,
    averageRenewalValue: 0,
    renewalsByPlan: {},
    renewalRevenueByPlan: {},
    renewalGrowth: 0,
    revenueGrowth: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        console.log('📊 [RENEWAL METRICS] Starting to fetch renewal metrics...');

        // Use standardized date formatting
        const { startDateStr, endDateStr } = formatDateRangeForQuery(dateRange);

        console.log('📊 [RENEWAL METRICS] Date range (standardized):', { startDateStr, endDateStr });

        // Query subscription renewals for main metrics
        let renewalsQuery = supabase
          .from('subscription_renewals')
          .select('*')
          .gte('created_at', startDateStr)
          .lte('created_at', endDateStr);

        // Apply filters
        if (filters.plan !== 'all') {
          renewalsQuery = renewalsQuery.eq('plan', filters.plan);
        }

        if (filters.status !== 'all') {
          renewalsQuery = renewalsQuery.eq('subscription_status', filters.status);
        }

        const { data: renewalsData, error: renewalsError } = await renewalsQuery;
        if (renewalsError) throw renewalsError;

        // Process renewal metrics
        const renewalsList = renewalsData || [];
        const totalRenewals = renewalsList.length;
        const totalRenewalRevenue = renewalsList.reduce((sum, renewal) => sum + (renewal.amount || 0), 0);
        const averageRenewalValue = totalRenewals > 0 ? totalRenewalRevenue / totalRenewals : 0;

        // Group by plan
        const renewalsByPlan: Record<string, number> = {};
        const renewalRevenueByPlan: Record<string, number> = {};
        
        renewalsList.forEach(renewal => {
          const plan = renewal.plan;
          renewalsByPlan[plan] = (renewalsByPlan[plan] || 0) + 1;
          renewalRevenueByPlan[plan] = (renewalRevenueByPlan[plan] || 0) + (renewal.amount || 0);
        });

        // Calculate growth (comparing with previous period)
        const previousPeriodStart = new Date(dateRange.from);
        const previousPeriodEnd = new Date(dateRange.to);
        const periodDuration = previousPeriodEnd.getTime() - previousPeriodStart.getTime();
        
        previousPeriodStart.setTime(previousPeriodStart.getTime() - periodDuration);
        previousPeriodEnd.setTime(previousPeriodEnd.getTime() - periodDuration);

        const { data: previousRenewalsData } = await supabase
          .from('subscription_renewals')
          .select('amount')
          .gte('created_at', previousPeriodStart.toISOString())
          .lte('created_at', previousPeriodEnd.toISOString());

        const previousRenewals = previousRenewalsData?.length || 0;
        const previousRevenue = (previousRenewalsData || []).reduce((sum, renewal) => sum + (renewal.amount || 0), 0);

        const renewalGrowth = previousRenewals > 0 ? ((totalRenewals - previousRenewals) / previousRenewals) * 100 : 0;
        const revenueGrowth = previousRevenue > 0 ? ((totalRenewalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

        setMetrics({
          totalRenewals,
          totalRenewalRevenue,
          averageRenewalValue,
          renewalsByPlan,
          renewalRevenueByPlan,
          renewalGrowth,
          revenueGrowth
        });

        console.log('✅ Renewal metrics loaded:', {
          totalRenewals,
          totalRenewalRevenue,
          renewalGrowth,
          revenueGrowth
        });


      } catch (error) {
        console.error('❌ [RENEWAL METRICS] Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [dateRange, filters]);

  return { metrics, loading };
};
