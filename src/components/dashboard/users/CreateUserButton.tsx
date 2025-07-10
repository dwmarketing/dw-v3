
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { UserForm } from "./UserForm";

interface CreateUserButtonProps {
  onUserCreated?: () => void;
}

export const CreateUserButton: React.FC<CreateUserButtonProps> = ({ onUserCreated }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleUserUpdate = () => {
    setIsCreateModalOpen(false);
    if (onUserCreated) {
      onUserCreated();
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsCreateModalOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg transition-all duration-200 hover:shadow-xl"
        size="default"
      >
        <Plus className="w-4 h-4 mr-2" />
        Adicionar Usuário
      </Button>

      <UserForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserUpdate={handleUserUpdate}
      />
    </>
  );
};
