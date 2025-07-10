import React from 'react';
import { DollarSign, TrendingUp, Target, ShoppingCart } from "lucide-react";
import { KPICard } from "./KPICard";
import { ChartPermissionWrapper } from "@/components/common/ChartPermissionWrapper";

interface MonthlyKPIs {
  totalSpent: number;
  totalRevenue: number;
  totalOrders: number;
  avgROI: number;
  avgTicket: number;
}

interface KPICardsWithPermissionsProps {
  kpis: MonthlyKPIs;
  loading: boolean;
}

export const KPICardsWithPermissions: React.FC<KPICardsWithPermissionsProps> = ({
  kpis,
  loading
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
      {/* Card de Total Investido - permissão granular */}
      <ChartPermissionWrapper requireChart="kpi_total_investido">
        <KPICard 
          title="Total Investido" 
          value={loading ? "Carregando..." : `R$ ${kpis.totalSpent.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}`} 
          change={loading ? "..." : "+12.5%"} 
          icon={DollarSign} 
          trend="up" 
          variant="black" 
        />
      </ChartPermissionWrapper>

      {/* Card de Receita - permissão granular */}
      <ChartPermissionWrapper requireChart="kpi_receita">
        <KPICard 
          title="Receita" 
          value={loading ? "Carregando..." : `R$ ${kpis.totalRevenue.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}`} 
          change={loading ? "..." : "+23.8%"} 
          icon={TrendingUp} 
          trend="up" 
          variant="success" 
        />
      </ChartPermissionWrapper>

      {/* Card de Ticket Médio - permissão granular */}
      <ChartPermissionWrapper requireChart="kpi_ticket_medio">
        <KPICard 
          title="Ticket Médio" 
          value={loading ? "Carregando..." : `R$ ${kpis.avgTicket.toLocaleString('pt-BR', {
            minimumFractionDigits: 2
          })}`} 
          change={loading ? "..." : "+8.3%"} 
          icon={Target} 
          trend="up" 
          variant="info" 
        />
      </ChartPermissionWrapper>

      {/* Card de Total de Pedidos - permissão granular */}
      <ChartPermissionWrapper requireChart="kpi_total_pedidos">
        <KPICard 
          title="Total de Pedidos" 
          value={loading ? "Carregando..." : kpis.totalOrders.toLocaleString()} 
          change={loading ? "..." : "+15.6%"} 
          icon={ShoppingCart} 
          trend="up" 
          variant="purple" 
        />
      </ChartPermissionWrapper>
    </div>
  );
};