
import { useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { supabase } from '@/integrations/supabase/client';

export function useAuth() {
  const { isLoaded, isSignedIn } = useClerkAuth();
  const { user } = useUser();
  const [supabaseToken, setSupabaseToken] = useState<string | null>(null);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      setIsSupabaseReady(false);
      return;
    }

    const getSupabaseToken = async () => {
      try {
        // Use the JWT template for Supabase - fixes the TypeScript error
        const token = await (user as any).getToken({ template: 'supabase' }) as string;


        setSupabaseToken(token);
        
        // Set the token in Supabase
        const { error } = await supabase.auth.setSession({
          access_token: token,
          refresh_token: '',
        });
        
        if (error) {
          console.error('Error setting Supabase session:', error);
          return;
        }
        
        setIsSupabaseReady(true);
      } catch (error) {
        console.error('Error getting Supabase token:', error);
      }
    };

    getSupabaseToken();
    
    // Set up a refresh interval for the token
    const interval = setInterval(getSupabaseToken, 55 * 60 * 1000); // 55 minutes
    
    return () => clearInterval(interval);
  }, [isLoaded, isSignedIn, user]);

  return {
    isLoaded,
    isSignedIn,
    user,
    isSupabaseReady,
    supabaseToken
  };
}
