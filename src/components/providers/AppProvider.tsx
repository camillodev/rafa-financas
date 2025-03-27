import React, { useEffect, ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { SplitBillsProvider } from '@/context/SplitBillsContext';
import { FeatureFlagsProvider } from '@/context/FeatureFlagsContext';
import { fetchAllFinanceData } from '@/services/financeService';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
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
