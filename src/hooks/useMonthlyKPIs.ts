
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDateRangeForQuery } from '@/lib/dateUtils';

interface MonthlyKPIs {
  totalSpent: number;
  totalRevenue: number;
  totalOrders: number;
  avgROI: number;
  avgTicket: number;
}

export const useMonthlyKPIs = (dateRange: { from: Date; to: Date }) => {
  const [kpis, setKpis] = useState<MonthlyKPIs>({
    totalSpent: 0,
    totalRevenue: 0,
    totalOrders: 0,
    avgROI: 0,
    avgTicket: 0
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMonthlyKPIs = async () => {
    try {
      setLoading(true);
      
      // Placeholder implementation - replace with actual data sources
      // Using mock data for now until proper tables are created
      const totalSpent = 15000;
      const totalRevenue = 45000;
      const totalOrders = 120;
      const avgTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      const avgROI = totalSpent > 0 ? Number(((totalRevenue - totalSpent) / totalSpent).toFixed(2)) : 0;

      setKpis({
        totalSpent,
        totalRevenue,
        totalOrders,
        avgROI,
        avgTicket
      });
    } catch (error) {
      console.error('Error fetching monthly KPIs:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as métricas mensais.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonthlyKPIs();
  }, [dateRange]);

  return { kpis, loading, refetch: fetchMonthlyKPIs };
};
