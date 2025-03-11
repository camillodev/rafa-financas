
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

export function DashboardHeader() {
  const { financialSummary } = useFinance();
  
  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-8 animate-slide-down">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Rafa Finanças</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe suas finanças, gerencie despesas e planeje seu orçamento
        </p>
      </div>
    </div>
  );
}

export default DashboardHeader;
