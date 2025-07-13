import { useState, useEffect, useRef, useCallback } from 'react';

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
  version: number;
}

const STORAGE_KEY = 'business-manager-form-data';
const AUTOSAVE_INTERVAL = 300; // Faster auto-save at 300ms
const EXPIRY_TIME = 24 * 60 * 60 * 1000; // 24 hours
const CURRENT_VERSION = 2; // Increment when data structure changes

export const useBusinessManagerFormPersistence = (editingBM?: any) => {
  const [formData, setFormData] = useState<FormData>({
    bm_name: '',
    access_token: '',
    app_id: '',
    app_secret: ''
  });
  
  const [adAccounts, setAdAccounts] = useState<AdAccount[]>([
    { id: Date.now().toString(), ad_account_name: '', ad_account_id: '' }
  ]);

  const [hasPersistedData, setHasPersistedData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedRef = useRef<string>('');
  const isEditingRef = useRef(!!editingBM);

  // Update editing state when editingBM changes
  useEffect(() => {
    isEditingRef.current = !!editingBM;
  }, [editingBM]);

  // Enhanced immediate save with conflict detection
  const saveImmediately = useCallback(() => {
    if (isEditingRef.current) {
      console.log('🚫 Skipping persistence - in edit mode');
      return;
    }

    try {
      const dataToSave: PersistedFormState = {
        formData,
        adAccounts,
        timestamp: Date.now(),
        version: CURRENT_VERSION
      };
      
      const serialized = JSON.stringify(dataToSave);
      
      // Prevent unnecessary saves if data hasn't changed
      if (serialized === lastSavedRef.current) {
        console.log('🔄 Skipping save - no changes detected');
        return;
      }

      localStorage.setItem(STORAGE_KEY, serialized);
      lastSavedRef.current = serialized;
      
      console.log('💾 Form data saved immediately:', { 
        formDataKeys: Object.keys(formData).filter(key => formData[key as keyof FormData]?.trim()), 
        adAccountsCount: adAccounts.length,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (error) {
      console.error('❌ Error saving form data immediately:', error);
    }
  }, [formData, adAccounts]);

  // Enhanced data loading with version migration
  const loadPersistedData = useCallback(() => {
    if (isEditingRef.current) {
      console.log('🚫 Skipping load - in edit mode');
      return;
    }

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        console.log('📭 No persisted data found');
        setIsInitialized(true);
        return;
      }

      const parsed: PersistedFormState = JSON.parse(saved);
      const now = Date.now();
      
      // Check version compatibility
      if (parsed.version !== CURRENT_VERSION) {
        console.log('🔄 Data version mismatch, clearing old data');
        localStorage.removeItem(STORAGE_KEY);
        setIsInitialized(true);
        return;
      }
      
      // Check if data is still valid (not expired)
      if (now - parsed.timestamp >= EXPIRY_TIME) {
        console.log('⏰ Persisted data expired, removing');
        localStorage.removeItem(STORAGE_KEY);
        setIsInitialized(true);
        return;
      }

      // Validate data quality
      const hasFormData = Object.values(parsed.formData).some(value => value?.trim() !== '');
      const hasValidAdAccounts = parsed.adAccounts?.some(account => 
        account?.ad_account_name?.trim() !== '' || account?.ad_account_id?.trim() !== ''
      );
      
      if (hasFormData || hasValidAdAccounts) {
        console.log('✅ Loading persisted data:', {
          formData: hasFormData,
          adAccounts: hasValidAdAccounts,
          accountCount: parsed.adAccounts?.length || 0
        });
        
        setFormData(parsed.formData);
        
        // Ensure ad accounts have valid IDs
        const validatedAccounts = (parsed.adAccounts || []).map((account, index) => ({
          ...account,
          id: account.id || `${Date.now()}-${index}`
        }));
        
        if (validatedAccounts.length === 0) {
          validatedAccounts.push({ id: Date.now().toString(), ad_account_name: '', ad_account_id: '' });
        }
        
        setAdAccounts(validatedAccounts);
        setHasPersistedData(true);
        lastSavedRef.current = JSON.stringify(parsed);
      } else {
        console.log('📝 No meaningful data to restore');
      }
    } catch (error) {
      console.error('❌ Error loading persisted form data:', error);
      localStorage.removeItem(STORAGE_KEY);
    }
    
    setIsInitialized(true);
  }, []);

  // Load persisted data on mount
  useEffect(() => {
    loadPersistedData();
  }, [loadPersistedData]);

  // Enhanced auto-save with debouncing
  const saveToLocalStorage = useCallback(() => {
    if (!isInitialized || isEditingRef.current) return;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced saving
    saveTimeoutRef.current = setTimeout(() => {
      saveImmediately();
    }, AUTOSAVE_INTERVAL);
  }, [isInitialized, saveImmediately]);

  // Auto-save when form data changes
  useEffect(() => {
    if (isInitialized && !isEditingRef.current) {
      saveToLocalStorage();
    }
    
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [formData, adAccounts, isInitialized, saveToLocalStorage]);

  // Navigation event handling
  useEffect(() => {
    const handleBeforeUnload = () => {
      console.log('🚨 Page unload detected - saving form data');
      if (!isEditingRef.current && isInitialized) {
        saveImmediately();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && !isEditingRef.current && isInitialized) {
        console.log('👁️ Page hidden - saving form data');
        saveImmediately();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [saveImmediately, isInitialized]);

  // Clear persisted data
  const clearPersistedData = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setHasPersistedData(false);
      lastSavedRef.current = '';
      console.log('🗑️ Persisted data cleared');
    } catch (error) {
      console.error('❌ Error clearing persisted data:', error);
    }
  }, []);

  // Update form data with optimistic updates
  const updateFormData = useCallback((newData: Partial<FormData>) => {
    setFormData(prev => {
      const updated = { ...prev, ...newData };
      console.log('📝 Form data updated:', Object.keys(newData));
      return updated;
    });
  }, []);

  // Update ad accounts with immediate save for critical actions
  const updateAdAccounts = useCallback((newAccounts: AdAccount[]) => {
    console.log('📋 Updating ad accounts:', { 
      before: adAccounts.length, 
      after: newAccounts.length,
      action: newAccounts.length > adAccounts.length ? 'ADD' : 
              newAccounts.length < adAccounts.length ? 'REMOVE' : 'UPDATE'
    });
    
    setAdAccounts(newAccounts);
    
    // For critical actions (add/remove), save immediately after state update
    if (newAccounts.length !== adAccounts.length && !isEditingRef.current) {
      setTimeout(() => {
        console.log('🚀 Triggering immediate save after critical action');
        saveImmediately();
      }, 50); // Small delay to ensure state update
    }
  }, [adAccounts.length, saveImmediately]);

  // Force refresh data (useful for debugging)
  const refreshData = useCallback(() => {
    console.log('🔄 Force refreshing persisted data');
    loadPersistedData();
  }, [loadPersistedData]);

  return {
    formData,
    adAccounts,
    hasPersistedData,
    isInitialized,
    updateFormData,
    updateAdAccounts,
    clearPersistedData,
    saveImmediately,
    refreshData
  };
};