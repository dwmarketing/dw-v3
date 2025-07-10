import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

type ChartType = 
  | 'kpi_total_investido'
  | 'kpi_receita' 
  | 'kpi_ticket_medio'
  | 'kpi_total_pedidos'
  | 'creative_performance_chart'
  | 'creative_sales_chart'
  | 'sales_summary_cards'
  | 'sales_chart'
  | 'country_sales_chart'
  | 'state_sales_chart'
  | 'affiliate_chart'
  | 'subscription_renewals_chart'
  | 'subscription_status_chart'
  | 'new_subscribers_chart';

export const useChartPermissions = () => {
  const { user } = useAuth();
  const [chartPermissions, setChartPermissions] = useState<Record<ChartType, boolean>>({} as Record<ChartType, boolean>);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartPermissions = async () => {
      if (!user) {
        setChartPermissions({} as Record<ChartType, boolean>);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_chart_permissions')
          .select('chart_type, can_access')
          .eq('user_id', user.id);

        if (error) throw error;

        const permissionsMap: Record<ChartType, boolean> = {} as Record<ChartType, boolean>;
        data?.forEach(permission => {
          permissionsMap[permission.chart_type as ChartType] = permission.can_access;
        });

        setChartPermissions(permissionsMap);
      } catch (error) {
        console.error('Error loading chart permissions:', error);
        setChartPermissions({} as Record<ChartType, boolean>);
      } finally {
        setLoading(false);
      }
    };

    fetchChartPermissions();
  }, [user]);

  const hasChartPermission = (chartType: ChartType): boolean => {
    return chartPermissions[chartType] === true;
  };

  return {
    chartPermissions,
    loading,
    hasChartPermission
  };
};