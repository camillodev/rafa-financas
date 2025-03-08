
import React from 'react';
import { Plus, Download, Filter } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import AnimatedNumber from '@/components/ui/AnimatedNumber';

export function DashboardHeader() {
  const { financialSummary } = useFinance();
  
  return (
    <div className="flex flex-col space-y-4 md:space-y-0 md:flex-row md:justify-between md:items-center mb-8 animate-slide-down">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Financial Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track your finances, manage expenses, and plan your budget
        </p>
      </div>
      
      <div className="flex gap-2">
        <button className="inline-flex items-center justify-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/80 transition-colors">
          <Filter size={18} />
          <span>Filter</span>
        </button>
        <button className="inline-flex items-center justify-center gap-1 rounded-lg bg-accent px-3 py-2 text-sm font-medium text-accent-foreground hover:bg-accent/80 transition-colors">
          <Download size={18} />
          <span>Export</span>
        </button>
        <button className="inline-flex items-center justify-center gap-1 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus size={18} />
          <span>Add Transaction</span>
        </button>
      </div>
    </div>
  );
}

export default DashboardHeader;
