
import React, { useEffect, ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { useFinanceStore } from '@/store/useFinanceStore';
import { signInAnonymously } from '@/integrations/supabase/client';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Initialize anonymous authentication
  useEffect(() => {
    const initAuth = async () => {
      try {
        await signInAnonymously();
        console.log('Anonymous authentication initialized');
      } catch (error) {
        console.error('Error initializing anonymous auth:', error);
      }
    };
    
    initAuth();
  }, []);
  
  // Initialize finance data
  const fetchAllData = useFinanceStore(state => state.fetchAllData);
  
  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);
  
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
