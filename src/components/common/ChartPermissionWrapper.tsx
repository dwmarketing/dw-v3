import React from 'react';
import { useChartPermissions } from '@/hooks/useChartPermissions';

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

interface ChartPermissionWrapperProps {
  children: React.ReactNode;
  requireChart: ChartType;
  fallback?: React.ReactNode;
}

export const ChartPermissionWrapper: React.FC<ChartPermissionWrapperProps> = ({
  children,
  requireChart,
  fallback = null
}) => {
  const { hasChartPermission, loading } = useChartPermissions();

  if (loading) {
    return fallback;
  }

  if (!hasChartPermission(requireChart)) {
    return fallback;
  }

  return <>{children}</>;
};