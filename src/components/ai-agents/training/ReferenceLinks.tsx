// Componente temporariamente desabilitado - tabelas necessárias não existem no banco
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from 'lucide-react';

export const ReferenceLinks: React.FC = () => {
  return (
    <Card className="bg-slate-800/50 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Link className="w-5 h-5" />
          Links de Referência
        </CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-center h-64">
        <div className="text-center text-slate-400 max-w-md">
          <Link className="w-16 h-16 mx-auto mb-4 opacity-30" />
          <h3 className="text-lg font-medium mb-2">Funcionalidade não disponível</h3>
          <p className="text-sm text-neutral-500">
            As tabelas necessárias ainda não foram criadas no banco de dados.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};