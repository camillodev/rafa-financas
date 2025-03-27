
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useFinance } from "@/hooks/useFinance";
import ProgressIndicator from "@/components/ui/atoms/ProgressIndicator";
import CardHeader from "@/components/ui/atoms/CardHeader";

const SavingsGoals = () => {
  const finance = useFinance();
  const { goals, formatCurrency } = finance;

  // Sort goals by percentage complete (descending)
  const sortedGoals = [...goals]
    .filter(goal => !goal.targetDate || new Date(goal.targetDate) > new Date())
    .sort((a, b) => 
      (b.currentAmount / b.targetAmount) - (a.currentAmount / a.targetAmount)
    )
    .slice(0, 3); // Only show top 3 goals

  return (
    <Card className="h-full">
      <CardHeader 
        title="Metas de Economia" 
        action={
          <Button size="sm" variant="outline" onClick={() => finance.navigateToGoalDetail('new')}>
            <Plus className="h-4 w-4 mr-1" />
            Nova Meta
          </Button>
        }
      />
      <CardContent>
        {sortedGoals.length > 0 ? (
          <div className="space-y-4">
            {sortedGoals.map((goal) => {
              const percentage = Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
              
              return (
                <div key={goal.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: goal.color }}
                      />
                      <span className="font-medium text-sm">{goal.name}</span>
                    </div>
                    <span className="text-sm">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  
                  <ProgressIndicator
                    value={goal.currentAmount}
                    max={goal.targetAmount}
                    showPercentage={false}
                    size="sm"
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
            <p className="mb-2">Você não possui metas de economia ativas.</p>
            <p className="text-sm">Crie uma meta para acompanhar seu progresso.</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full"
          onClick={() => finance.navigateToGoalDetail('')}
        >
          Ver Todas as Metas
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SavingsGoals;
