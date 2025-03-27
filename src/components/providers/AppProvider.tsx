
import React, { useEffect, ReactNode } from 'react';
import { Toaster } from '@/components/ui/sonner';
import { FeatureFlagsProvider } from '@/context/FeatureFlagsContext';
import { fetchAllFinanceData } from '@/services/financeService';
import { ThemeProvider } from '@/hooks/use-theme';

interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  // Initialize finance data
  useEffect(() => {
    fetchAllFinanceData();
  }, []);
  
  return (
    <ThemeProvider>
      <FeatureFlagsProvider>
          {children}
          <Toaster />
      </FeatureFlagsProvider>
    </ThemeProvider>
  );
}
