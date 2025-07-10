import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { UserWithPermissions } from './types';
import type { Database } from '@/integrations/supabase/types';

type UserPage = Database['public']['Enums']['user_page'];
type AppRole = Database['public']['Enums']['app_role'];
type ChartType = Database['public']['Enums']['chart_type'];

interface UserFormProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

const PAGES: UserPage[] = [
  'creatives',
  'sales', 
  'affiliates',
  'revenue',
  'users',
  'business-managers',
  'subscriptions',
  'ai-agents',
  'performance'
];

const CHARTS: ChartType[] = [
  'kpi_total_investido',
  'kpi_receita', 
  'kpi_ticket_medio',
  'kpi_total_pedidos',
  'creative_performance_chart',
  'creative_sales_chart',
  'sales_summary_cards',
  'sales_chart',
  'country_sales_chart',
  'state_sales_chart',
  'affiliate_chart',
  'subscription_renewals_chart',
  'subscription_status_chart',
  'new_subscribers_chart'
];

const chartLabels: Record<ChartType, string> = {
  kpi_total_investido: 'KPI - Total Investido',
  kpi_receita: 'KPI - Receita',
  kpi_ticket_medio: 'KPI - Ticket Médio',
  kpi_total_pedidos: 'KPI - Total de Pedidos',
  creative_performance_chart: 'Gráfico de Performance Criativa',
  creative_sales_chart: 'Gráfico de Vendas Criativas',
  sales_summary_cards: 'Cards Resumo de Vendas',
  sales_chart: 'Gráfico de Vendas',
  country_sales_chart: 'Gráfico de Vendas por País',
  state_sales_chart: 'Gráfico de Vendas por Estado',
  affiliate_chart: 'Gráfico de Afiliados',
  subscription_renewals_chart: 'Gráfico de Renovações',
  subscription_status_chart: 'Gráfico de Status de Assinaturas',
  new_subscribers_chart: 'Gráfico de Novos Assinantes'
};

