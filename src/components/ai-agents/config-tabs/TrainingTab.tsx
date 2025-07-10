// Componente temporariamente desabilitado - tabelas necessárias não existem no banco
import React from 'react';
import { ConfigTabBase } from './ConfigTabBase';
import { BookOpen } from 'lucide-react';

export const TrainingTab: React.FC = () => {
  return (
    <ConfigTabBase
      tabName="training"
      title="Treinamento"
      description="Configure o treinamento do agente com dados personalizados."
      icon={BookOpen}
    />
  );
};