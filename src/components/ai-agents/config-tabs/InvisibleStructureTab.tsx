// Componente temporariamente desabilitado - tabelas necessárias não existem no banco
import React from 'react';
import { ConfigTabBase } from './ConfigTabBase';
import { Shield } from 'lucide-react';

export const InvisibleStructureTab: React.FC = () => {
  return (
    <ConfigTabBase
      tabName="invisible_structure"
      title="Estrutura Invisível"
      description="Configure a estrutura invisível do agente - como ele organiza e processa informações internamente."
      icon={Shield}
    />
  );
};