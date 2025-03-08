
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { BarChart } from 'lucide-react';

export function Budgets() {
  const { budgetGoals, formatCurrency } = useFinance();
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e acompanhe seus limites de gastos por categoria
        </p>
      </div>
      
      <div className="rounded-xl border bg-card shadow-sm p-6">
        <div className="space-y-6">
          {budgetGoals.map((budget) => {
            const percentage = Math.round((budget.spent / budget.amount) * 100);
            
            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <BarChart size={18} className="text-primary" />
                    </div>
                    <span className="font-medium">{budget.category}</span>
                  </div>
                  <span className="text-sm">
                    <span 
                      className={`font-medium ${
                        percentage > 100 
                          ? 'text-destructive' 
                          : percentage > 80 
                            ? 'text-finance-expense' 
                            : 'text-foreground'
                      }`}
                    >
                      {formatCurrency(budget.spent)}
                    </span>
                    <span className="text-muted-foreground"> / {formatCurrency(budget.amount)}</span>
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ease-out rounded-full ${
                        percentage >= 100 
                          ? 'bg-destructive' 
                          : percentage >= 80 
                            ? 'bg-finance-expense' 
                            : 'bg-primary'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{percentage}% usado</span>
                    <span>
                      {formatCurrency(Math.max(budget.amount - budget.spent, 0))} restante
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}

export default Budgets;
