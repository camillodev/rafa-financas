import React, { useEffect, ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { signInAnonymously } from '@/integrations/supabase/client';
import { SplitBillsProvider } from '@/context/SplitBillsContext';
import { FeatureFlagsProvider } from '@/context/FeatureFlagsContext';
import { fetchAllFinanceData } from '@/services/financeService';

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
  useEffect(() => {
    fetchAllFinanceData();
  }, []);
  
  return (
    <FeatureFlagsProvider>
      <SplitBillsProvider>
        {children}
        <Toaster />
      </SplitBillsProvider>
    </FeatureFlagsProvider>
  );
}
