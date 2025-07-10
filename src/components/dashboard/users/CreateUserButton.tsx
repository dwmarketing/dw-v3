
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
        className="bg-sky-500 hover:bg-sky-600 text-white"
      >
        <Plus className="w-4 h-4 mr-2" />
        Criar Usuário
      </Button>

      <UserForm
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onUserUpdate={handleUserUpdate}
      />
    </>
  );
};
