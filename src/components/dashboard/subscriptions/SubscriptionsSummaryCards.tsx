
import React from 'react';
import { TrendingUp, Users, DollarSign, XCircle } from "lucide-react";
import { useSubscriptionMetrics } from "@/hooks/useSubscriptionMetrics";
import { MetricsCard } from "@/components/dashboard/MetricsCard";
import { formatCurrency, formatNumber, formatGrowth } from "@/lib/formatters";

interface SubscriptionsSummaryCardsProps {
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: {
    plan: string;
    eventType: string;
    paymentMethod: string;
  };
}

export const SubscriptionsSummaryCards: React.FC<SubscriptionsSummaryCardsProps> = ({
  dateRange,
  filters
}) => {
  const { metrics, loading } = useSubscriptionMetrics(dateRange, filters);

  // Debug log for the component
  console.log('🎯 [SUMMARY CARDS] Rendering with metrics:', {
    loading,
    cancellations: metrics.cancellations,
    allMetrics: metrics
  });

  const cards = [
    {
      title: "Assinaturas Ativas",
      value: loading ? "..." : formatNumber(metrics.activeSubscriptions),
      change: loading ? "..." : formatGrowth(metrics.activeSubscriptionsGrowth),
      icon: Users,
      variant: 'purple' as const
    },
    {
      title: "Novas Assinaturas",
      value: loading ? "..." : formatNumber(metrics.newSubscriptions),
      change: loading ? "..." : formatGrowth(metrics.newSubscriptionsGrowth),
      icon: TrendingUp,
      variant: 'success' as const
    },
    {
      title: "MRR",
      value: loading ? "..." : formatCurrency(metrics.mrr),
      change: loading ? "..." : formatGrowth(metrics.mrrGrowth),
      icon: DollarSign,
      variant: 'black' as const
    },
    {
      title: "Cancelamentos",
      value: loading ? "..." : formatNumber(metrics.cancellations),
      change: loading ? "..." : formatGrowth(metrics.cancellationsGrowth),
      icon: XCircle,
      variant: 'warning' as const
    }
  ];

  // Debug specific cancellation card
  const cancellationCard = cards.find(card => card.title === "Cancelamento");
  console.log('🎯 [SUMMARY CARDS] Cancelamento card data:', cancellationCard);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {cards.map((card, index) => (
        <MetricsCard
          key={index}
          title={card.title}
          value={card.value}
          change={card.change}
          icon={card.icon}
          variant={card.variant}
        />
      ))}
    </div>
  );
};
