
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { BusinessManagerForm } from './business-managers/BusinessManagerForm';
import { BusinessManagerList } from './business-managers/BusinessManagerList';

export const BusinessManagersTab: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Check for persisted data on mount and show form if data exists
  useEffect(() => {
    const checkPersistedData = () => {
      try {
        const saved = localStorage.getItem('business-manager-form-data');
        if (saved) {
          const parsed = JSON.parse(saved);
          const now = Date.now();
          const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours
          
          if (now - parsed.timestamp < EXPIRY_TIME) {
            // Check if there's meaningful data to restore
            const hasFormData = Object.values(parsed.formData).some((value: any) => value?.trim() !== '');
            const hasAdAccountData = parsed.adAccounts.some((account: any) => 
              account.ad_account_name?.trim() !== '' || account.ad_account_id?.trim() !== ''
            );
            
            if (hasFormData || hasAdAccountData) {
              setShowCreateForm(true);
            }
          }
        }
      } catch (error) {
        console.error('Error checking persisted data:', error);
      }
    };

    checkPersistedData();
  }, []);

  const handleBusinessManagerCreated = () => {
    setRefreshTrigger(prev => prev + 1);
    setShowCreateForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white">Gerenciamento de Business Managers</h2>
          <p className="text-slate-400">Adicione e gerencie seus Business Managers e contas de anúncio</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)} 
          className="bg-slate-700 hover:bg-slate-600 text-white border-slate-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {/* Create Business Manager Form */}
      {showCreateForm && (
        <BusinessManagerForm 
          onClose={() => setShowCreateForm(false)} 
          onBusinessManagerCreated={handleBusinessManagerCreated} 
        />
      )}

      {/* Business Managers List */}
      <BusinessManagerList refreshTrigger={refreshTrigger} />
    </div>
  );
};
