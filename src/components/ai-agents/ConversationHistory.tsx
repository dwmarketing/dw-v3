// Componente temporariamente desabilitado - tabelas necessárias não existem no banco
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface ConversationHistoryProps {
  onSelectConversation: (id: string) => void;
  refreshTrigger?: number;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onSelectConversation,
  refreshTrigger = 0
}) => {
  return (
    <Card className="bg-neutral-950 border-neutral-800 h-full">
      <CardHeader className="bg-neutral-900/50 border-b border-neutral-800">
        <CardTitle className="text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-blue-400" />
          Histórico de Conversas
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-full">
        <div className="text-center text-slate-400 max-w-md">
          <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">Funcionalidade não disponível</h3>
          <p className="text-sm text-neutral-500">
            As tabelas necessárias para o histórico de conversas ainda não foram criadas no banco de dados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};