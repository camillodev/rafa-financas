import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

export function DashboardHeader() {
  // Use optional chaining to safely access financialSummary
  const finance = useFinance();
  const financialSummary = finance.financialSummary || {
    totalIncome: 0,
    totalExpenses: 0,
    netBalance: 0,
    savingsGoal: 0,
    savingsProgress: 0
  };
  
  return (
    <div className="flex flex-col mb-6 animate-slide-down">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Riqueza em Dia</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Acompanhe suas finanças, gerencie despesas e planeje seu orçamento
        </p>
      </div>
    </div>
  );
}

export default DashboardHeader;
