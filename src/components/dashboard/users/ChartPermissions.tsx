import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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

const chartLabels: Record<ChartType, string> = {
  kpi_total_investido: 'KPI - Total Investido',
  kpi_receita: 'KPI - Receita',
  kpi_ticket_medio: 'KPI - Ticket Médio',
  kpi_total_pedidos: 'KPI - Total de Pedidos',
  creative_performance_chart: 'Gráfico de Performance Criativa',
  creative_sales_chart: 'Gráfico de Vendas Criativas',
  sales_summary_cards: 'Cards Resumo de Vendas',
  sales_chart: 'Gráfico de Vendas',
  country_sales_chart: 'Gráfico de Vendas por País',
  state_sales_chart: 'Gráfico de Vendas por Estado',
  affiliate_chart: 'Gráfico de Afiliados',
  subscription_renewals_chart: 'Gráfico de Renovações',
  subscription_status_chart: 'Gráfico de Status de Assinaturas',
  new_subscribers_chart: 'Gráfico de Novos Assinantes'
};

interface ChartPermissionsProps {
  userId: string;
}

export const ChartPermissions: React.FC<ChartPermissionsProps> = ({ userId }) => {
  const [permissions, setPermissions] = useState<Record<ChartType, boolean>>({} as Record<ChartType, boolean>);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChartPermissions();
  }, [userId]);

  const fetchChartPermissions = async () => {
    try {
      const { data, error } = await supabase
        .from('user_chart_permissions')
        .select('chart_type, can_access')
        .eq('user_id', userId);

      if (error) throw error;

      const permissionsMap: Record<ChartType, boolean> = {} as Record<ChartType, boolean>;
      data?.forEach(permission => {
        permissionsMap[permission.chart_type as ChartType] = permission.can_access;
      });

      setPermissions(permissionsMap);
    } catch (error) {
      console.error('Error fetching chart permissions:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as permissões de gráficos.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateChartPermission = async (chartType: ChartType, canAccess: boolean) => {
    try {
      const { error } = await supabase
        .from('user_chart_permissions')
        .upsert({
          user_id: userId,
          chart_type: chartType,
          can_access: canAccess
        }, {
          onConflict: 'user_id,chart_type'
        });

      if (error) throw error;

      setPermissions(prev => ({
        ...prev,
        [chartType]: canAccess
      }));

      toast({
        title: "Sucesso",
        description: `Permissão ${canAccess ? 'concedida' : 'removida'} para ${chartLabels[chartType]}.`,
      });
    } catch (error) {
      console.error('Error updating chart permission:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar a permissão.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div>Carregando permissões de gráficos...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permissões de Gráficos</CardTitle>
        <CardDescription>
          Configure quais gráficos e cards este usuário pode visualizar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {Object.entries(chartLabels).map(([chartType, label]) => (
          <div key={chartType} className="flex items-center justify-between">
            <Label htmlFor={`chart-${chartType}`} className="flex-1">
              {label}
            </Label>
            <Switch
              id={`chart-${chartType}`}
              checked={permissions[chartType as ChartType] || false}
              onCheckedChange={(checked) => 
                updateChartPermission(chartType as ChartType, checked)
              }
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};