import React from 'react';
import { DollarSign, TrendingUp, Target, ShoppingCart } from "lucide-react";
import { KPICard } from "./KPICard";
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

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
      {/* Card de Total Investido - visível para usuários com permissão "creatives" */}
      <PermissionWrapper requirePage="creatives">
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
      </PermissionWrapper>

      {/* Card de Receita - visível para usuários com permissão "sales" */}
      <PermissionWrapper requirePage="sales">
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
      </PermissionWrapper>

      {/* Card de Ticket Médio - visível para usuários com permissão "sales" */}
      <PermissionWrapper requirePage="sales">
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
      </PermissionWrapper>

      {/* Card de Total de Pedidos - visível para usuários com permissão "sales" */}
      <PermissionWrapper requirePage="sales">
        <KPICard 
          title="Total de Pedidos" 
          value={loading ? "Carregando..." : kpis.totalOrders.toLocaleString()} 
          change={loading ? "..." : "+15.6%"} 
          icon={ShoppingCart} 
          trend="up" 
          variant="purple" 
        />
      </PermissionWrapper>
    </div>
  );
};