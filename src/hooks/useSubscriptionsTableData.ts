
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionTableData {
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

interface DateRange {
  from: Date;
  to: Date;
}

export const useSubscriptionsTableData = (
  dateRange: DateRange,
  statusFilter: string,
  page: number,
  pageSize: number
) => {
  const [subscriptions, setSubscriptions] = useState<SubscriptionTableData[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching subscriptions table data...');

        // Query subscription status data
        let query = supabase
          .from('subscription_status')
          .select('*', { count: 'exact' })
          .gte('created_at', dateRange.from.toISOString())
          .lte('created_at', dateRange.to.toISOString());

        // Apply status filter
        if (statusFilter !== 'all') {
          query = query.eq('subscription_status', statusFilter);
        }

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;

        if (error) throw error;

        setSubscriptions(data || []);
        setTotalCount(count || 0);

        console.log('✅ Subscriptions table data loaded:', data?.length || 0, 'items');


      } catch (error) {
        console.error('❌ Error fetching subscriptions table data:', error);
        setSubscriptions([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptions();
  }, [dateRange, statusFilter, page, pageSize]);

  const exportToCSV = async () => {
    try {
      console.log('📥 Exporting subscriptions to CSV...');
      
      // Query all subscription data for export (without pagination)
      let query = supabase
        .from('subscription_status')
        .select('*')
        .gte('created_at', dateRange.from.toISOString())
        .lte('created_at', dateRange.to.toISOString());

      if (statusFilter !== 'all') {
        query = query.eq('subscription_status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      if (!data || data.length === 0) {
        console.log('No data to export');
        return;
      }

      // Create CSV content
      const headers = ['ID', 'Subscription ID', 'Customer Name', 'Customer Email', 'Plan', 'Amount', 'Status', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...data.map(row => [
          row.id,
          row.subscription_id || '',
          `"${row.customer_name || ''}"`,
          row.customer_email || '',
          `"${row.plan}"`,
          row.amount,
          row.subscription_status,
          new Date(row.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n');

      // Download CSV
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `subscriptions_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      console.log('✅ CSV exported successfully');

    } catch (error) {
      console.error('❌ Error exporting CSV:', error);
    }
  };

  return { subscriptions, loading, totalCount, exportToCSV };
};
