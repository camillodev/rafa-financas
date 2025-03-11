
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { BarChart, Plus, PlusCircle, Trash2, ArrowRight, InfoIcon, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Category, BudgetGoal } from '@/types/finance';
import { toast } from "sonner";
import { format, getDaysInMonth, getDay, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface BudgetCreationFormProps {
  categories: Category[];
  formatCurrency: (value: number) => string;
  onSave: (budgets: BudgetGoal[]) => void;
  currentDate: Date;
  existingBudgets?: BudgetGoal[];
  onCancel: () => void;
}

export function BudgetCreationForm({
  categories,
  formatCurrency,
  onSave,
  currentDate,
  existingBudgets,
  onCancel
}: BudgetCreationFormProps) {
  // Get expense categories only
  const expenseCategories = categories.filter(cat => cat.type === 'expense');
  
  // State for total budget amount
  const [totalBudget, setTotalBudget] = useState(10000);
  
  // State for category allocations
  const [categoryAllocations, setCategoryAllocations] = useState<Record<string, number>>({});
  
  // State for goals allocation
  const [goalsAllocation, setGoalsAllocation] = useState(2000);
  
  // State for confirmation dialog
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // Calculate days remaining in month for daily budget
  const calculateDaysRemaining = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const monthToCheck = currentDate.getMonth();
    
    // If we're budgeting for current month, calculate days remaining
    if (currentMonth === monthToCheck && today.getFullYear() === currentDate.getFullYear()) {
      const lastDay = endOfMonth(today).getDate();
      const currentDay = today.getDate();
      return lastDay - currentDay + 1;
    } else {
      // If budgeting for future month, return total days in month
      return getDaysInMonth(currentDate);
    }
  };
  
  // Calculate weeks remaining in month
  const calculateWeeksRemaining = () => {
    const daysRemaining = calculateDaysRemaining();
    return Math.ceil(daysRemaining / 7);
  };
  
  // Calculate remaining budget
  const calculateRemainingBudget = () => {
    const totalAllocated = Object.values(categoryAllocations).reduce((sum, amount) => sum + amount, 0) + goalsAllocation;
    return totalBudget - totalAllocated;
  };
  
  // Calculate daily and weekly remaining budget
  const remainingBudget = calculateRemainingBudget();
  const daysRemaining = calculateDaysRemaining();
  const weeksRemaining = calculateWeeksRemaining();
  const dailyRemaining = remainingBudget > 0 ? remainingBudget / daysRemaining : 0;
  const weeklyRemaining = remainingBudget > 0 ? remainingBudget / weeksRemaining : 0;
  
  // Initialize allocations from existing budgets if provided
  useEffect(() => {
    if (existingBudgets && existingBudgets.length > 0) {
      const newAllocations: Record<string, number> = {};
      let totalAmount = 0;
      let goalsAmount = 0;
      
      existingBudgets.forEach(budget => {
        if (categories.find(c => c.name === budget.category && c.type === 'expense')) {
          newAllocations[budget.category] = budget.amount;
          totalAmount += budget.amount;
        } else if (budget.category === 'Metas' || budget.category === 'Goals') {
          goalsAmount = budget.amount;
          totalAmount += budget.amount;
        }
      });
      
      setCategoryAllocations(newAllocations);
      setGoalsAllocation(goalsAmount);
      setTotalBudget(totalAmount + 1000); // Add a buffer to the total
    } else {
      // Initialize with zero for all expense categories
      const initialAllocations: Record<string, number> = {};
      expenseCategories.forEach(category => {
        initialAllocations[category.name] = 0;
      });
      setCategoryAllocations(initialAllocations);
    }
  }, [existingBudgets, categories]);
  
  // Handle total budget input change
  const handleTotalBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setTotalBudget(value);
  };
  
  // Handle category allocation change
  const handleCategoryAllocationChange = (category: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setCategoryAllocations(prev => ({
      ...prev,
      [category]: value
    }));
  };
  
  // Handle goals allocation change
  const handleGoalsAllocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setGoalsAllocation(value);
  };
  
  // Handle adding a new category
  const handleAddCategory = () => {
    // This would integrate with the category creation flow
    toast.info("Funcionalidade para adicionar nova categoria será implementada em breve.");
  };
  
  // Handle saving budget
  const handleSave = () => {
    const remaining = calculateRemainingBudget();
    if (remaining > 0) {
      setShowConfirmation(true);
    } else {
      saveBudgets();
    }
  };
  
  // Save budgets
  const saveBudgets = () => {
    const budgets: BudgetGoal[] = [];
    
    // Add expense category budgets
    Object.entries(categoryAllocations).forEach(([category, amount]) => {
      if (amount > 0) {
        budgets.push({
          category,
          amount,
          spent: 0,
          period: 'monthly'
        });
      }
    });
    
    // Add goals budget
    if (goalsAllocation > 0) {
      budgets.push({
        category: 'Metas',
        amount: goalsAllocation,
        spent: 0,
        period: 'monthly'
      });
    }
    
    onSave(budgets);
  };
  
  // Calculate allocation percentages
  const totalAllocated = Object.values(categoryAllocations).reduce((sum, amount) => sum + amount, 0) + goalsAllocation;
  const allocatedPercentage = (totalAllocated / totalBudget) * 100;
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">
          Configuração de Orçamento para {format(currentDate, 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
        </h2>
        <p className="text-sm text-muted-foreground">
          Defina o orçamento total e distribua os valores entre categorias e metas.
        </p>
      </div>
      
      <div className="space-y-4 p-4 border rounded-md bg-background">
        <div className="space-y-2">
          <Label htmlFor="totalBudget">Orçamento Total (Renda Mensal)</Label>
          <Input
            id="totalBudget"
            type="number"
            value={totalBudget}
            onChange={handleTotalBudgetChange}
            min={0}
            step={100}
            className="text-lg"
          />
        </div>
        
        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
              <BarChart className="mr-2 h-4 w-4 text-primary" />
              <h3 className="font-medium">Alocação de Recursos</h3>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-muted-foreground mr-2">
                Alocado: {formatCurrency(totalAllocated)} ({allocatedPercentage.toFixed(1)}%)
              </span>
              <Badge 
                variant={allocatedPercentage > 100 ? "destructive" : allocatedPercentage === 100 ? "success" : "default"}
                className="ml-2"
              >
                {allocatedPercentage > 100 ? "Excedido" : allocatedPercentage === 100 ? "Balanceado" : "Incompleto"}
              </Badge>
            </div>
          </div>
          
          <Progress 
            value={Math.min(allocatedPercentage, 100)} 
            className="h-2 mb-4"
            indicatorClassName={
              allocatedPercentage > 100 ? "bg-destructive" : 
              allocatedPercentage === 100 ? "bg-green-500" : "bg-primary"
            }
          />
          
          {allocatedPercentage > 100 && (
            <div className="p-2 bg-destructive/10 border border-destructive rounded-md mb-4 text-sm text-destructive">
              Sua alocação excede o orçamento total em {formatCurrency(totalAllocated - totalBudget)}. Reduza as alocações ou aumente o orçamento total.
            </div>
          )}
          
          {calculateRemainingBudget() > 0 && (
            <div className="p-2 bg-primary/10 border border-primary rounded-md mb-4 text-sm">
              <div className="flex justify-between items-center">
                <span>Saldo não alocado:</span>
                <span className="font-semibold">{formatCurrency(calculateRemainingBudget())}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  <span>Valor diário:</span>
                </div>
                <span>{formatCurrency(dailyRemaining)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div className="flex items-center">
                  <Calendar size={14} className="mr-1" />
                  <span>Valor semanal:</span>
                </div>
                <span>{formatCurrency(weeklyRemaining)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-medium text-lg">Categorias de Despesas</h3>
          <Button variant="outline" size="sm" onClick={handleAddCategory}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Nova Categoria
          </Button>
        </div>
        
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
          {expenseCategories.map(category => (
            <div key={category.id} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-5 flex items-center">
                <div 
                  className="w-6 h-6 rounded-full mr-2 flex items-center justify-center"
                  style={{ backgroundColor: category.color }}
                >
                  <BarChart className="h-3 w-3 text-white" />
                </div>
                <span className="font-medium truncate">{category.name}</span>
              </div>
              <div className="col-span-4">
                <Input
                  type="number"
                  min={0}
                  step={100}
                  value={categoryAllocations[category.name] || 0}
                  onChange={(e) => handleCategoryAllocationChange(category.name, e)}
                />
              </div>
              <div className="col-span-3 text-right">
                <span className="text-sm text-muted-foreground">
                  {((categoryAllocations[category.name] || 0) / totalBudget * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
        
        <Separator className="my-4" />
        
        <div className="grid grid-cols-12 gap-4 items-center bg-blue-50/30 p-3 rounded-md border">
          <div className="col-span-5 flex items-center">
            <div className="w-6 h-6 rounded-full bg-blue-500 mr-2 flex items-center justify-center">
              <ArrowRight className="h-3 w-3 text-white" />
            </div>
            <span className="font-medium">Metas e Poupança</span>
          </div>
          <div className="col-span-4">
            <Input
              type="number"
              min={0}
              step={100}
              value={goalsAllocation}
              onChange={handleGoalsAllocationChange}
              className="bg-white"
            />
          </div>
          <div className="col-span-3 text-right">
            <span className="text-sm text-muted-foreground">
              {(goalsAllocation / totalBudget * 100).toFixed(1)}%
            </span>
          </div>
        </div>
        
        <div className="bg-muted/20 p-4 rounded-md mt-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Resumo da Alocação</h3>
            <span className="text-sm">{formatCurrency(totalBudget)}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Total em Despesas:</span>
              <span>{formatCurrency(Object.values(categoryAllocations).reduce((sum, amount) => sum + amount, 0))}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Total em Metas:</span>
              <span>{formatCurrency(goalsAllocation)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between text-sm font-medium">
              <span>Saldo não alocado:</span>
              <span className={calculateRemainingBudget() < 0 ? "text-destructive" : ""}>
                {formatCurrency(calculateRemainingBudget())}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button 
          onClick={handleSave}
          disabled={allocatedPercentage > 100}
        >
          Salvar Orçamento
        </Button>
      </div>
      
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Orçamento não totalmente alocado</AlertDialogTitle>
            <AlertDialogDescription>
              Você ainda tem {formatCurrency(calculateRemainingBudget())} não alocados em seu orçamento. 
              Recomendamos alocar o valor total para um melhor controle financeiro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar e ajustar</AlertDialogCancel>
            <AlertDialogAction onClick={saveBudgets}>Salvar mesmo assim</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
