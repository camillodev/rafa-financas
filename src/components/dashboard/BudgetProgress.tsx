
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/context/FinanceContext';
import { BarChart } from 'lucide-react';

interface ProgressBarProps {
  value: number;
  max: number;
  color?: string;
  warningThreshold?: number;
  dangerThreshold?: number;
}

function ProgressBar({ 
  value, 
  max, 
  color = 'bg-primary', 
  warningThreshold = 80, 
  dangerThreshold = 100 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  let barColor = color;
  if (percentage >= dangerThreshold) {
    barColor = 'bg-destructive';
  } else if (percentage >= warningThreshold) {
    barColor = 'bg-finance-expense';
  }
  
  return (
    <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
      <div 
        className={`h-full ${barColor} transition-all duration-500 ease-out rounded-full`}
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}

export function BudgetProgress() {
  const { budgetGoals, formatCurrency } = useFinance();
  const navigate = useNavigate();
  
  // Sort by highest percentage spent
  const sortedBudgets = [...budgetGoals]
    .sort((a, b) => (b.spent / b.amount) - (a.spent / a.amount))
    .slice(0, 5);
  
  const handleNavigateToBudgets = () => {
    navigate('/budgets');
  };
  
  return (
    <div className="rounded-xl border bg-card shadow-sm h-full animate-fade-in">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Progresso do Orçamento</h3>
          <button 
            className="text-sm text-primary hover:underline"
            onClick={handleNavigateToBudgets}
          >
            Gerenciar Orçamentos
          </button>
        </div>
        
        <div className="space-y-4">
          {sortedBudgets.map((budget) => {
            const percentage = Math.round((budget.spent / budget.amount) * 100);
            
            return (
              <div key={budget.category} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <BarChart size={16} className="text-primary" />
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
                  <ProgressBar value={budget.spent} max={budget.amount} />
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
    </div>
  );
}

export default BudgetProgress;
