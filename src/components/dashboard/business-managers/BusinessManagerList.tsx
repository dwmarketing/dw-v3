
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { BusinessManagerForm } from './BusinessManagerForm';
import { BusinessManagerFilter } from './BusinessManagerFilter';

interface BusinessManager {
  id: string;
  bm_name: string;
  access_token: string;
  ad_account_name: string;
  ad_account_id: string;
  created_at: string;
  updated_at: string;
  app_id?: string;
  app_secret?: string;
}

interface BusinessManagerListProps {
  refreshTrigger: number;
  onBusinessManagerUpdated?: () => void;
}

export const BusinessManagerList: React.FC<BusinessManagerListProps> = ({ refreshTrigger, onBusinessManagerUpdated }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [businessManagers, setBusinessManagers] = useState<BusinessManager[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBM, setEditingBM] = useState<BusinessManager | null>(null);
  const [showTokens, setShowTokens] = useState<{ [key: string]: boolean }>({});
  const [showBMNames, setShowBMNames] = useState<{ [key: string]: boolean }>({});
  const [showAccountIds, setShowAccountIds] = useState<{ [key: string]: boolean }>({});
  const [showAppIds, setShowAppIds] = useState<{ [key: string]: boolean }>({});
  const [showAppSecrets, setShowAppSecrets] = useState<{ [key: string]: boolean }>({});
  const [selectedBMs, setSelectedBMs] = useState<string[]>([]);

  // Function to truncate text if it exceeds 10 characters
  const truncateText = (text: string, maxLength: number = 10) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const fetchBusinessManagers = async () => {
    if (!user) return;

    console.log('🔍 [BM LIST] Iniciando fetch dos Business Managers para user:', user.id);

    try {
      const { data, error } = await supabase
        .from('business_manager_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      console.log('📊 [BM LIST] Resultado da consulta:', { data, error });

      if (error) {
        console.error('❌ [BM LIST] Erro na consulta:', error);
        throw error;
      }

      console.log('✅ [BM LIST] Dados recebidos:', data?.length, 'registros');
      console.log('📋 [BM LIST] Dados detalhados:', data);
      
      setBusinessManagers(data || []);
      console.log('💾 [BM LIST] Estado atualizado com', (data || []).length, 'registros');
    } catch (error: any) {
      console.error('❌ [BM LIST] Erro geral:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao carregar Business Managers",
        variant: "destructive"
      });
      setBusinessManagers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('🔄 [BM LIST] useEffect disparado, refreshTrigger:', refreshTrigger);
    fetchBusinessManagers();
  }, [user, refreshTrigger]);

  // Filter business managers based on selected filters
  const filteredBusinessManagers = businessManagers.filter(bm => {
    if (selectedBMs.length === 0) return true;
    return selectedBMs.includes(bm.bm_name);
  });

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta conta de anúncio?')) return;

    try {
      const { error } = await supabase
        .from('business_manager_accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user?.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Conta de anúncio excluída com sucesso",
        variant: "default"
      });

      fetchBusinessManagers();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir conta de anúncio",
        variant: "destructive"
      });
    }
  };

  // Toggle visibility functions
  const toggleTokenVisibility = (id: string) => {
    setShowTokens(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleBMNameVisibility = (id: string) => {
    setShowBMNames(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAccountIdVisibility = (id: string) => {
    setShowAccountIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAppIdVisibility = (id: string) => {
    setShowAppIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAppSecretVisibility = (id: string) => {
    setShowAppSecrets(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Utility functions for masking different types of text
  const maskToken = (token: string) => {
    if (!token) return '';
    if (token.length <= 8) return '*'.repeat(token.length);
    return token.substring(0, 4) + '*'.repeat(token.length - 8) + token.substring(token.length - 4);
  };

  const maskText = (text: string, visibleChars: number = 3) => {
    if (!text) return '';
    if (text.length <= visibleChars * 2) return '*'.repeat(text.length);
    return text.substring(0, visibleChars) + '*'.repeat(Math.max(3, text.length - visibleChars * 2)) + text.substring(text.length - visibleChars);
  };

  const renderFieldWithToggle = (
    value: string, 
    isVisible: boolean, 
    toggleFunction: () => void, 
    maskFunction?: (text: string) => string,
    maxLength: number = 12
  ) => {
    if (!value) return <span className="text-slate-500">N/A</span>;
    
    const displayValue = isVisible ? value : (maskFunction ? maskFunction(value) : maskText(value));
    
    return (
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm" title={isVisible ? value : undefined}>
          {truncateText(displayValue, maxLength)}
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleFunction}
          className="text-slate-400 hover:text-white h-6 w-6 p-0"
        >
          {isVisible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
        </Button>
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {editingBM && (
        <BusinessManagerForm
          editingBM={editingBM}
          onClose={() => setEditingBM(null)}
          onBusinessManagerCreated={() => {
            console.log('🔄 [BM LIST] Chamando callbacks após edição');
            fetchBusinessManagers();
            onBusinessManagerUpdated?.();
          }}
        />
      )}

      {/* Filter Section */}
      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h3 className="text-lg font-medium text-white">Filtros</h3>
            <BusinessManagerFilter
              businessManagers={businessManagers}
              selectedBMs={selectedBMs}
              onFilterChange={setSelectedBMs}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-slate-900/50 border-slate-800">
        <CardContent className="p-6">
          {filteredBusinessManagers.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              {businessManagers.length === 0 ? (
                <>
                  <p className="mb-2">Nenhuma conta de anúncio encontrada</p>
                  <p className="text-sm">Adicione sua primeira conta para começar</p>
                </>
              ) : (
                <>
                  <p className="mb-2">Nenhuma conta encontrada com os filtros aplicados</p>
                  <p className="text-sm">Ajuste os filtros para ver mais resultados</p>
                </>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-300">Business Manager</TableHead>
                    <TableHead className="text-slate-300">Conta de Anúncio</TableHead>
                    <TableHead className="text-slate-300">ID da Conta</TableHead>
                    <TableHead className="text-slate-300">Token de Acesso</TableHead>
                    <TableHead className="text-slate-300">App ID</TableHead>
                    <TableHead className="text-slate-300">App Secret</TableHead>
                    <TableHead className="text-slate-300">Data de Criação</TableHead>
                    <TableHead className="text-slate-300 text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBusinessManagers.map((bm) => (
                    <TableRow key={bm.id} className="border-slate-700">
                      <TableCell className="text-white font-medium">
                        {renderFieldWithToggle(
                          bm.bm_name,
                          showBMNames[bm.id],
                          () => toggleBMNameVisibility(bm.id),
                          undefined,
                          14
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        <span title={bm.ad_account_name}>
                          {truncateText(bm.ad_account_name || 'N/A')}
                        </span>
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {renderFieldWithToggle(
                          bm.ad_account_id,
                          showAccountIds[bm.id],
                          () => toggleAccountIdVisibility(bm.id),
                          undefined,
                          12
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {renderFieldWithToggle(
                          bm.access_token,
                          showTokens[bm.id],
                          () => toggleTokenVisibility(bm.id),
                          maskToken,
                          15
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {renderFieldWithToggle(
                          bm.app_id || '',
                          showAppIds[bm.id],
                          () => toggleAppIdVisibility(bm.id),
                          undefined,
                          12
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {renderFieldWithToggle(
                          bm.app_secret || '',
                          showAppSecrets[bm.id],
                          () => toggleAppSecretVisibility(bm.id),
                          maskToken,
                          15
                        )}
                      </TableCell>
                      <TableCell className="text-slate-300">
                        {new Date(bm.created_at).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingBM(bm)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(bm.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
