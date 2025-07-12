
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { UserWithPermissions } from './types';
import { ChartPermissions } from "./ChartPermissions";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { KeyRound } from "lucide-react";

interface UserDetailModalProps {
  user?: UserWithPermissions;
  isOpen: boolean;
  onClose: () => void;
  onUserUpdate?: () => void;
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({ 
  user, 
  isOpen, 
  onClose,
  onUserUpdate 
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [userEmail, setUserEmail] = useState<string>('');
  const [isActive, setIsActive] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const { toast } = useToast();

  // Buscar email do usuário quando o modal abrir
  React.useEffect(() => {
    const fetchUserEmail = async () => {
      if (!user?.id || !isOpen) return;
      
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

        setUserEmail(data?.email || 'Email não encontrado');
      } catch (error) {
        console.error('Error fetching user email:', error);
        setUserEmail('N/A');
      }
    };

    fetchUserEmail();
  }, [user?.id, isOpen]);

  // Sincronizar estado local com o usuário
  React.useEffect(() => {
    if (user) {
      setIsActive(user.is_active);
    }
  }, [user]);

  // Early return após todos os hooks serem chamados
  if (!user) return null;

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: "bg-red-600 hover:bg-red-700",
      business_manager: "bg-blue-600 hover:bg-blue-700",
      user: "bg-green-600 hover:bg-green-700"
    };
    return <Badge className={colors[role as keyof typeof colors] || "bg-gray-600"}>{role}</Badge>;
  };

  const handleStatusToggle = async (checked: boolean) => {
    if (isUpdating) return;
    
    console.log('handleStatusToggle called with:', checked, 'for user:', user.id);
    console.log('Current user is_active value:', user.is_active);
    
    // Atualizar estado local imediatamente para feedback visual
    setIsActive(checked);
    setIsUpdating(true);
    
    try {
      console.log('Attempting to update is_active to:', checked);
      
      const { data, error } = await supabase
        .from('profiles')
        .update({ is_active: checked })
        .eq('id', user.id)
        .select('is_active');

      if (error) {
        console.error('Supabase error updating user status:', error);
        throw error;
      }

      console.log('Update successful, returned data:', data);
      
      // Verificar se a atualização foi realmente persistida
      if (data && data.length > 0) {
        const updatedStatus = data[0].is_active;
        console.log('Database confirmed is_active is now:', updatedStatus);
        
        if (updatedStatus !== checked) {
          console.warn('Database value does not match expected value!');
        }
      }

      toast({
        title: "Sucesso!",
        description: `Usuário ${checked ? 'ativado' : 'desativado'} com sucesso.`,
      });

      if (onUserUpdate) {
        onUserUpdate();
      }
    } catch (error: any) {
      console.error('Error updating user status:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Reverter estado local em caso de erro
      setIsActive(!checked);
      toast({
        title: "Erro!",
        description: `Falha ao ${checked ? 'ativar' : 'desativar'} usuário: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!newPassword.trim()) {
      toast({
        title: "Erro!",
        description: "Por favor, digite uma nova senha.",
        variant: "destructive",
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Erro!",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      });
      return;
    }

    setIsResettingPassword(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('update-user-password', {
        body: {
          userId: user.id,
          newPassword: newPassword
        }
      });

      if (error) {
        throw error;
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      toast({
        title: "Sucesso!",
        description: "Senha redefinida com sucesso.",
      });

      setNewPassword('');
      setShowPasswordReset(false);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast({
        title: "Erro!",
        description: `Falha ao redefinir senha: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalhes do Usuário</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="permissions">Permissões de Página</TabsTrigger>
            <TabsTrigger value="charts">Permissões de Gráficos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="info" className="space-y-4">
            
            <div className="flex items-center space-x-2 p-4 border rounded-lg">
              <Switch
                id="user-status"
                checked={isActive}
                onCheckedChange={handleStatusToggle}
                disabled={isUpdating}
              />
              <Label htmlFor="user-status" className="text-sm font-medium">
                {isActive ? 'Usuário Ativo' : 'Usuário Inativo'}
              </Label>
              {isUpdating && <span className="text-sm text-gray-500">Atualizando...</span>}
            </div>

            <div className="p-4 border rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Redefinir Senha</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPasswordReset(!showPasswordReset)}
                  className="flex items-center gap-2"
                >
                  <KeyRound className="h-4 w-4" />
                  {showPasswordReset ? 'Cancelar' : 'Redefinir Senha'}
                </Button>
              </div>
              
              {showPasswordReset && (
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="new-password">Nova Senha</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Digite a nova senha (mín. 6 caracteres)"
                      minLength={6}
                    />
                  </div>
                  <Button
                    onClick={handlePasswordReset}
                    disabled={isResettingPassword || !newPassword.trim()}
                    className="w-full"
                  >
                    {isResettingPassword ? 'Redefinindo...' : 'Confirmar Nova Senha'}
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Nome Completo</Label>
                <Input value={user.full_name || 'N/A'} readOnly />
              </div>
              
              <div>
                <Label>Email</Label>
                <Input value={userEmail || 'N/A'} readOnly className="bg-neutral-700" />
              </div>
              
              <div>
                <Label>Role</Label>
                <div className="pt-2">
                  {getRoleBadge(user.role)}
                </div>
              </div>
              
              <div>
                <Label>Username</Label>
                <Input value={user.username || 'N/A'} readOnly />
              </div>
              
              <div>
                <Label>Criado em</Label>
                <Input value={user.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR') : 'N/A'} readOnly />
              </div>
              
              <div>
                <Label>Atualizado em</Label>
                <Input value={user.updated_at ? new Date(user.updated_at).toLocaleDateString('pt-BR') : 'N/A'} readOnly />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="permissions" className="space-y-4">
            <div>
              <Label>Permissões de Página</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {user.user_page_permissions?.map((permission) => (
                  <div key={permission.page} className="flex items-center justify-between p-2 border rounded">
                    <span className="capitalize">{permission.page.replace('-', ' ')}</span>
                    <Badge variant={permission.can_access ? "default" : "destructive"}>
                      {permission.can_access ? 'Permitido' : 'Negado'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="charts" className="space-y-4">
            <ChartPermissions userId={user.id} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
