
import React, { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { SalesFilters } from "./sales/SalesFilters";
import { SalesTable } from "./sales/SalesTable";
import { SalesChart } from "./SalesChart";
import { CountrySalesChart } from "./sales/CountrySalesChart";
import { format, startOfDay, endOfDay } from "date-fns";
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

const BRAZIL_TIMEZONE = 'America/Sao_Paulo';

interface Sale {
  id: string;
  order_id: string;
  creative_name: string;
  status: string;
  payment_method: string;
  gross_value: number;
  net_value: number;
  customer_name: string;
  customer_email: string;
  affiliate_name: string;
  is_affiliate: boolean;
  affiliate_commission: number;
  sale_date: string;
  country: string;
  state: string;
}

interface SalesTabProps {
  dateRange: { from: Date; to: Date };
}

export const SalesTab: React.FC<SalesTabProps> = ({ dateRange }) => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [countryFilter, setCountryFilter] = useState("all");
  const [stateFilter, setStateFilter] = useState("all");
  const [chartCountryFilter, setChartCountryFilter] = useState("all");
  
  const { toast } = useToast();

  useEffect(() => {
    if (dateRange?.from && dateRange?.to) {
      fetchSales();
    }
  }, [dateRange?.from?.getTime(), dateRange?.to?.getTime()]);

  // Resetar filtro de estado quando o país mudar
  useEffect(() => {
    if (countryFilter === "all") {
      setStateFilter("all");
    }
  }, [countryFilter]);

  const fetchSales = async () => {
    try {
      setLoading(true);
      console.log('📊 [SALES TAB] Fetching sales data for range:', dateRange);
      
      // Convert to Brazil timezone for accurate filtering
      const startDate = toZonedTime(startOfDay(dateRange.from), BRAZIL_TIMEZONE);
      const endDate = toZonedTime(endOfDay(dateRange.to), BRAZIL_TIMEZONE);
      
      // Convert back to UTC for database query
      const startDateUTC = fromZonedTime(startDate, BRAZIL_TIMEZONE);
      const endDateUTC = fromZonedTime(endDate, BRAZIL_TIMEZONE);
      
      const startDateStr = format(startDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
      const endDateStr = format(endDateUTC, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

      console.log('📊 [SALES TAB] Querying with dates:', { startDateStr, endDateStr });

      const { data, error } = await supabase
        .from('creative_sales')
        .select(`
          id,
          order_id,
          creative_name,
          status,
          payment_method,
          gross_value,
          net_value,
          customer_name,
          customer_email,
          affiliate_name,
          is_affiliate,
          affiliate_commission,
          sale_date,
          country,
          state
        `)
        .gte('sale_date', startDateStr)
        .lte('sale_date', endDateStr)
        .order('sale_date', { ascending: false });

      if (error) {
        console.error('❌ [SALES TAB] Error fetching sales:', error);
        toast({
          title: "Erro",
          description: "Erro ao carregar dados de vendas.",
          variant: "destructive",
        });
        setSales([]);
        return;
      }

      console.log('📊 [SALES TAB] Fetched sales:', data?.length || 0, 'records');
      setSales(data || []);
      
    } catch (error) {
      console.error('❌ [SALES TAB] Error in fetchSales:', error);
      toast({
        title: "Erro",
        description: "Erro inesperado ao carregar vendas.",
        variant: "destructive",
      });
      setSales([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredSales = sales.filter(sale => {
    const matchesSearch = sale.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.creative_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         sale.customer_name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;
    const matchesPayment = paymentFilter === "all" || sale.payment_method === paymentFilter;
    const matchesCountry = countryFilter === "all" || sale.country === countryFilter;
    const matchesState = stateFilter === "all" || sale.state === stateFilter;
    return matchesSearch && matchesStatus && matchesPayment && matchesCountry && matchesState;
  });

  // Get unique countries and states for filters
  const uniqueCountries = [...new Set(sales.map(sale => sale.country).filter(Boolean))].sort();
  const uniqueStates = [...new Set(sales.map(sale => sale.state).filter(Boolean))].sort();

  // Prepare state data for StateSalesChart
  const stateData = sales.reduce((acc, sale) => {
    if (!sale.state || (chartCountryFilter !== "all" && sale.country !== chartCountryFilter)) return acc;
    
    const existing = acc.find(item => item.state === sale.state);
    if (existing) {
      existing.total_sales += 1;
      if (sale.status === 'completed' || sale.status === 'Unfulfilled') {
        existing.total_revenue += (sale.net_value || 0);
      }
    } else {
      acc.push({
        state: sale.state,
        total_sales: 1,
        total_revenue: (sale.status === 'completed' || sale.status === 'Unfulfilled') ? (sale.net_value || 0) : 0
      });
    }
    return acc;
  }, [] as Array<{ state: string; total_sales: number; total_revenue: number }>);

  // Filter state data for chart
  const filteredStateData = stateData.sort((a, b) => b.total_revenue - a.total_revenue);

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setPaymentFilter("all");
    setCountryFilter("all");
    setStateFilter("all");
  };

  const exportToCSV = () => {
    const displayedSales = filteredSales.slice(0, 20);
    const headers = ['Pedido', 'Data', 'Cliente', 'Criativo', 'Status', 'Pagamento', 'Valor Líquido', 'País', 'Estado', 'Afiliado'];
    
    const getStatusLabel = (status: string) => {
      switch (status) {
        case 'completed': return 'Concluído';
        case 'refunded': return 'Reembolsado';
        case 'chargeback': return 'Chargeback';
        case 'Unfulfilled': return 'Não Cumprido';
        default: return status;
      }
    };

    const getPaymentMethodLabel = (method: string) => {
      switch (method) {
        case 'pix': return 'PIX';
        case 'credit_card': return 'Cartão de Crédito';
        case 'boleto': return 'Boleto';
        default: return method;
      }
    };

    const formatDateForCSV = (dateStr: string) => {
      if (!dateStr) return '-';
      try {
        const date = new Date(dateStr);
        return format(date, 'dd/MM/yyyy HH:mm');
      } catch {
        return '-';
      }
    };

    const csvData = [
      headers.join(','),
      ...displayedSales.map(sale => [
        `"${sale.order_id}"`,
        formatDateForCSV(sale.sale_date),
        `"${sale.customer_name || ''}"`,
        `"${sale.creative_name || ''}"`,
        getStatusLabel(sale.status),
        getPaymentMethodLabel(sale.payment_method),
        (sale.net_value || 0).toFixed(2),
        `"${sale.country || 'Não informado'}"`,
        `"${sale.state || 'Não informado'}"`,
        sale.is_affiliate ? `"${sale.affiliate_name || 'Afiliado'}"` : '-'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `vendas_${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Charts Section */}
      <div className="space-y-6">
        {/* Revenue and Status Charts */}
        <SalesChart dateRange={dateRange} />
        
        {/* Regional Analysis Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-1 gap-6">
          <CountrySalesChart 
            sales={sales} 
            countryFilter={chartCountryFilter}
          />
        </div>
      </div>

      {/* Filters and Table Section */}
      <SalesFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        paymentFilter={paymentFilter}
        setPaymentFilter={setPaymentFilter}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        stateFilter={stateFilter}
        setStateFilter={setStateFilter}
        uniqueCountries={uniqueCountries}
        uniqueStates={uniqueStates}
        onClearFilters={handleClearFilters}
      />
      <SalesTable
        sales={sales}
        filteredSales={filteredSales}
        loading={loading}
        onExportCSV={exportToCSV}
      />
    </div>
  );
};
