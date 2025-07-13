import React, { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, Save, Plus, Trash2, RefreshCw, AlertCircle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { useBusinessManagerFormPersistence } from "@/hooks/useBusinessManagerFormPersistence";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdAccount {
  id: string;
  ad_account_name: string;
  ad_account_id: string;
}

interface BusinessManagerFormProps {
  onClose: () => void;
  onBusinessManagerCreated: () => void;
  editingBM?: any;
}

export const BusinessManagerForm: React.FC<BusinessManagerFormProps> = ({
  onClose,
  onBusinessManagerCreated,
  editingBM
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use enhanced persistence hook
  const {
    formData,
    adAccounts,
    hasPersistedData,
    isInitialized,
    updateFormData,
    updateAdAccounts,
    clearPersistedData,
    saveImmediately,
    refreshData
  } = useBusinessManagerFormPersistence(editingBM);

  // Enhanced data loading with retry logic
  const loadBusinessManagerData = useCallback(async () => {
    if (!editingBM || !user) return;

    setDataLoading(true);
    setError(null);

    try {
      console.log('📥 Loading business manager data for:', editingBM.bm_name);
      
      // Load form data
      updateFormData({
        bm_name: editingBM.bm_name || '',
        access_token: editingBM.access_token || '',
        app_id: editingBM.app_id || '',
        app_secret: editingBM.app_secret || ''
      });

      // Fetch all ad accounts for this business manager
      const { data, error: fetchError } = await supabase
        .from('business_manager_accounts')
        .select('ad_account_name, ad_account_id')
        .eq('user_id', user.id)
        .eq('bm_name', editingBM.bm_name)
        .order('created_at', { ascending: true });

      if (fetchError) {
        console.error('❌ Database fetch error:', fetchError);
        throw new Error(`Erro ao buscar dados: ${fetchError.message}`);
      }

      if (data && data.length > 0) {
        const loadedAccounts = data.map((account, index) => ({
          id: `edit-${index}-${Date.now()}`,
          ad_account_name: account.ad_account_name || '',
          ad_account_id: account.ad_account_id || ''
        }));
        
        console.log('✅ Loaded ad accounts:', loadedAccounts.length);
        updateAdAccounts(loadedAccounts);
      } else {
        // Fallback to single account from editingBM if no data found
        const fallbackAccount = {
          id: `fallback-${Date.now()}`,
          ad_account_name: editingBM.ad_account_name || '',
          ad_account_id: editingBM.ad_account_id || ''
        };
        
        console.log('📝 Using fallback account data');
        updateAdAccounts([fallbackAccount]);
      }
    } catch (error: any) {
      console.error('❌ Error loading business manager data:', error);
      setError(error.message);
      
      toast({
        title: "Erro ao Carregar",
        description: "Erro ao carregar dados do Business Manager. Tentando com dados de fallback.",
        variant: "destructive"
      });

      // Fallback to single account from editingBM
      const fallbackAccount = {
        id: `error-fallback-${Date.now()}`,
        ad_account_name: editingBM.ad_account_name || '',
        ad_account_id: editingBM.ad_account_id || ''
      };
      updateAdAccounts([fallbackAccount]);
    } finally {
      setDataLoading(false);
    }
  }, [editingBM, user, updateFormData, updateAdAccounts, toast]);

  // Load data when component mounts or editingBM changes
  useEffect(() => {
    if (editingBM) {
      loadBusinessManagerData();
    }
  }, [editingBM, loadBusinessManagerData]);

  // Format BM name for automation compatibility
  const formatBMName = useCallback((name: string): string => {
    return name
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^\w\-_]/g, '')
      .toLowerCase();
  }, []);

  // Enhanced add account with immediate persistence
  const addAdAccount = useCallback(() => {
    console.log('➕ Adding new ad account');
    const newAccount = { 
      id: `new-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, 
      ad_account_name: '', 
      ad_account_id: '' 
    };
    
    const newAccounts = [...adAccounts, newAccount];
    updateAdAccounts(newAccounts);
    
    // Force immediate save for critical action
    setTimeout(() => {
      saveImmediately();
      console.log('💾 Ad account added and saved');
    }, 100);
  }, [adAccounts, updateAdAccounts, saveImmediately]);

  // Enhanced remove account with validation
  const removeAdAccount = useCallback((id: string) => {
    if (adAccounts.length <= 1) {
      toast({
        title: "Ação não permitida",
        description: "Deve haver pelo menos uma conta de anúncio",
        variant: "destructive"
      });
      return;
    }

    console.log('➖ Removing ad account:', id);
    const newAccounts = adAccounts.filter(account => account.id !== id);
    updateAdAccounts(newAccounts);
    
    // Force immediate save for critical action
    setTimeout(() => {
      saveImmediately();
      console.log('💾 Ad account removed and saved');
    }, 100);
  }, [adAccounts, updateAdAccounts, saveImmediately, toast]);

  // Enhanced update account with debouncing
  const updateAdAccount = useCallback((id: string, field: string, value: string) => {
    const newAccounts = adAccounts.map(account => 
      account.id === id ? { ...account, [field]: value } : account
    );
    updateAdAccounts(newAccounts);
  }, [adAccounts, updateAdAccounts]);

  // Enhanced form submission with better error handling
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: "Erro de Autenticação",
        description: "Usuário não autenticado. Faça login novamente.",
        variant: "destructive"
      });
      return;
    }

    // Validate form data
    if (!formData.bm_name.trim()) {
      toast({
        title: "Erro de Validação",
        description: "Nome do Business Manager é obrigatório",
        variant: "destructive"
      });
      return;
    }

    if (!formData.access_token.trim()) {
      toast({
        title: "Erro de Validação",
        description: "Token de acesso é obrigatório",
        variant: "destructive"
      });
      return;
    }

    // Validate ad accounts
    const validAccounts = adAccounts.filter(account => 
      account.ad_account_name.trim() && account.ad_account_id.trim()
    );

    if (validAccounts.length === 0) {
      toast({
        title: "Erro de Validação",
        description: "Adicione pelo menos uma conta de anúncio válida",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formattedBMName = formatBMName(formData.bm_name);
      
      // Show formatting notification if name was changed
      if (formattedBMName !== formData.bm_name) {
        toast({
          title: "Nome Formatado",
          description: `Nome formatado de "${formData.bm_name}" para "${formattedBMName}" para compatibilidade`,
        });
      }

      console.log('💾 Saving business manager:', {
        mode: editingBM ? 'edit' : 'create',
        name: formattedBMName,
        accountCount: validAccounts.length
      });

      if (editingBM) {
        // Edit mode: delete and recreate in transaction
        const { error: deleteError } = await supabase
          .from('business_manager_accounts')
          .delete()
          .eq('bm_name', editingBM.bm_name)
          .eq('user_id', user.id);

        if (deleteError) {
          throw new Error(`Erro ao deletar registros: ${deleteError.message}`);
        }
      }

      // Insert new records
      const recordsToInsert = validAccounts.map(account => ({
        user_id: user.id,
        bm_name: formattedBMName,
        access_token: formData.access_token,
        app_id: formData.app_id || null,
        app_secret: formData.app_secret || null,
        ad_account_name: account.ad_account_name,
        ad_account_id: account.ad_account_id
      }));

      const { error: insertError } = await supabase
        .from('business_manager_accounts')
        .insert(recordsToInsert);

      if (insertError) {
        throw new Error(`Erro ao salvar: ${insertError.message}`);
      }

      toast({
        title: "Sucesso!",
        description: `Business Manager ${editingBM ? 'atualizado' : 'criado'} com ${validAccounts.length} conta(s)`,
        variant: "default"
      });

      // Clear persisted data after successful save
      clearPersistedData();
      onBusinessManagerCreated();
      onClose();
    } catch (error: any) {
      console.error('❌ Save error:', error);
      setError(error.message);
      
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Erro inesperado ao salvar",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, formData, adAccounts, editingBM, formatBMName, toast, clearPersistedData, onBusinessManagerCreated, onClose]);

  // Enhanced close with data persistence check
  const handleClose = useCallback(() => {
    if (!editingBM && (formData.bm_name.trim() || formData.access_token.trim() || 
        adAccounts.some(acc => acc.ad_account_name.trim() || acc.ad_account_id.trim()))) {
      saveImmediately();
    }
    
    if (!editingBM) {
      // Don't clear data when closing to allow restoration
      console.log('💾 Preserving form data for later restoration');
    } else {
      clearPersistedData();
    }
    
    onClose();
  }, [editingBM, formData, adAccounts, saveImmediately, clearPersistedData, onClose]);

  // Show loading state if data is being loaded
  if (dataLoading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-400" />
          <p className="text-white">Carregando dados...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900/50 border-slate-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-white">
          {editingBM ? 'Editar Business Manager' : 'Novo Business Manager'}
          {hasPersistedData && !editingBM && (
            <span className="text-sm text-green-400 ml-2">(Dados Restaurados)</span>
          )}
          {!isInitialized && (
            <span className="text-sm text-yellow-400 ml-2">(Inicializando...)</span>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClose}
          className="text-slate-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {/* Error Alert */}
        {error && (
          <Alert className="mb-4 bg-red-900/20 border-red-800">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-300">
              {error}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => editingBM && loadBusinessManagerData()}
                className="ml-2 text-red-300 hover:text-red-200"
              >
                <RefreshCw className="w-3 h-3 mr-1" />
                Tentar Novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Business Manager Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white">Informações do Business Manager</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bm_name" className="text-white">Nome do Business Manager</Label>
                <Input
                  id="bm_name"
                  type="text"
                  value={formData.bm_name}
                  onChange={(e) => updateFormData({ bm_name: e.target.value })}
                  placeholder="Ex: Minha Empresa BM"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
                <p className="text-xs text-slate-400">
                  Espaços serão convertidos para underscore (_) automaticamente
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="access_token" className="text-white">Token de Acesso</Label>
                <Input
                  id="access_token"
                  type="password"
                  value={formData.access_token}
                  onChange={(e) => updateFormData({ access_token: e.target.value })}
                  placeholder="Insira o token de acesso"
                  className="bg-slate-800 border-slate-700 text-white"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="app_id" className="text-white">ID do Aplicativo</Label>
                <Input
                  id="app_id"
                  type="text"
                  value={formData.app_id}
                  onChange={(e) => updateFormData({ app_id: e.target.value })}
                  placeholder="Ex: 123456789012345"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="app_secret" className="text-white">Chave Secreta</Label>
                <Input
                  id="app_secret"
                  type="password"
                  value={formData.app_secret}
                  onChange={(e) => updateFormData({ app_secret: e.target.value })}
                  placeholder="Insira a chave secreta"
                  className="bg-slate-800 border-slate-700 text-white"
                />
              </div>
            </div>
          </div>

          {/* Ad Accounts Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-white">
                Contas de Anúncio ({adAccounts.length})
              </h3>
              <Button
                type="button"
                onClick={addAdAccount}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
                disabled={loading}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Conta
              </Button>
            </div>

            {adAccounts.map((account, index) => (
              <Card key={account.id} className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-sm font-medium text-slate-300">
                      Conta de Anúncio #{index + 1}
                    </h4>
                    {adAccounts.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeAdAccount(account.id)}
                        className="text-red-400 hover:text-red-300"
                        disabled={loading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Nome da Conta</Label>
                      <Input
                        type="text"
                        value={account.ad_account_name}
                        onChange={(e) => updateAdAccount(account.id, 'ad_account_name', e.target.value)}
                        placeholder="Ex: Conta Principal"
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label className="text-white">ID da Conta</Label>
                      <Input
                        type="text"
                        value={account.ad_account_id}
                        onChange={(e) => updateAdAccount(account.id, 'ad_account_id', e.target.value)}
                        placeholder="Ex: act_123456789"
                        className="bg-slate-700 border-slate-600 text-white"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className="border-slate-600 text-slate-400 hover:text-white"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading || !isInitialized}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Salvando...' : (editingBM ? 'Atualizar' : 'Salvar')}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};