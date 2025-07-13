import { useState, useEffect, useRef } from 'react';

interface AdAccount {
  id: string;
  ad_account_name: string;
  ad_account_id: string;
}

interface FormData {
  bm_name: string;
  access_token: string;
  app_id: string;
  app_secret: string;
}

interface PersistedFormState {
  formData: FormData;
  adAccounts: AdAccount[];
  timestamp: number;
}

const STORAGE_KEY = 'business-manager-form-data';
const AUTOSAVE_INTERVAL = 2000; // Auto-save every 2 seconds
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export const useBusinessManagerFormPersistence = (editingBM?: any) => {
  const [formData, setFormData] = useState<FormData>({
    bm_name: '',
    access_token: '',
    app_id: '',
    app_secret: ''
  });
  
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([
    { id: '1', ad_account_name: '', ad_account_id: '' }
  ]);

  const [hasPersistedData, setHasPersistedData] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();

  // Load persisted data on mount
  useEffect(() => {
    if (editingBM) {
      // If editing, don't load from localStorage
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: PersistedFormState = JSON.parse(saved);
        const now = Date.now();
        
        // Check if data is still valid (not expired)
        if (now - parsed.timestamp < EXPIRY_TIME) {
          // Check if there's meaningful data to restore
          const hasFormData = Object.values(parsed.formData).some(value => value.trim() !== '');
          const hasAdAccountData = parsed.adAccounts.some(account => 
            account.ad_account_name.trim() !== '' || account.ad_account_id.trim() !== ''
          );
          
          if (hasFormData || hasAdAccountData) {
            setFormData(parsed.formData);
            setAdAccounts(parsed.adAccounts);
            setHasPersistedData(true);
          }
        } else {
          // Data expired, remove from localStorage
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error loading persisted form data:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [editingBM]);

  // Auto-save to localStorage with debouncing
  const saveToLocalStorage = () => {
    if (editingBM) return; // Don't persist when editing

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced saving
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const dataToSave: PersistedFormState = {
          formData,
          adAccounts,
          timestamp: Date.now()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        console.error('Error saving form data to localStorage:', error);
      }
    }, AUTOSAVE_INTERVAL);
  };

  // Auto-save when form data changes
  useEffect(() => {
    if (!editingBM) {
      saveToLocalStorage();
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, adAccounts, editingBM]);

  // Clear persisted data
  const clearPersistedData = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasPersistedData(false);
    } catch (error) {
      console.error('Error clearing persisted data:', error);
    }
  };

  // Update form data with persistence
  const updateFormData = (newData: Partial<FormData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  // Update ad accounts with persistence
  const updateAdAccounts = (newAccounts: AdAccount[]) => {
    setAdAccounts(newAccounts);
  };

  return {
    formData,
    adAccounts,
    hasPersistedData,
    updateFormData,
    updateAdAccounts,
    clearPersistedData
  };
};