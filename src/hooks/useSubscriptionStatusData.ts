
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionStatusData {
  id: string;
  subscription_id: string;
  customer_name: string;
  customer_email: string;
  plan: string;
  amount: number;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  subscription_number: number;
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

export const useSubscriptionStatusData = (
  dateRange: DateRange,
  filters: Filters,
  page: number,
  pageSize: number,
  searchTerm: string = ''
) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionStatusData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching subscription status data...');

        // Query subscription status data
        let query = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());

        // Apply filters
        if (filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        if (filters.status !== 'all') {
          query = query.eq('subscription_status', filters.status);
        }

        // Apply search filter
        if (searchTerm) {
          query = query.or(`customer_name.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%`);
        }

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        setSubscriptions(data || []);
        setTotalCount(count || 0);

        console.log('✅ Subscription status data loaded:', data?.length || 0, 'items');



      } catch (error) {
        console.error('❌ Error fetching subscription status data:', error);
        setSubscriptions([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [dateRange, filters, page, pageSize, searchTerm]);

  return { subscriptions, loading, totalCount };
};
