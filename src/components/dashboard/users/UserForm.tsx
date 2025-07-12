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
import { Switch } from "@/components/ui/switch";
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
  const [userEmail, setUserEmail] = useState<string>('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    username: '',
    password: '',
    role: 'user' as AppRole,
    is_active: true,
    permissions: {} as Record<UserPage, boolean>,
    chartPermissions: {} as Record<ChartType, boolean>
  });

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

      setFormData(prev => {
        console.log('Updating chart permissions, preserving is_active:', prev.is_active);
        return {
          ...prev,
          chartPermissions: chartPermissionsMap
        };
      });
    } catch (error) {
      console.error('Error fetching chart permissions:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar permissões de gráficos.",
        variant: "destructive",
      });
    }
  };

  // Main effect to initialize form data
  useEffect(() => {
    if (!isOpen) return;

    console.log('useEffect triggered with user:', user);

    if (user) {
      console.log('Initializing form with user data, is_active:', user.is_active, 'type:', typeof user.is_active);
      
      // Create a complete permissions object with all pages
      const userPermissions = PAGES.reduce((acc, page) => {
        const permission = user.user_page_permissions?.find(p => p.page === page);
        acc[page] = permission?.can_access || false;
        return acc;
      }, {} as Record<UserPage, boolean>);

      // Ensure is_active is properly converted to boolean
      const isActiveValue = Boolean(user.is_active);
      console.log('Converted is_active value:', isActiveValue);

      // Initialize form with user data - ensuring is_active is properly set
      const initialFormData = {
        full_name: user.full_name || '',
        email: user.email || '',
        username: user.username || '',
        password: '', // Password is not shown for existing users
        role: user.role,
        is_active: isActiveValue,
        permissions: userPermissions,
        chartPermissions: {} as Record<ChartType, boolean> // Will be set by fetchUserChartPermissions
      };

      console.log('Setting initial form data with is_active:', initialFormData.is_active);
      setFormData(initialFormData);

      // Fetch additional data
      fetchUserChartPermissions(user.id);
      
      // Fetch user email (separate from main state to avoid conflicts)
      const fetchUserEmail = async () => {
        try {
          const { data, error } = await supabase.functions.invoke('get-user-email', {
            body: { userId: user.id }
          });

          if (error) {
            console.error('Error fetching user email:', error);
            setUserEmail('Erro ao carregar email');
            return;
          }

          if (data?.error) {
            console.error('Function returned error:', data.error);
            setUserEmail('Email protegido');
            return;
          }

          const email = data?.email || 'Email não encontrado';
          setUserEmail(email);
          // Only update email field, don't interfere with other form data
          setFormData(prev => {
            console.log('Updating email, preserving is_active:', prev.is_active);
            return {
              ...prev,
              email: email
            };
          });
        } catch (error) {
          console.error('Error fetching user email:', error);
          setUserEmail('N/A');
        }
      };

      fetchUserEmail();
    } else {
      console.log('Initializing form for new user');
      
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

      const newUserFormData = {
        full_name: '',
        email: '',
        username: '',
        password: '',
        role: 'user' as AppRole,
        is_active: true,
        permissions: defaultPermissions,
        chartPermissions: defaultChartPermissions
      };

      console.log('Setting form data for new user:', newUserFormData);
      setFormData(newUserFormData);
      setUserEmail('');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    console.log('Form submission started with data:', formData);
    console.log('User ID:', user?.id);
    console.log('is_active value:', formData.is_active);

    try {
      if (user) {
        // Update existing user
        console.log('Updating profile with is_active:', formData.is_active, 'type:', typeof formData.is_active);
        console.log('Original user is_active:', user.is_active, 'type:', typeof user.is_active);
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .update({
            full_name: formData.full_name,
            username: formData.username,
            is_active: Boolean(formData.is_active), // Ensure boolean conversion
          })
          .eq('id', user.id)
          .select('id, full_name, username, is_active');

        console.log('Profile update result:', { profileData, profileError });
        if (profileError) {
          console.error('Profile update error:', profileError);
          console.error('Error details:', {
            message: profileError.message,
            code: profileError.code,
            details: profileError.details,
            hint: profileError.hint
          });
          throw new Error(`Erro ao atualizar perfil: ${profileError.message}`);
        }

        // Verify the update was successful
        if (profileData && profileData.length > 0) {
          const updatedProfile = profileData[0];
          console.log('Profile successfully updated to:', updatedProfile);
          console.log('Final is_active value in database:', updatedProfile.is_active, 'type:', typeof updatedProfile.is_active);
          
          // Double-check the database state
          const { data: verificationData, error: verificationError } = await supabase
            .from('profiles')
            .select('is_active')
            .eq('id', user.id)
            .single();
            
          if (!verificationError && verificationData) {
            console.log('Database verification - is_active is:', verificationData.is_active);
          }
        }

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
        // Create new user via Edge Function
        const { data, error } = await supabase.functions.invoke('create-user', {
          body: {
            email: formData.email,
            password: formData.password,
            fullName: formData.full_name, // Changed from full_name to fullName to match edge function
            username: formData.username,
            role: formData.role,
            permissions: formData.permissions,
            chartPermissions: formData.chartPermissions
          }
        });

        if (error) {
          throw new Error(error.message || 'Failed to create user');
        }

        if (data?.error) {
          throw new Error(data.error);
        }

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

          {!user && (
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                required
                minLength={6}
                placeholder="Mínimo 6 caracteres"
              />
            </div>
          )}

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

          {user && (
            <div className="flex items-center space-x-2 p-4 border rounded-lg bg-muted/50">
              <Switch
                id="user-status"
                checked={Boolean(formData.is_active)}
                onCheckedChange={(checked) => {
                  console.log('Switch toggled from', formData.is_active, 'to:', checked);
                  setFormData(prev => {
                    const newData = { 
                      ...prev, 
                      is_active: checked 
                    };
                    console.log('New form data after switch:', newData);
                    return newData;
                  });
                }}
                disabled={loading}
              />
              <Label htmlFor="user-status" className="text-sm font-medium cursor-pointer">
                Status: {formData.is_active ? 'Usuário Ativo' : 'Usuário Inativo'}
              </Label>
              <div className="ml-auto text-xs text-muted-foreground">
                DB Value: {String(user.is_active)} | Form: {String(formData.is_active)}
              </div>
            </div>
          )}

          <Tabs defaultValue="pages" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="pages">Permissões de Página</TabsTrigger>
              <TabsTrigger value="charts">Permissões de Gráficos</TabsTrigger>
            </TabsList>
            
            <TabsContent value="pages" className="space-y-4">
              <div>
                <Label>Permissões de Página</Label>
                <div className="space-y-3 mt-2">
                  {PAGES.map((page) => (
                    <div key={page} className="flex items-center justify-between">
                      <Label htmlFor={`page-${page}`} className="capitalize">
                        {page.replace('-', ' ')}
                      </Label>
                      <Switch
                        id={`page-${page}`}
                        checked={formData.permissions[page] || false}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            permissions: {
                              ...prev.permissions,
                              [page]: checked
                            }
                          }));
                        }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="charts" className="space-y-4">
              <div>
                <Label>Permissões de Gráficos</Label>
                <div className="space-y-3 mt-2 max-h-60 overflow-y-auto">
                  {CHARTS.map((chart) => (
                    <div key={chart} className="flex items-center justify-between">
                      <Label htmlFor={`chart-${chart}`} className="text-sm">
                        {chartLabels[chart]}
                      </Label>
                      <Switch
                        id={`chart-${chart}`}
                        checked={formData.chartPermissions[chart] || false}
                        onCheckedChange={(checked) => {
                          setFormData(prev => ({
                            ...prev,
                            chartPermissions: {
                              ...prev.chartPermissions,
                              [chart]: checked
                            }
                          }));
                        }}
                      />
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
