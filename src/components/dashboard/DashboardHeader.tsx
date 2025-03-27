
import React from 'react';
import { useFinance } from '@/hooks/useFinance';

export function DashboardHeader() {
  const finance = useFinance();
  
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
