
import React, { useState } from 'react';
import { CreativesFilters } from "./creatives/CreativesFilters";
import { CreativesTable } from "./creatives/CreativesTable";
import { ImprovedMetricsOverviewCharts } from "./creatives/ImprovedMetricsOverviewCharts";
import { CreativesSummaryCards } from "./creatives/CreativesSummaryCards";
import { TimeSeriesChart } from "./creatives/TimeSeriesChart";
import { CreativesMetricsCards } from "./creatives/CreativesMetricsCards";
import { CreativesAggregatedChart } from "./creatives/CreativesAggregatedChart";
import { useCreativesData } from "@/hooks/useCreativesData";

interface CreativesTabProps {
  dateRange: { from: Date; to: Date };
  globalKPIs: {
    totalSpent: number;
    totalRevenue: number;
    totalOrders: number;
    avgROI: number;
  };
  globalKPIsLoading: boolean;
}

export const CreativesTab: React.FC<CreativesTabProps> = ({ 
  dateRange, 
  globalKPIs, 
  globalKPIsLoading 
}) => {
  const [creativesFilter, setCreativesFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  
  const { 
    creatives, 
    loading, 
    totalMetrics, 
    avgROI 
  } = useCreativesData(dateRange, creativesFilter, statusFilter);

  // Mock CSV export function
  const handleExportCSV = () => {
    console.log('Exporting CSV...');
  };

  return (
    <div className="space-y-6 bg-slate-900">
      {/* Data Quality Notice */}
      <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
        <h3 className="text-blue-400 font-medium mb-2">📊 Melhorias Implementadas na Visualização de Dados</h3>
        <div className="text-blue-300 text-sm space-y-1">
          <p>✅ Padronização de nomes de criativos entre insights e vendas</p>
          <p>✅ Agregação correta de dados para criativos com nomes similares</p>
          <p>✅ Indicadores claros sobre estimativas temporais</p>
          <p>✅ Novos gráficos de comparação entre criativos</p>
        </div>
      </div>

      <CreativesMetricsCards 
        totalSpent={totalMetrics.spent}
        avgROI={globalKPIs.avgROI}
        loading={globalKPIsLoading}
      />
      
      <ImprovedMetricsOverviewCharts 
        creatives={creatives} 
        dateRange={dateRange}
      />
      
      <CreativesAggregatedChart 
        creatives={creatives}
      />
      
      <TimeSeriesChart 
        creatives={creatives}
        dateRange={dateRange}
      />
      
      <CreativesTable 
        creatives={creatives}
        loading={loading}
        filteredCreatives={creatives}
        onExportCSV={handleExportCSV}
      />
    </div>
  );
};
