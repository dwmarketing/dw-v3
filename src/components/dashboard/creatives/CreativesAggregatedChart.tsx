import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

interface CreativeData {
  creative_name: string;
  amount_spent: number;
  sales_count: number;
  roi: number;
  profit: number;
  gross_sales: number;
  views_3s: number;
  ctr: number;
  conv_body_rate: number;
  pr_hook_rate: number;
  hook_rate: number;
  body_rate: number;
}

interface CreativesAggregatedChartProps {
  creatives: CreativeData[];
}

const metricOptions = [
  { value: 'amount_spent', label: 'Valor Gasto Total', color: '#ef4444' },
  { value: 'gross_sales', label: 'Receita Bruta Total', color: '#22c55e' },
  { value: 'profit', label: 'Lucro Total', color: '#3b82f6' },
  { value: 'roi', label: 'ROI Médio', color: '#8b5cf6' },
  { value: 'sales_count', label: 'Total de Vendas', color: '#f59e0b' },
];

export const CreativesAggregatedChart: React.FC<CreativesAggregatedChartProps> = ({ creatives }) => {
  const [selectedMetric, setSelectedMetric] = React.useState('amount_spent');
  
  // Sort creatives by selected metric and take top 10
  const sortedCreatives = React.useMemo(() => {
    const sorted = [...creatives].sort((a, b) => {
      if (selectedMetric === 'profit') {
        return Math.abs(b.profit) - Math.abs(a.profit);
      }
      return (b as any)[selectedMetric] - (a as any)[selectedMetric];
    });
    
    return sorted.slice(0, 10);
  }, [creatives, selectedMetric]);

  const currentMetric = metricOptions.find(m => m.value === selectedMetric) || metricOptions[0];

  const formatValue = (value: number) => {
    if (selectedMetric === 'roi') {
      return value.toFixed(1) + '%';
    }
    if (selectedMetric.includes('spent') || selectedMetric.includes('sales') || selectedMetric === 'profit') {
      const prefix = value < 0 ? '-R$ ' : 'R$ ';
      return `${prefix}${Math.abs(value).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
    }
    return value.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
  };

  const chartData = sortedCreatives.map(creative => ({
    name: creative.creative_name.length > 15 
      ? creative.creative_name.substring(0, 15) + '...' 
      : creative.creative_name,
    fullName: creative.creative_name,
    value: (creative as any)[selectedMetric] || 0
  }));

  return (
    <PermissionWrapper requirePage="creatives">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-white text-xl">Comparação por Criativos - Totais do Período</CardTitle>
              <CardTitle className="text-slate-400 text-sm font-normal">
                Top 10 criativos com melhores resultados na métrica selecionada
              </CardTitle>
            </div>
            <Select value={selectedMetric} onValueChange={setSelectedMetric}>
              <SelectTrigger className="w-full lg:w-[200px] bg-slate-900/50 border-slate-600 text-white">
                <SelectValue placeholder="Selecionar métrica" />
              </SelectTrigger>
              <SelectContent className="bg-slate-900 border-slate-700">
                {metricOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        
        <CardContent>
          <div style={{ height: 500 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 40, bottom: 100 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="name"
                  stroke="#9ca3af"
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={120}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                  tickFormatter={formatValue}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value: any, name: string, props: any) => [
                    formatValue(value),
                    currentMetric.label
                  ]}
                  labelFormatter={(label, payload) => 
                    payload && payload[0] ? `${payload[0].payload.fullName}` : label
                  }
                />
                <Bar 
                  dataKey="value" 
                  fill={currentMetric.color}
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {chartData.length === 0 && (
            <div className="flex items-center justify-center h-64">
              <p className="text-slate-400 text-center">
                Nenhum dado disponível para exibir.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </PermissionWrapper>
  );
};