import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const usePermissions = () => {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!user) {
        setPermissions({});
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_page_permissions')
          .select('page, can_access')
          .eq('user_id', user.id);

        if (error) throw error;

        const permissionsMap: Record<string, boolean> = {};
        data?.forEach(permission => {
          permissionsMap[permission.page] = permission.can_access;
        });

        setPermissions(permissionsMap);
      } catch (error) {
        console.error('Error loading permissions:', error);
        setPermissions({});
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [user]);

  const hasPermission = (page: string): boolean => {
    return permissions[page] === true;
  };

  return {
    permissions,
    loading,
    hasPermission
  };
};