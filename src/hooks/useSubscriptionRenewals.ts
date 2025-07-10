
import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, endOfDay } from 'date-fns';

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
        console.log('📊 Fetching subscription renewals...', { requestId });

        const startDate = startOfDay(dateRange.from);
        const endDate = endOfDay(dateRange.to);
        const startDateStr = format(startDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        // Placeholder implementation - replace with actual data source
        setRenewals([]);
        setTotalCount(0);
        return;



      } catch (error: any) {
        // Ignore aborted requests
        if (error.name === 'AbortError') {
          console.log('📊 Request aborted', { requestId: requestIdRef.current });
          return;
        }

        console.error('❌ Error fetching subscription renewals:', error);
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
