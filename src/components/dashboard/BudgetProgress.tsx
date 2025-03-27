import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/hooks/useFinance';
import { BarChart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

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
  const { formatCurrency } = useFinance();
  const navigate = useNavigate();
  
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  
  // Fetch budget data from Supabase
  const { data: budgetGoals = [], isLoading } = useQuery({
    queryKey: ['budgetProgress', currentMonth, currentYear],
    queryFn: async () => {
      const { data: categories, error: categoriesError } = await supabase
        .from('categories')
        .select('id, name, type')
        .eq('type', 'expense')
        .eq('is_active', true);
      
      if (categoriesError) throw categoriesError;
      
      const { data: budgets, error: budgetsError } = await supabase
        .from('budgets')
        .select(`
          id,
          amount,
          category_id,
          categories (
            name,
            type
          )
        `)
        .eq('month', currentMonth)
        .eq('year', currentYear);
      
      if (budgetsError) throw budgetsError;
      
      // Get transactions to calculate spent amounts
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, category_id')
        .gte('date', `${currentYear}-${String(currentMonth).padStart(2, '0')}-01`)
        .lt('date', `${currentMonth === 12 ? currentYear + 1 : currentYear}-${String(currentMonth === 12 ? 1 : currentMonth + 1).padStart(2, '0')}-01`)
        .eq('transaction_type', 'expense');
      
      if (transactionsError) throw transactionsError;
      
      // Map budgets with their spent amounts
      const budgetsWithSpent = budgets.map(budget => {
        const categoryTransactions = transactions?.filter(
          t => t.category_id === budget.category_id
        ) || [];
        
        const spent = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        
        return {
          id: budget.id,
          category: budget.categories.name,
          categoryId: budget.category_id,
          amount: Number(budget.amount),
          spent: spent
        };
      });
      
      // Sort by highest percentage spent
      return budgetsWithSpent.sort((a, b) => (b.spent / b.amount) - (a.spent / a.amount)).slice(0, 5);
    },
    enabled: !!supabase
  });
  
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
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {budgetGoals.length > 0 ? (
              budgetGoals.map((budget) => {
                const percentage = Math.round((budget.spent / budget.amount) * 100);
                
                return (
                  <div key={budget.id} className="space-y-2">
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
              })
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                <p>Nenhum orçamento definido para este mês</p>
                <button 
                  className="text-primary hover:underline mt-2"
                  onClick={handleNavigateToBudgets}
                >
                  Criar orçamentos
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetProgress;
