import React from 'react';
import { Target, TrendingUp, ArrowRight } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

export function SavingsGoals() {
  const { goals, formatCurrency } = useFinance();
  // Use optional chaining to safely access navigateToGoalDetail
  const navigateToGoalDetail = useFinance().navigateToGoalDetail ||
    ((goalId) => console.warn('navigateToGoalDetail not implemented', goalId));
  const navigate = useNavigate();
  
  // Get top 3 goals by percentage completion
  const topGoals = [...goals]
    .sort((a, b) => (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount))
    .slice(0, 3);
  
  const handleNavigateToGoals = () => {
    navigate('/goals');
  };
  
  return (
    <Card className="h-full animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Metas de Economia</CardTitle>
        <button 
          className="text-sm text-primary hover:underline flex items-center gap-1"
          onClick={handleNavigateToGoals}
        >
          Ver Todas <ArrowRight size={16} />
        </button>
      </CardHeader>
      <CardContent>
        {topGoals.length > 0 ? (
          <div className="space-y-5">
            {topGoals.map((goal) => {
              const percentage = Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100);
              
              return (
                <div key={goal.id} className="space-y-2 cursor-pointer" onClick={() => navigateToGoalDetail(goal.id)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-8 h-8 flex items-center justify-center rounded-full"
                        style={{ backgroundColor: `${goal.color}20`, color: goal.color }}
                      >
                        <Target size={16} />
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{goal.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(goal.currentAmount)} de {formatCurrency(goal.targetAmount)}
                        </p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold">{percentage}%</span>
                  </div>
                  <Progress value={percentage} />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mb-2" />
            <h4 className="text-lg font-medium">Sem metas</h4>
            <p className="text-sm text-muted-foreground">Você ainda não definiu metas</p>
            <button 
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              onClick={handleNavigateToGoals}
            >
              Criar Meta
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SavingsGoals;
