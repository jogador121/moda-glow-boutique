import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useAdminGuard(redirectTo: string = '/') {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!loading && user) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();
          
          const adminRole = profile?.role === 'admin';
          setIsAdmin(adminRole);
          
          if (!adminRole) {
            navigate(redirectTo);
          }
        } catch (error) {
          console.error('Error checking admin role:', error);
          navigate(redirectTo);
        }
      } else if (!loading && !user) {
        navigate('/auth');
      }
      setChecking(false);
    };

    checkAdminRole();
  }, [user, loading, navigate, redirectTo]);

  return { user, loading: loading || checking, isAdmin };
}