export const UserForm: React.FC<UserFormProps> = ({ 
  user, 
  isOpen, 
  onClose, 
  onUserUpdate 
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    role: 'user' as AppRole,
    permissions: {} as Record<UserPage, boolean>,
    chartPermissions: {} as Record<ChartType, boolean>
  });

  useEffect(() => {
    if (user) {
      fetchUserChartPermissions(user.id);
    }
  }, [user]);

  const fetchUserChartPermissions = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_chart_permissions')
        .select('chart_type, can_access')
        .eq('user_id', userId);

      if (error) throw error;

      const chartPermissionsMap = CHARTS.reduce((acc, chart) => {
        const permission = data?.find(p => p.chart_type === chart);
        acc[chart] = permission?.can_access || false;
        return acc;
      }, {} as Record<ChartType, boolean>);

      setFormData(prev => ({
        ...prev,
        chartPermissions: chartPermissionsMap
      }));
    } catch (error) {
      console.error('Error fetching chart permissions:', error);
    }
  };

  useEffect(() => {
    if (user) {
      // Create a complete permissions object with all pages
      const userPermissions = PAGES.reduce((acc, page) => {
        const permission = user.user_page_permissions?.find(p => p.page === page);
        acc[page] = permission?.can_access || false;
        return acc;
      }, {} as Record<UserPage, boolean>);

      setFormData({
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || '',
        role: user.role,
        permissions: userPermissions,
        chartPermissions: {} as Record<ChartType, boolean> // Will be set by fetchUserChartPermissions
      });
    } else {
      // Default permissions for new users - ensure all pages are included
      const defaultPermissions = PAGES.reduce((acc, page) => {
        acc[page] = page !== 'users'; // All pages except users
        return acc;
      }, {} as Record<UserPage, boolean>);

      // Default chart permissions for new users - all false
      const defaultChartPermissions = CHARTS.reduce((acc, chart) => {
        acc[chart] = false;
        return acc;
      }, {} as Record<ChartType, boolean>);

      setFormData({
        full_name: '',
        email: '',
        username: '',
        role: 'user',
        permissions: defaultPermissions,
        chartPermissions: defaultChartPermissions
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user) {
        // Update existing user
        const { error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            username: formData.username,
          })
          .eq('id', user.id);

        if (profileError) throw profileError;

        // Update role
        const { error: roleError } = await supabase
          .from('user_roles')
          .update({ role: formData.role })
          .eq('user_id', user.id);

        if (roleError) throw roleError;

        // Update permissions
        for (const page of PAGES) {
          const pageTyped = page as UserPage;
          const { error: permError } = await supabase
            .from('user_page_permissions')
            .update({ can_access: formData.permissions[pageTyped] })
            .eq('user_id', user.id)
            .eq('page', pageTyped);

          if (permError) throw permError;
        }

        // Update chart permissions
        for (const chart of CHARTS) {
          const chartTyped = chart as ChartType;
          const { error: chartPermError } = await supabase
            .from('user_chart_permissions')
            .upsert({
              user_id: user.id,
              chart_type: chartTyped,
              can_access: formData.chartPermissions[chartTyped]
            }, {
              onConflict: 'user_id,chart_type'
            });

          if (chartPermError) throw chartPermError;
        }

        toast({
          title: "Sucesso!",
          description: "Usuário atualizado com sucesso.",
        });
      } else {
        // Create new user via Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: formData.email,
          email_confirm: true,
          user_metadata: {
            full_name: formData.full_name,
            username: formData.username,
            role: formData.role
          }
        });

        if (authError) throw authError;

        const userId = authData.user?.id;
        if (!userId) throw new Error('Failed to create user');

        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: userId,
            full_name: formData.full_name,
            email: formData.email,
            username: formData.username,
          });

        if (profileError) throw profileError;

        // Set role
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: formData.role,
          });

        if (roleError) throw roleError;

        // Set permissions
        const permissionInserts = PAGES.map(page => ({
          user_id: userId,
          page: page as UserPage,
          can_access: formData.permissions[page as UserPage]
        }));

        const { error: permError } = await supabase
          .from('user_page_permissions')
          .insert(permissionInserts);

        if (permError) throw permError;

        // Set chart permissions
        const chartPermissionInserts = CHARTS.map(chart => ({
          user_id: userId,
          chart_type: chart as ChartType,
          can_access: formData.chartPermissions[chart as ChartType]
        }));

        const { error: chartPermError } = await supabase
          .from('user_chart_permissions')
          .insert(chartPermissionInserts);

        if (chartPermError) throw chartPermError;

        toast({
          title: "Sucesso!",
          description: "Usuário criado com sucesso.",
        });
      }

      onClose();
      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error: any) {
      toast({
        title: "Erro!",
        description: `Falha ao ${user ? 'atualizar' : 'criar'} usuário: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user ? 'Editar Usuário' : 'Criar Usuário'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              disabled={!!user} // Can't change email for existing users
              required
            />
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select value={formData.role} onValueChange={(value: AppRole) => setFormData(prev => ({ ...prev, role: value }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="business_manager">Gestor de Negócios</SelectItem>
                <SelectItem value="admin">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tabs defaultValue="pages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pages">Permissões de Página</TabsTrigger>
              <TabsTrigger value="charts">Permissões de Gráficos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pages" className="space-y-4">
              <div>
                <Label>Permissões de Página</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {PAGES.map((page) => (
                    <div key={page} className="flex items-center space-x-2">
                      <Checkbox
                        id={page}
                        checked={formData.permissions[page] || false}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              [page]: checked === true
                            }
                          }));
                        }}
                      />
                      <Label htmlFor={page} className="capitalize text-sm">
                        {page.replace('-', ' ')}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="charts" className="space-y-4">
              <div>
                <Label>Permissões de Gráficos</Label>
                <div className="grid grid-cols-1 gap-3 mt-2 max-h-60 overflow-y-auto">
                  {CHARTS.map((chart) => (
                    <div key={chart} className="flex items-center space-x-2">
                      <Checkbox
                        id={chart}
                        checked={formData.chartPermissions[chart] || false}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            chartPermissions: {
                              ...prev.chartPermissions,
                              [chart]: checked === true
                            }
                          }));
                        }}
                      />
                      <Label htmlFor={chart} className="text-sm">
                        {chartLabels[chart]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : user ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
