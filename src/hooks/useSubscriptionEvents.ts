
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { formatInTimeZone } from 'date-fns-tz';

interface SubscriptionEvent {
  id: string;
  subscription_id: string;
  event_type: string;
  amount: number;
  plan: string;
  event_date: string;
  customer_id: string;
  customer_email: string;
  customer_name: string | null;
  currency: string;
  frequency: string | null;
  payment_method?: string;
  subscription_number: number | null;
}

interface UseSubscriptionEventsParams {
  dateRange: { from: Date; to: Date };
  filters: { plan: string; eventType: string; paymentMethod: string };
  page: number;
  pageSize: number;
}

const TIMEZONE = 'America/Sao_Paulo';

export const useSubscriptionEvents = (
  dateRange: UseSubscriptionEventsParams['dateRange'],
  filters: UseSubscriptionEventsParams['filters'],
  page: UseSubscriptionEventsParams['page'],
  pageSize: UseSubscriptionEventsParams['pageSize']
) => {
  const [events, setEvents] = useState<SubscriptionEvent[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        console.log('📊 [SUBSCRIPTION EVENTS] Fetching events with filters:', filters, 'page:', page);

        const fromDate = formatInTimeZone(dateRange.from, TIMEZONE, 'yyyy-MM-dd');
        const toDate = formatInTimeZone(dateRange.to, TIMEZONE, 'yyyy-MM-dd');

        // Build the query
        let query = supabase
          .from('subscription_events')
          .select('*', { count: 'exact' })
          .gte('event_date', fromDate)
          .lte('event_date', toDate)
          .order('event_date', { ascending: false });

        // Apply filters
        if (filters.plan && filters.plan !== 'all') {
          query = query.eq('plan', filters.plan);
        }

        if (filters.eventType && filters.eventType !== 'all') {
          query = query.eq('event_type', filters.eventType);
        }

        if (filters.paymentMethod && filters.paymentMethod !== 'all') {
          query = query.eq('payment_method', filters.paymentMethod);
        }

        // Apply pagination
        const from = (page - 1) * pageSize;
        const to = from + pageSize - 1;
        query = query.range(from, to);

        const { data, count, error } = await query;

        if (error) {
          throw error;
        }

        const formattedEvents: SubscriptionEvent[] = (data || []).map(event => ({
          id: event.id,
          subscription_id: event.subscription_id,
          event_type: event.event_type,
          amount: Number(event.amount),
          plan: event.plan,
          event_date: event.event_date,
          customer_id: event.customer_id,
          customer_email: event.customer_email,
          customer_name: event.customer_name,
          currency: event.currency,
          frequency: event.frequency,
          payment_method: event.payment_method,
          subscription_number: event.subscription_number
        }));

        setEvents(formattedEvents);
        setTotalCount(count || 0);
        console.log('✅ [SUBSCRIPTION EVENTS] Events loaded:', formattedEvents.length, 'total:', count);

      } catch (error) {
        console.error('❌ [SUBSCRIPTION EVENTS] Error fetching events:', error);
        setEvents([]);
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [dateRange, filters, page, pageSize]);

  return { events, totalCount, loading };
};
