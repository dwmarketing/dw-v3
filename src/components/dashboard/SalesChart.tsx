import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, parseISO, eachDayOfInterval, eachMonthOfInterval, startOfMonth, endOfMonth, isSameDay, startOfYear, endOfYear, startOfDay, endOfDay, eachHourOfInterval, startOfHour } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';
import { supabase } from "@/integrations/supabase/client";

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

interface Sale {
  id: string;
  gross_value: number;
  net_value: number;
  status: string;
  payment_method: string;
  sale_date: string;
}

interface SalesChartProps {
  sales?: Sale[];
  dateRange: { from: Date; to: Date };
}

export const SalesChart: React.FC<SalesChartProps> = ({ dateRange }) => {
  const [salesData, setSalesData] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch sales data based on date range
  useEffect(() => {
    const fetchSalesData = async () => {
      if (!dateRange?.from || !dateRange?.to) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log('📊 [SALES CHART] Fetching sales data for range:', dateRange);

        // Convert to Brazil timezone for accurate filtering
        const startDate = toZonedTime(startOfDay(dateRange.from), BRAZIL_TIMEZONE);
        const endDate = toZonedTime(endOfDay(dateRange.to), BRAZIL_TIMEZONE);
        
        // Convert back to UTC for database query
        const startDateUTC = fromZonedTime(startDate, BRAZIL_TIMEZONE);
        const endDateUTC = fromZonedTime(endDate, BRAZIL_TIMEZONE);
        
        const startDateStr = format(startDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        const endDateStr = format(endDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

        console.log('📊 [SALES CHART] Querying with dates:', { startDateStr, endDateStr });

        const { data, error } = await supabase
          .from('creative_sales')
          .select('id, gross_value, net_value, status, payment_method, sale_date')
          .gte('sale_date', startDateStr)
          .lte('sale_date', endDateStr)
          .order('sale_date', { ascending: true });

        if (error) {
          console.error('❌ [SALES CHART] Error fetching sales:', error);
          setSalesData([]);
          return;
        }

        console.log('📊 [SALES CHART] Fetched sales:', data?.length || 0, 'records');
        setSalesData(data || []);

      } catch (error) {
        console.error('❌ [SALES CHART] Error in fetchSalesData:', error);
        setSalesData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [dateRange?.from?.getTime(), dateRange?.to?.getTime()]);

  // Determine the chart period based on date range
  const getChartPeriod = () => {
    if (!dateRange?.from || !dateRange?.to) return 'daily';
    
    const daysDiff = Math.ceil((dateRange.to.getTime() - dateRange.from.getTime()) / (1000 * 60 * 60 * 24));
    
    // If it's exactly 1 day (today or yesterday)
    if (daysDiff <= 1) {
      return 'single-day';
    }
    // If it's exactly 7 days (this week)
    else if (daysDiff === 6 || daysDiff === 7) {
      return 'weekly';
    }
    // If it's a year range (more than 300 days)
    else if (daysDiff > 300) {
      return 'yearly';
    }
    // Default to daily for other ranges
    else {
      return 'daily';
    }
  };

  const chartPeriod = getChartPeriod();
  const sales = salesData;

  // Prepare revenue data based on the period with Brazil timezone
  const prepareRevenueData = () => {
    const validSales = sales.filter(sale => sale.status === 'completed' || sale.status === 'Unfulfilled');
    
    if (chartPeriod === 'single-day') {
      // For single day, show hourly breakdown for the specific selected day
      const hourlyRevenue: Record<string, number> = {};
      
      // Initialize all hours for the selected day
      for (let hour = 0; hour < 24; hour++) {
        const hourStr = hour.toString().padStart(2, '0') + ':00';
        hourlyRevenue[hourStr] = 0;
      }
      
      // Filter sales for the specific selected day and aggregate by hour
      const targetDate = dateRange?.from || new Date();
      const dayStart = startOfDay(targetDate);
      const dayEnd = endOfDay(targetDate);
      
      validSales.forEach(sale => {
        try {
          // Parse UTC date and convert to Brazil timezone
          const saleDateUTC = parseISO(sale.sale_date);
          const saleDateBrazil = toZonedTime(saleDateUTC, BRAZIL_TIMEZONE);
          
          // Only include sales from the specific selected day in Brazil timezone
          if (saleDateBrazil >= dayStart && saleDateBrazil <= dayEnd) {
            const hour = format(saleDateBrazil, 'HH:00');
            hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + (sale.net_value || 0);
          }
        } catch (error) {
          console.warn('📊 Error parsing sale date:', sale.sale_date, error);
        }
      });

      return Object.entries(hourlyRevenue)
        .map(([hour, revenue]) => ({ date: hour, revenue }))
        .sort((a, b) => a.date.localeCompare(b.date));
    }
    
    else if (chartPeriod === 'weekly' && dateRange) {
      // For weekly, show each day of the week in Brazil timezone
      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      
      return days.map(day => {
        const dayRevenue = validSales
          .filter(sale => {
            try {
              const saleDateUTC = parseISO(sale.sale_date);
              const saleDateBrazil = toZonedTime(saleDateUTC, BRAZIL_TIMEZONE);
              return isSameDay(saleDateBrazil, day);
            } catch {
              return false;
            }
          })
          .reduce((sum, sale) => sum + (sale.net_value || 0), 0);
        
        return {
          date: format(day, 'EEE dd/MM', { locale: ptBR }),
          revenue: dayRevenue
        };
      });
    }
    
    else if (chartPeriod === 'yearly' && dateRange) {
      // For yearly, show each month in Brazil timezone
      const yearStart = startOfYear(dateRange.from);
      const yearEnd = endOfYear(dateRange.to);
      const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
      
      return months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const monthRevenue = validSales
          .filter(sale => {
            try {
              const saleDateUTC = parseISO(sale.sale_date);
              const saleDateBrazil = toZonedTime(saleDateUTC, BRAZIL_TIMEZONE);
              return saleDateBrazil >= monthStart && saleDateBrazil <= monthEnd;
            } catch {
              return false;
            }
          })
          .reduce((sum, sale) => sum + (sale.net_value || 0), 0);
        
        return {
          date: format(month, 'MMM', { locale: ptBR }),
          revenue: monthRevenue
        };
      });
    }
    
    else {
      // Default daily view with Brazil timezone
      if (!dateRange?.from || !dateRange?.to) return [];
      
      const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
      
      return days.map(day => {
        const dayRevenue = validSales
          .filter(sale => {
            try {
              const saleDateUTC = parseISO(sale.sale_date);
              const saleDateBrazil = toZonedTime(saleDateUTC, BRAZIL_TIMEZONE);
              return isSameDay(saleDateBrazil, day);
            } catch {
              return false;
            }
          })
          .reduce((sum, sale) => sum + (sale.net_value || 0), 0);
        
        return {
          date: format(day, 'dd/MM', { locale: ptBR }),
          revenue: dayRevenue
        };
      });
    }
  };

  const revenueData = prepareRevenueData();

  // Prepare sales status distribution with quantities and values
  const statusDistribution = sales.reduce((acc, sale) => {
    const status = sale.status;
    if (!acc[status]) {
      acc[status] = { count: 0, value: 0 };
    }
    acc[status].count += 1;
    // CHANGED: Use net_value instead of gross_value
    acc[status].value += (sale.net_value || 0);
    return acc;
  }, {} as Record<string, { count: number; value: number }>);

  const statusData = Object.entries(statusDistribution).map(([status, data]) => ({
    name: status === 'completed' ? 'Concluído' : 
          status === 'refunded' ? 'Reembolsado' : 
          status === 'chargeback' ? 'Chargeback' :
          status === 'Unfulfilled' ? 'Não Cumprido' : status,
    value: data.count,
    monetaryValue: data.value
  }));

  const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div 
          style={{ 
            backgroundColor: '#1e293b', 
            border: '1px solid #475569',
            borderRadius: '8px',
            padding: '8px',
            color: '#ffffff'
          }}
        >
          <p style={{ color: '#ffffff', margin: '0 0 4px 0' }}>{data.name}</p>
          <p style={{ color: '#ffffff', margin: '0 0 4px 0' }}>
            Quantidade: {data.value}
          </p>
          <p style={{ color: '#ffffff', margin: '0' }}>
            Valor: R$ {data.monetaryValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      );
    }
    return null;
  };

  // Get chart title based on period
  const getChartTitle = () => {
    switch (chartPeriod) {
      case 'single-day':
        return 'Receita por Hora';
      case 'weekly':
        return 'Receita da Semana';
      case 'yearly':
        return 'Receita por Mês';
      default:
        return 'Receita';
    }
  };

  const getChartDescription = () => {
    switch (chartPeriod) {
      case 'single-day':
        return 'Distribuição da receita ao longo do dia';
      case 'weekly':
        return 'Receita de cada dia da semana';
      case 'yearly':
        return 'Receita mensal ao longo do ano';
      default:
        return 'Evolução da receita ao longo do tempo';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">{getChartTitle()}</CardTitle>
          <CardDescription className="text-slate-400">
            {getChartDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="date" 
                stroke="#94a3b8"
                fontSize={12}
              />
              <YAxis 
                stroke="#94a3b8" 
                fontSize={12}
                tickFormatter={(value) => `R$ ${value.toLocaleString('pt-BR')}`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1e293b', 
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#fff'
                }}
                formatter={(value: any) => [`R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Receita']}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#3b82f6" 
                fill="#3b82f6"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Status das Vendas</CardTitle>
          <CardDescription className="text-slate-400">
            Distribuição por status da venda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};
