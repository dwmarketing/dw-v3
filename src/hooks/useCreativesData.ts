import { useState, useEffect } from 'react';

export interface CreativeMetrics {
  id: string;
  creative_name: string;
  campaign_name: string;
  start_date: string;
  end_date: string;
  amount_spent: number;
  views_3s: number;
  views_75_percent: number;
  views_total: number;
  clicks: number;
  pr_hook_rate: number;
  hook_rate: number;
  body_rate: number;
  cta_rate: number;
  ctr: number;
  conv_body_rate: number;
  sales_count: number;
  gross_sales: number;
  profit: number;
  cpa: number;
  roi: number;
  status: string;
  products: string[];
  tags: string[];
}

export const useCreativesData = (
  dateRange: { from: Date; to: Date },
  creativesFilter: string[],
  statusFilter: string
) => {
  const [creatives, setCreatives] = useState<CreativeMetrics[]>([]);
  const [loading, setLoading] = useState(true);

  const totalMetrics = {
    spent: 0,
    revenue: 0,
    orders: 0,
    profit: 0,
  };

  const avgROI = 0;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Note: Database tables do not exist yet
        // Using empty placeholder data
        await new Promise(resolve => setTimeout(resolve, 500));
        setCreatives([]);
      } catch (error) {
        console.error('Error fetching creatives data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, creativesFilter, statusFilter]);

  return {
    creatives,
    loading,
    totalMetrics,
    avgROI,
  };
};