
import React, { useState, useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';

interface ProductFilterProps {
  selectedProduct: string;
  onProductChange: (product: string) => void;
}

export const ProductFilter: React.FC<ProductFilterProps> = ({
  selectedProduct,
  onProductChange
}) => {
  const [products, setProducts] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Note: Database tables for subscriptions do not exist yet
        // Using placeholder data for now
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const allPlans = new Set<string>();
        // Add some placeholder plans
        allPlans.add('Basic Plan');
        allPlans.add('Premium Plan');
        allPlans.add('Enterprise Plan');

        const uniquePlans = Array.from(allPlans).sort();
        setProducts(uniquePlans);

      } catch (error) {
        console.error('Error fetching subscription plans:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-300 text-sm font-medium">Filtrar por Plano:</span>
      <Select
        value={selectedProduct}
        onValueChange={onProductChange}
        disabled={loading}
      >
        <SelectTrigger className="w-60 bg-slate-800 border-slate-700 text-white">
          <SelectValue placeholder={loading ? "Carregando..." : "Selecione um plano"} />
        </SelectTrigger>
        <SelectContent className="bg-slate-800 border-slate-700 max-h-60">
          <SelectItem value="all">Todos os Planos</SelectItem>
          {products.map((product) => (
            <SelectItem key={product} value={product}>
              {product}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
