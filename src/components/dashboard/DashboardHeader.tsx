
import React from 'react';
import { useFinance } from '@/hooks/useFinance';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function DashboardHeader() {
  const { currentDate } = useFinance();
  const formattedDate = format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  return (
    <div className="flex flex-col space-y-1 mb-6 animate-slide-down">
      <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Visão Geral</h1>
      <p className="text-sm sm:text-base text-muted-foreground">
        {formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1)}
      </p>
    </div>
  );
}

export default DashboardHeader;
