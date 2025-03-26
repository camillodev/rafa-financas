
import { useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { supabase, getSupabaseWithAuth } from '@/integrations/supabase/client';

export function useAuth() {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const [supabaseToken, setSupabaseToken] = useState<string | null>(null);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState(supabase);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      setIsSupabaseReady(false);
      return;
    }

    const getSupabaseToken = async () => {
      try {
        // Get the JWT token for Supabase from Clerk
        const token = await getToken({ template: 'supabase' });
        
        if (!token) {
          console.error('Could not get Supabase token from Clerk');
          return;
        }

        setSupabaseToken(token);
        
        // Create a new Supabase client with the JWT
        const authClient = getSupabaseWithAuth(token);
        
        // Set the session for the client directly
        try {
          await authClient.auth.setSession({ access_token: token, refresh_token: '' });
          console.log('Supabase session set successfully');
        } catch (sessionError) {
          console.error('Error setting Supabase session:', sessionError);
        }
        
        setSupabaseClient(authClient);
        setIsSupabaseReady(true);
        console.log('Supabase client authenticated with Clerk JWT');
      } catch (error) {
        console.error('Error getting Supabase token:', error);
      }
    };

    // Get the token when auth state changes
    getSupabaseToken();
    
    // Set up a refresh interval for the token
    const interval = setInterval(getSupabaseToken, 55 * 60 * 1000); // 55 minutes
    
    return () => clearInterval(interval);
  }, [isLoaded, isSignedIn, user, getToken]);

  return {
    isLoaded,
    isSignedIn,
    user,
    isSupabaseReady,
    supabaseToken,
    supabase: supabaseClient
  };
}
