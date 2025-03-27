import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useFinance } from '@/context/FinanceContext';
import { PieChart, Scissors, AlertTriangle, HelpCircle, Calendar } from 'lucide-react';
import { format, getDaysInMonth, getDay, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type CategoryAllocation = {
  category: string;
  amount: number;
  percentage: number;
  originalBudget: number;
};

type GoalAllocation = {
  name: string;
  amount: number;
  percentage: number;
};

interface BudgetCreationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentMonth: Date;
}

export function BudgetCreationDialog({ isOpen, onClose, currentMonth }: BudgetCreationDialogProps) {
  const { categories, formatCurrency, goals } = useFinance();
  // Use optional chaining to safely access missing properties
  const finance = useFinance();
  const budgetGoals = finance.budgetGoals || [];
  const addBudgetGoal = finance.addBudgetGoal || ((goal) => console.warn('addBudgetGoal not implemented'));
  const updateBudgetGoal = finance.updateBudgetGoal || ((category, goal) => console.warn('updateBudgetGoal not implemented'));
  
  // Step tracking
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Budget state
  const [totalBudget, setTotalBudget] = useState(0);
  const [categoryAllocations, setCategoryAllocations] = useState<CategoryAllocation[]>([]);
  const [goalAllocations, setGoalAllocations] = useState<GoalAllocation[]>([]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [remainingPerDay, setRemainingPerDay] = useState(0);
  const [remainingPerWeek, setRemainingPerWeek] = useState(0);
  const [isUnbalanced, setIsUnbalanced] = useState(false);
  
  // Initialize category allocations from existing budget goals
  useEffect(() => {
    if (isOpen) {
      const monthTotal = budgetGoals.reduce((acc, budget) => acc + budget.amount, 0);
      setTotalBudget(monthTotal > 0 ? monthTotal : 10000); // Default value if no budget exists
      
      // Initialize category allocations
      const initialCategoryAllocations = categories
        .filter(cat => cat.type === 'expense')
        .map(category => {
          const existingBudget = budgetGoals.find(b => b.category === category.name);
          const amount = existingBudget ? existingBudget.amount : 0;
          return {
            category: category.name,
            amount,
            percentage: monthTotal > 0 ? (amount / monthTotal) * 100 : 0,
            originalBudget: amount
          };
        });
      
      setCategoryAllocations(initialCategoryAllocations);
      
      // Initialize goal allocations
      const initialGoalAmount = totalBudget * 0.2; // Default 20% for goals
      const initialGoalAllocations = goals.map(goal => ({
        name: goal.name,
        amount: initialGoalAmount / goals.length,
        percentage: goals.length > 0 ? 20 / goals.length : 0
      }));
      
      setGoalAllocations(initialGoalAllocations.length > 0 ? initialGoalAllocations : [
        { name: "Reserva de emergência", amount: initialGoalAmount, percentage: 20 }
      ]);
      
      calculateRemaining();
    }
  }, [isOpen, budgetGoals, categories, goals, totalBudget]);
  
  // Calculate remaining amounts
  const calculateRemaining = () => {
    const totalAllocated = categoryAllocations.reduce((acc, item) => acc + item.amount, 0) +
                          goalAllocations.reduce((acc, item) => acc + item.amount, 0);
    
    const remaining = totalBudget - totalAllocated;
    setRemainingAmount(remaining);
    
    // Calculate remaining per day and week
    const today = new Date();
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const daysLeft = Math.max(1, Math.ceil((endOfMonth.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
    
    setRemainingPerDay(remaining / daysLeft);
    
    // Calculate full weeks left (starting on Monday)
    let currentDate = today;
    let weeksLeft = 0;
    
    while (currentDate <= endOfMonth) {
      // If it's Monday (1), count a new week
      if (getDay(currentDate) === 1) {
        weeksLeft++;
      }
      currentDate = addDays(currentDate, 1);
    }
    
    // If no full weeks left, use at least 1
    weeksLeft = Math.max(1, weeksLeft);
    setRemainingPerWeek(remaining / weeksLeft);
    
    // Check if budget is balanced
    setIsUnbalanced(Math.abs(remaining) > 0.01);
  };
  
  // Handle total budget input change
  const handleTotalBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTotal = parseFloat(e.target.value) || 0;
    setTotalBudget(newTotal);
    
    // Recalculate percentage for all allocations
    const updatedCategoryAllocations = categoryAllocations.map(item => ({
      ...item,
      percentage: newTotal > 0 ? (item.amount / newTotal) * 100 : 0
    }));
    
    setCategoryAllocations(updatedCategoryAllocations);
    calculateRemaining();
  };
  
  // Handle category allocation change
  const handleCategoryAllocationChange = (category: string, value: number) => {
    const updatedAllocations = categoryAllocations.map(item => {
      if (item.category === category) {
        return {
          ...item,
          amount: value,
          percentage: totalBudget > 0 ? (value / totalBudget) * 100 : 0
        };
      }
      return item;
    });
    
    setCategoryAllocations(updatedAllocations);
    calculateRemaining();
  };
  
  // Handle goal allocation change
  const handleGoalAllocationChange = (name: string, value: number) => {
    const updatedAllocations = goalAllocations.map(item => {
      if (item.name === name) {
        return {
          ...item,
          amount: value,
          percentage: totalBudget > 0 ? (value / totalBudget) * 100 : 0
        };
      }
      return item;
    });
    
    setGoalAllocations(updatedAllocations);
    calculateRemaining();
  };
  
  // Auto-distribute remaining amount
  const handleAutoDistribute = () => {
    if (remainingAmount <= 0) {
      toast.error("Não há saldo restante para distribuir");
      return;
    }
    
    // Distribute proportionally to existing allocations
    const totalCurrentAllocations = categoryAllocations.reduce((acc, item) => acc + item.amount, 0);
    
    if (totalCurrentAllocations <= 0) {
      // If no allocations yet, distribute equally
      const equalAmount = remainingAmount / categoryAllocations.length;
      const updatedAllocations = categoryAllocations.map(item => ({
        ...item,
        amount: item.amount + equalAmount,
        percentage: totalBudget > 0 ? ((item.amount + equalAmount) / totalBudget) * 100 : 0
      }));
      
      setCategoryAllocations(updatedAllocations);
    } else {
      // Distribute proportionally
      const updatedAllocations = categoryAllocations.map(item => {
        const proportion = item.amount / totalCurrentAllocations;
        const additionalAmount = remainingAmount * proportion;
        
        return {
          ...item,
          amount: item.amount + additionalAmount,
          percentage: totalBudget > 0 ? ((item.amount + additionalAmount) / totalBudget) * 100 : 0
        };
      });
      
      setCategoryAllocations(updatedAllocations);
    }
    
    calculateRemaining();
  };
  
  // Navigation between steps
  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    }
  };
  
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  // Save the budget
  const handleSaveBudget = () => {
    // Create or update budget goals for each category
    categoryAllocations.forEach(allocation => {
      const existingBudget = budgetGoals.find(b => b.category === allocation.category);
      
      if (existingBudget) {
        if (existingBudget.amount !== allocation.amount) {
          updateBudgetGoal(allocation.category, {
            amount: allocation.amount,
            period: 'monthly'
          });
        }
      } else if (allocation.amount > 0) {
        addBudgetGoal({
          category: allocation.category,
          amount: allocation.amount,
          period: 'monthly',
          spent: 0
        });
      }
    });
    
    toast.success("Orçamento salvo com sucesso!");
    onClose();
  };
  
  // Get step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="totalBudget">Valor total do orçamento mensal</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="totalBudget"
                  type="number"
                  min="0"
                  step="0.01"
                  value={totalBudget}
                  onChange={handleTotalBudgetChange}
                  className="text-lg"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <HelpCircle size={16} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="max-w-xs">Este valor deve representar sua receita total mensal, ou seja, quanto dinheiro você tem disponível para gastar e economizar neste mês.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            
            <div className="rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Dicas para definir seu orçamento:</h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Considere todas as fontes de renda para este mês</li>
                <li>Inclua salário, rendimentos de investimentos e outras fontes</li>
                <li>Seja realista com o valor para evitar frustrações</li>
                <li>Lembre-se de considerar receitas sazonais ou variáveis</li>
              </ul>
            </div>
          </div>
        );
      
      case 2:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Alocação para Despesas</h4>
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAutoDistribute}
                  disabled={remainingAmount <= 0}
                >
                  <Scissors size={14} className="mr-1" />
                  Distribuir Restante
                </Button>
              </div>
            </div>
            
            <div className="space-y-4 max-h-[40vh] overflow-y-auto pr-2">
              {categoryAllocations.map((allocation) => (
                <div key={allocation.category} className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor={`cat-${allocation.category}`}>{allocation.category}</Label>
                    <span className="text-sm text-muted-foreground">
                      {allocation.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex gap-4 items-center">
                    <Input
                      id={`cat-${allocation.category}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={allocation.amount}
                      onChange={(e) => handleCategoryAllocationChange(allocation.category, parseFloat(e.target.value) || 0)}
                      className="flex-1"
                    />
                    <div className="w-20 text-sm text-right">
                      {allocation.amount > allocation.originalBudget ? (
                        <Badge variant="success">+{formatCurrency(allocation.amount - allocation.originalBudget)}</Badge>
                      ) : allocation.amount < allocation.originalBudget ? (
                        <Badge variant="destructive">-{formatCurrency(allocation.originalBudget - allocation.amount)}</Badge>
                      ) : (
                        <span className="text-muted-foreground">Igual</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div className="flex justify-between">
              <span className="font-medium">Total Alocado:</span>
              <span>{formatCurrency(categoryAllocations.reduce((acc, item) => acc + item.amount, 0))} ({(categoryAllocations.reduce((acc, item) => acc + item.percentage, 0)).toFixed(1)}%)</span>
            </div>
          </div>
        );
      
      case 3:
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="font-medium">Alocação para Metas e Economias</h4>
              <Badge variant="outline">
                {formatCurrency(goalAllocations.reduce((acc, item) => acc + item.amount, 0))} disponível
              </Badge>
            </div>
            
            <div className="space-y-4">
              {goalAllocations.map((allocation) => (
                <div key={allocation.name} className="space-y-1">
                  <div className="flex justify-between">
                    <Label htmlFor={`goal-${allocation.name}`}>{allocation.name}</Label>
                    <span className="text-sm text-muted-foreground">
                      {allocation.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <Input
                    id={`goal-${allocation.name}`}
                    type="number"
                    min="0"
                    step="0.01"
                    value={allocation.amount}
                    onChange={(e) => handleGoalAllocationChange(allocation.name, parseFloat(e.target.value) || 0)}
                  />
                </div>
              ))}
            </div>
            
            <div className="rounded-lg border p-4 bg-blue-50 dark:bg-blue-950">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <PieChart size={16} />
                Valores Restantes
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Total Restante:</span>
                  <span className={`font-medium ${remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(remainingAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Limite Diário:
                  </span>
                  <span>{formatCurrency(remainingPerDay)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    Limite Semanal:
                  </span>
                  <span>{formatCurrency(remainingPerWeek)}</span>
                </div>
              </div>
            </div>
            
            {isUnbalanced && (
              <div className="rounded-lg border border-destructive p-4 bg-destructive/10">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-destructive h-5 w-5 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">Orçamento não balanceado</h4>
                    <p className="text-sm mt-1">
                      Você ainda tem {formatCurrency(Math.abs(remainingAmount))} {remainingAmount >= 0 ? 'não alocados' : 'além do seu orçamento'}. 
                      Ajuste suas alocações para que o total corresponda exatamente ao seu orçamento mensal.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      case 4:
        return (
          <div className="space-y-6">
            <h4 className="font-medium text-center mb-2">Resumo do seu Orçamento</h4>
            
            <div className="rounded-lg border p-4">
              <div className="space-y-4">
                <div className="flex justify-between font-medium">
                  <span>Total do Orçamento Mensal:</span>
                  <span>{formatCurrency(totalBudget)}</span>
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Despesas:</span>
                    <span>{formatCurrency(categoryAllocations.reduce((acc, item) => acc + item.amount, 0))}</span>
                  </div>
                  <Progress 
                    value={(categoryAllocations.reduce((acc, item) => acc + item.amount, 0) / totalBudget) * 100} 
                    className="h-2" 
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-muted-foreground">
                      {((categoryAllocations.reduce((acc, item) => acc + item.amount, 0) / totalBudget) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span>Metas e Economias:</span>
                    <span>{formatCurrency(goalAllocations.reduce((acc, item) => acc + item.amount, 0))}</span>
                  </div>
                  <Progress 
                    value={(goalAllocations.reduce((acc, item) => acc + item.amount, 0) / totalBudget) * 100} 
                    className="h-2 bg-blue-200" 
                  />
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-muted-foreground">
                      {((goalAllocations.reduce((acc, item) => acc + item.amount, 0) / totalBudget) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {remainingAmount !== 0 && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span>Não Alocado:</span>
                      <span className={remainingAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {formatCurrency(remainingAmount)}
                      </span>
                    </div>
                    <Progress 
                      value={(Math.abs(remainingAmount) / totalBudget) * 100} 
                      className={`h-2 ${remainingAmount >= 0 ? 'bg-green-200' : 'bg-red-200'}`} 
                    />
                    <div className="flex justify-end mt-1">
                      <span className="text-xs text-muted-foreground">
                        {((Math.abs(remainingAmount) / totalBudget) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-1 mt-4">
              <h5 className="font-medium">Top 5 Categorias de Despesa:</h5>
              <div className="space-y-2">
                {categoryAllocations
                  .sort((a, b) => b.amount - a.amount)
                  .slice(0, 5)
                  .map((allocation) => (
                    <div key={allocation.category} className="flex justify-between">
                      <span>{allocation.category}:</span>
                      <span>{formatCurrency(allocation.amount)} ({allocation.percentage.toFixed(1)}%)</span>
                    </div>
                  ))}
              </div>
            </div>
            
            {isUnbalanced && (
              <div className="rounded-lg border border-destructive p-4 bg-destructive/10 mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="text-destructive h-5 w-5 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-destructive">Atenção!</h4>
                    <p className="text-sm mt-1">
                      Este orçamento ainda não está balanceado. 
                      {remainingAmount > 0 
                        ? 'Você ainda tem valores não alocados.' 
                        : 'Suas despesas excedem seu orçamento total.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {currentStep === 1 ? 'Novo Orçamento' : 
             currentStep === 2 ? 'Alocar para Despesas' : 
             currentStep === 3 ? 'Definir Metas e Economias' : 
             'Revisar e Finalizar'}
          </DialogTitle>
          <DialogDescription>
            {format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
          </DialogDescription>
        </DialogHeader>
        
        {/* Progress indicator */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Passo {currentStep} de {totalSteps}</span>
            <span>
              {currentStep === 1 ? 'Definir Orçamento Total' : 
               currentStep === 2 ? 'Alocar Despesas' : 
               currentStep === 3 ? 'Definir Metas' : 
               'Revisar e Finalizar'}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            ></div>
          </div>
        </div>
        
        {/* Step content */}
        {renderStepContent()}
        
        {/* Navigation buttons */}
        <DialogFooter className="flex justify-between">
          <div>
            {currentStep > 1 && (
              <Button variant="outline" onClick={prevStep}>
                Voltar
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            {currentStep < totalSteps ? (
              <Button onClick={nextStep}>
                Próximo
              </Button>
            ) : (
              <Button 
                onClick={handleSaveBudget} 
                disabled={isUnbalanced}
                variant="default"
              >
                Salvar Orçamento
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
