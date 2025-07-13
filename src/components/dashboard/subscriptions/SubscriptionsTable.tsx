
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SubscriptionsTableFilters } from './SubscriptionsTableFilters';
import { SubscriptionsPagination } from './SubscriptionsPagination';
import { useSubscriptionsTableData } from '@/hooks/useSubscriptionsTableData';
import { formatCurrency, formatDate, formatCustomerInfo, formatSubscriptionStatus, formatSubscriptionNumber } from "@/lib/formatters";

interface SubscriptionsTableProps {
  dateRange: { from: Date; to: Date };
  filters: { plan: string; eventType: string; paymentMethod: string; status: string };
  searchTerm?: string;
}

export const SubscriptionsTable: React.FC<SubscriptionsTableProps> = ({
  dateRange,
  filters,
  searchTerm = ''
}) => {
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const { subscriptions, loading, totalCount, exportToCSV } = useSubscriptionsTableData(
    dateRange,
    statusFilter,
    currentPage,
    pageSize
  );

  const getStatusBadgeVariant = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('ativo') || normalizedStatus.includes('active')) {
      return 'default';
    }
    if (normalizedStatus.includes('cancel')) {
      return 'destructive';
    }
    return 'outline';
  };

  const getStatusLabel = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    if (normalizedStatus.includes('ativo') || normalizedStatus.includes('active')) {
      return 'Ativo';
    }
    if (normalizedStatus.includes('cancel')) {
      return 'Cancelado';
    }
    return status;
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Assinaturas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-slate-700" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white">
          Assinaturas ({totalCount})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <SubscriptionsTableFilters
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          onExportCSV={exportToCSV}
        />

        {subscriptions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400">Nenhuma assinatura encontrada para os filtros selecionados.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Cliente</TableHead>
                    <TableHead className="text-slate-300">Plano</TableHead>
                    <TableHead className="text-slate-300">Valor</TableHead>
                    <TableHead className="text-slate-300">Data</TableHead>
                    <TableHead className="text-slate-300">Status</TableHead>
                    <TableHead className="text-slate-300">Número</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.map((subscription) => {
                    const customer = formatCustomerInfo(subscription.customer_name, subscription.customer_email);
                    const statusLabel = formatSubscriptionStatus(subscription.subscription_status);
                    
                    return (
                      <TableRow key={subscription.id} className="border-slate-700 hover:bg-slate-800/50">
                        <TableCell>
                          <div className="text-white">
                            <div className="font-medium">
                              {customer.name}
                            </div>
                            <div className="text-sm text-slate-400">
                              {customer.email}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-slate-300 border-slate-600">
                            {subscription.plan}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-white font-medium">
                          {formatCurrency(subscription.amount)}
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formatDate(subscription.created_at, 'dateTime')}
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(subscription.subscription_status)}>
                            {statusLabel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {formatSubscriptionNumber(subscription.subscription_number)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>

            <SubscriptionsPagination
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={setCurrentPage}
              onPageSizeChange={handlePageSizeChange}
            />
          </>
        )}
      </CardContent>
    </Card>
  );
};
