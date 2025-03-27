
import { useEffect, useState } from 'react';
import { useAuth as useClerkAuth, useUser } from '@clerk/clerk-react';
import { supabase, getSupabaseWithAuth, signInAnonymously } from '@/integrations/supabase/client';

export function useAuth() {
  const { isLoaded, isSignedIn, getToken } = useClerkAuth();
  const { user } = useUser();
  const [supabaseToken, setSupabaseToken] = useState<string | null>(null);
  const [isSupabaseReady, setIsSupabaseReady] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState(supabase);

  useEffect(() => {
    const setupSupabaseAuth = async () => {
      if (!isLoaded) {
        setIsSupabaseReady(false);
        return;
      }

      try {
        // If signed in with Clerk, get a token for Supabase
        if (isSignedIn && user) {
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
            console.log('Supabase session set successfully with Clerk token');
          } catch (sessionError) {
            console.error('Error setting Supabase session:', sessionError);
          }
          
          setSupabaseClient(authClient);
          setIsSupabaseReady(true);
        } else {
          // If not signed in with Clerk, try to use anonymous auth for Supabase
          const { data, error } = await signInAnonymously();
          
          if (error) {
            console.error('Error signing in anonymously to Supabase:', error);
            return;
          }
          
          if (data.session) {
            console.log('Supabase anonymous session created successfully');
            setIsSupabaseReady(true);
          }
        }
      } catch (error) {
        console.error('Error setting up Supabase auth:', error);
      }
    };

    setupSupabaseAuth();
    
    // Set up a refresh interval for the token if using Clerk
    let interval: number | undefined;
    if (isSignedIn && user) {
      interval = window.setInterval(setupSupabaseAuth, 55 * 60 * 1000); // 55 minutes
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
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
