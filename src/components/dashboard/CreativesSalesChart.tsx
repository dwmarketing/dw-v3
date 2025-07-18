
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PermissionWrapper } from "@/components/common/PermissionWrapper";

interface CreativeSalesData {
  creative_name: string;
  total_sales: number;
  total_revenue: number;
}

interface CreativesSalesChartProps {
  creativesData: CreativeSalesData[];
}

export const CreativesSalesChart: React.FC<CreativesSalesChartProps> = ({ creativesData }) => {
  // Sort by revenue (total_revenue) and take top 10
  const topCreatives = creativesData
    .sort((a, b) => b.total_revenue - a.total_revenue)
    .slice(0, 10)
    .map(creative => ({
      name: creative.creative_name.length > 15 
        ? creative.creative_name.substring(0, 15) + '...' 
        : creative.creative_name,
      sales: creative.total_sales,
      revenue: creative.total_revenue,
    }));

  return (
    <PermissionWrapper requirePage="sales">
      <Card className="bg-slate-800 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Vendas por Criativos</CardTitle>
          <CardDescription className="text-slate-400">
            Top 10 criativos com maior volume de vendas (baseado em receita líquida)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={topCreatives}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="name" 
                stroke="#94a3b8"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#94a3b8"
                fontSize={12}
                tickFormatter={(value) => value.toLocaleString('pt-BR')}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any, name: string) => [
                  name === 'sales' ? value.toLocaleString('pt-BR') : `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  name === 'sales' ? 'Vendas' : 'Receita Líquida'
                ]}
              />
              <Bar dataKey="sales" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </PermissionWrapper>
  );
};
