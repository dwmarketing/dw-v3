
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatInTimeZone } from 'date-fns-tz';

interface SubscriptionRenewal {
  id: string;
  subscription_id: string | null;
  customer_id: string | null;
  customer_email: string | null;
  customer_name: string | null;
  plan: string;
  amount: number;
  currency: string;
  frequency: string | null;
  subscription_status: string;
  created_at: string;
  updated_at: string;
  canceled_at: string | null;
  subscription_number: number | null;
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

const TIMEZONE = 'America/Sao_Paulo';

export const useSubscriptionRenewals = (
  dateRange: DateRange,
  filters: Filters,
  page: number,
  pageSize: number,
  searchTerm: string = ''
) => {
  const [renewals, setRenewals] = useState<SubscriptionRenewal[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  // Use refs to track current request and prevent race conditions
  const abortControllerRef = useRef<AbortController | null>(null);
  const requestIdRef = useRef<string>('');

  useEffect(() => {
    const fetchRenewals = async () => {
      try {
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        // Generate unique request ID
        const requestId = Date.now().toString();
        requestIdRef.current = requestId;

        setLoading(true);
        setError(null);
        console.log('📊 [SUBSCRIPTION RENEWALS] Fetching renewals...', { requestId, filters, searchTerm });

        const fromDate = formatInTimeZone(dateRange.from, TIMEZONE, 'yyyy-MM-dd');
        const toDate = formatInTimeZone(dateRange.to, TIMEZONE, 'yyyy-MM-dd');

        // Build the query
        let query = supabase
          .from('subscription_renewals')
          .select('*', { count: 'exact' })
          .gte('created_at', fromDate)
          .lte('created_at', toDate)
          .order('created_at', { ascending: false });

        // Apply filters
        if (filters.plan && filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        if (filters.status && filters.status !== 'all') {
          query = query.eq('subscription_status', filters.status);
        }

        // Apply search term
        if (searchTerm) {
          query = query.or(`customer_email.ilike.%${searchTerm}%,plan.ilike.%${searchTerm}%,subscription_id.ilike.%${searchTerm}%`);
        }

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error: queryError } = await query;

        if (queryError) {
          throw queryError;
        }

        // Check if request was aborted
        if (abortController.signal.aborted || requestIdRef.current !== requestId) {
          return;
        }

        const formattedRenewals: SubscriptionRenewal[] = (data || []).map(renewal => ({
          id: renewal.id,
          subscription_id: renewal.subscription_id,
          customer_id: renewal.customer_id,
          customer_email: renewal.customer_email,
          customer_name: renewal.customer_name,
          plan: renewal.plan,
          amount: Number(renewal.amount),
          currency: renewal.currency,
          frequency: renewal.frequency,
          subscription_status: renewal.subscription_status,
          created_at: renewal.created_at,
          updated_at: renewal.updated_at,
          canceled_at: renewal.canceled_at,
          subscription_number: renewal.subscription_number
        }));

        setRenewals(formattedRenewals);
        setTotalCount(count || 0);
        console.log('✅ [SUBSCRIPTION RENEWALS] Renewals loaded:', formattedRenewals.length, 'total:', count);

      } catch (error: any) {
        // Ignore aborted requests
        if (error.name === 'AbortError') {
          console.log('📊 [SUBSCRIPTION RENEWALS] Request aborted', { requestId: requestIdRef.current });
          return;
        }

        console.error('❌ [SUBSCRIPTION RENEWALS] Error fetching renewals:', error);
        setError(error instanceof Error ? error.message : 'Erro desconhecido');
        setRenewals([]);
        setTotalCount(0);
      } finally {
        // Only set loading to false if this is still the current request
        if (requestIdRef.current === requestIdRef.current) {
          setLoading(false);
        }
      }
    };

    // Debounce requests to prevent excessive API calls
    const timeoutId = setTimeout(() => {
      fetchRenewals();
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [dateRange, filters, page, pageSize, searchTerm]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return { renewals, loading, totalCount, error };
};
