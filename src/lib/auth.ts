
// This file is kept for backward compatibility.
// New code should use the useAuth hook directly.
import { useAuth as useSupabaseAuth } from '@/hooks/useAuth';

export function useAuth() {
  const auth = useSupabaseAuth();
  
  return {
    isLoaded: !auth.loading,
    isSignedIn: !!auth.session,
    user: auth.user,
    isSupabaseReady: !!auth.session,
    supabaseToken: auth.session?.access_token || null,
    supabase: auth.supabase
  };
}

export function signOut() {
  return useSupabaseAuth().signOut();
}
