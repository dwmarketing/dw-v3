
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useConversationManagement = (conversationId: string | null) => {
  const [conversationTitle, setConversationTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (conversationId) {
      loadConversationTitle();
    } else {
      setConversationTitle('');
    }
  }, [conversationId]);

  const loadConversationTitle = async () => {
    if (!conversationId) return;
    try {
      // Note: Database table 'agent_conversations' does not exist yet
      // Using placeholder data for now
      await new Promise(resolve => setTimeout(resolve, 300));
      setConversationTitle('Nova Conversa');
    } catch (error) {
      console.error('Error loading conversation title:', error);
    }
  };

  const updateConversationTitle = async (newTitle: string) => {
    if (!conversationId || !newTitle.trim()) return false;
    try {
      // Note: Database table 'agent_conversations' does not exist yet
      // Simulating update action
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setConversationTitle(newTitle.trim());
      toast({
        title: "Aviso",
        description: "Título atualizado localmente. Tabela do banco de dados ainda não criada."
      });
      return true;
    } catch (error) {
      console.error('Error updating title:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o título da conversa.",
        variant: "destructive"
      });
      return false;
    }
  };

  const createNewConversation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      console.log('Criando nova conversa para usuário:', user.id);
      
      // Note: Database table 'agent_conversations' does not exist yet
      // Generating random ID for placeholder
      const mockId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      await new Promise(resolve => setTimeout(resolve, 300));
      
      console.log('Nova conversa criada (mock):', mockId);
      return mockId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Aviso",
        description: "Conversa criada localmente. Tabela do banco de dados ainda não criada.",
        variant: "default"
      });
      return `mock-${Date.now()}`;
    }
  };

  return {
    conversationTitle,
    isEditingTitle,
    setIsEditingTitle,
    updateConversationTitle,
    createNewConversation
  };
};
