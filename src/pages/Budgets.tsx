
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { 
  BarChart, Plus, Edit, Trash2, AlertTriangle, MoreHorizontal,
  CopyIcon, ChevronLeft, ChevronRight, Download, Calculator
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from "sonner";
import { BudgetCreationForm } from '@/components/budget/BudgetCreationForm';
import { AnnualBudgetView } from '@/components/budget/AnnualBudgetView';
import { BudgetGoal } from '@/types/finance';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export function Budgets() {
  const { 
    categories, 
    formatCurrency,
    filteredTransactions 
  } = useFinance();
  
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetGoal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState("current");
  
  // Budget summary state
  const [budgetSummary, setBudgetSummary] = useState({
    totalIncome: 0,
    totalExpenses: 0,
    totalGoals: 0,
    remaining: 0
  });
  
  // Fetch budget data from Supabase
  const { data: budgetGoals = [], isLoading: isLoadingBudgets } = useQuery({
    queryKey: ['budgets', currentYear, currentMonth + 1],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          id,
          amount,
          category_id,
          month,
          year,
          categories (
            name,
            type,
            color,
            icon
          )
        `)
        .eq('month', currentMonth + 1)
        .eq('year', currentYear);
      
      if (error) {
        console.error('Error fetching budgets:', error);
        throw error;
      }
      
      // Calculate spent amounts for each budget
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions')
        .select('amount, category_id, date')
        .gte('date', `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-01`)
        .lt('date', `${currentMonth === 11 ? currentYear + 1 : currentYear}-${String(currentMonth === 11 ? 1 : currentMonth + 2).padStart(2, '0')}-01`)
        .eq('transaction_type', 'expense');
      
      if (transactionsError) {
        console.error('Error fetching transactions:', transactionsError);
      }
      
      // Transform the data to match the BudgetGoal type
      return (data || []).map(budget => {
        const categoryTransactions = transactions ? transactions.filter(
          t => t.category_id === budget.category_id
        ) : [];
        
        const spent = categoryTransactions.reduce((sum, t) => sum + Number(t.amount), 0);
        
        return {
          id: budget.id, // Ensure id is included
          category: budget.categories.name,
          amount: Number(budget.amount),
          spent: spent,
          period: 'monthly' as const, // Use const assertion to ensure correct type
          categoryId: budget.category_id
        };
      });
    },
    enabled: !!supabase
  });
  
  // Update current date when month changes
  useEffect(() => {
    setCurrentDate(new Date(currentYear, currentMonth));
  }, [currentYear, currentMonth]);
  
  // Calculate budget summary
  useEffect(() => {
    const totalExpenses = budgetGoals
      .filter(budget => {
        const category = categories.find(c => c.name === budget.category);
        return category?.type === 'expense';
      })
      .reduce((acc, budget) => acc + budget.amount, 0);
      
    const totalIncome = 10000; // This would come from income budgets in a real app
    const totalGoals = budgetGoals
      .filter(budget => budget.category === 'Metas' || budget.category === 'Goals')
      .reduce((acc, budget) => acc + budget.amount, 0);
    
    setBudgetSummary({
      totalIncome,
      totalExpenses,
      totalGoals,
      remaining: totalIncome - totalExpenses - totalGoals
    });
  }, [budgetGoals, categories]);
  
  // Calculate daily and weekly remaining for each budget
  const calculateRemainingBudgets = () => {
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - currentDate.getDate() + 1;
    const remainingWeeks = Math.ceil(remainingDays / 7);
    
    return budgetGoals
      .filter(budget => {
        // Only show expense category budgets 
        const category = categories.find(c => c.name === budget.category);
        return category?.type === 'expense';
      })
      .map((budget) => {
        const remaining = budget.amount - budget.spent;
        const dailyRemaining = remaining > 0 ? remaining / remainingDays : 0;
        const weeklyRemaining = remaining > 0 ? remaining / remainingWeeks : 0;
        const percentage = Math.round((budget.spent / budget.amount) * 100);
        
        return {
          ...budget,
          dailyRemaining,
          weeklyRemaining,
          percentage,
          isOverBudget: percentage >= 100
        };
      });
  };
  
  const calculatedBudgets = calculateRemainingBudgets();
  
  const handleOpenCreateDialog = () => {
    setIsCreateDialogOpen(true);
  };
  
  const handleOpenEditDialog = (budget: BudgetGoal) => {
    setEditingBudget(budget);
    setIsEditDialogOpen(true);
  };
  
  const handleDeleteDialog = (budget: BudgetGoal) => {
    setEditingBudget(budget);
    setIsDeleteDialogOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (editingBudget?.id) {
      try {
        const { error } = await supabase
          .from('budgets')
          .delete()
          .eq('id', editingBudget.id);
        
        if (error) throw error;
        
        queryClient.invalidateQueries({ queryKey: ['budgets'] });
        setIsDeleteDialogOpen(false);
        toast.success("Orçamento excluído com sucesso");
      } catch (error) {
        console.error('Error deleting budget:', error);
        toast.error("Erro ao excluir orçamento");
      }
    }
  };
  
  const handleNavigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prevMonth => {
      if (direction === 'prev') {
        if (prevMonth === 0) {
          setCurrentYear(prevYear => prevYear - 1);
          return 11;
        }
        return prevMonth - 1;
      } else {
        if (prevMonth === 11) {
          setCurrentYear(prevYear => prevYear + 1);
          return 0;
        }
        return prevMonth + 1;
      }
    });
  };
  
  const handleCopyPreviousMonth = async () => {
    try {
      // Get previous month budgets
      const prevMonth = currentMonth === 0 ? 12 : currentMonth;
      const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      const { data: previousBudgets, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', prevMonth)
        .eq('year', prevYear);
      
      if (error) throw error;
      
      // Delete current month budgets first
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('month', currentMonth + 1)
        .eq('year', currentYear);
      
      if (deleteError) throw deleteError;
      
      // Insert previous month budgets as current month budgets
      if (previousBudgets && previousBudgets.length > 0) {
        const newBudgets = previousBudgets.map(budget => ({
          category_id: budget.category_id,
          amount: budget.amount,
          month: currentMonth + 1,
          year: currentYear,
          user_id: budget.user_id
        }));
        
        const { error: insertError } = await supabase
          .from('budgets')
          .insert(newBudgets);
        
        if (insertError) throw insertError;
      }
      
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      toast.success("Orçamento do mês anterior copiado com sucesso");
    } catch (error) {
      console.error('Error copying previous month budgets:', error);
      toast.error("Erro ao copiar orçamento do mês anterior");
    }
  };
  
  const handleSaveBudgets = async (budgets: BudgetGoal[]) => {
    try {
      // First, get the category IDs for each budget
      const budgetsWithCategoryIds = budgets.map(budget => {
        const category = categories.find(c => c.name === budget.category);
        return {
          ...budget,
          categoryId: category?.id || budget.categoryId
        };
      });
      
      // Delete all existing budgets for the current month/year
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('month', currentMonth + 1)
        .eq('year', currentYear);
      
      if (deleteError) throw deleteError;
      
      // Insert the new budgets
      const supabaseBudgets = budgetsWithCategoryIds.map(budget => ({
        category_id: budget.categoryId,
        amount: budget.amount,
        month: currentMonth + 1,
        year: currentYear
      }));
      
      const { error: insertError } = await supabase
        .from('budgets')
        .insert(supabaseBudgets);
      
      if (insertError) throw insertError;
      
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      setIsCreateDialogOpen(false);
      toast.success("Orçamento criado com sucesso");
    } catch (error) {
      console.error('Error saving budgets:', error);
      toast.error("Erro ao salvar orçamentos");
    }
  };
  
  const exportBudgetData = () => {
    let csvContent = '';
    
    if (activeTab === 'current') {
      // Export current month budget data
      csvContent = 'Categoria,Valor Orçado,Valor Gasto,Restante,Percentual Usado\n';
      
      calculatedBudgets.forEach(budget => {
        const row = [
          budget.category,
          budget.amount,
          budget.spent,
          Math.max(budget.amount - budget.spent, 0),
          budget.percentage
        ].join(',');
        
        csvContent += row + '\n';
      });
    } else {
      // Export annual budget data
      csvContent = 'Categoria,Jan,Fev,Mar,Abr,Mai,Jun,Jul,Ago,Set,Out,Nov,Dez,Total\n';
      
      // This is just a placeholder - in a real app you'd use actual data
      const months = Array.from({ length: 12 });
      
      categories
        .filter(cat => cat.type === 'expense')
        .forEach(category => {
          const monthlyValues = months.map(() => Math.round(Math.random() * 5000));
          const total = monthlyValues.reduce((acc, value) => acc + value, 0);
          const row = [category.name, ...monthlyValues, total].join(',');
          csvContent += row + '\n';
        });
    }
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rafa-financas-orcamentos-${activeTab === 'current' ? 
      format(new Date(currentYear, currentMonth), 'MMM-yyyy', { locale: ptBR }) : 
      currentYear.toString()}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Orçamento exportado com sucesso");
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e acompanhe seus limites de gastos por categoria
        </p>
      </div>
      
      <Tabs defaultValue="current" onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between mb-6">
          <TabsList>
            <TabsTrigger value="current">Mês Atual</TabsTrigger>
            <TabsTrigger value="annual">Visão Anual</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            {activeTab === "current" && (
              <>
                <Button onClick={handleCopyPreviousMonth} variant="outline" className="gap-1">
                  <CopyIcon size={16} />
                  <span>Copiar do Mês Anterior</span>
                </Button>
                <Button onClick={exportBudgetData} variant="outline" className="gap-1">
                  <Download size={16} />
                  <span className="hidden sm:inline">Exportar</span>
                </Button>
                <Button onClick={handleOpenCreateDialog} className="gap-1">
                  <Plus size={16} />
                  <span className="hidden sm:inline">Novo Orçamento</span>
                </Button>
              </>
            )}
            {activeTab === "annual" && (
              <Button onClick={exportBudgetData} variant="outline" className="gap-1">
                <Download size={16} />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            )}
          </div>
        </div>
        
        <TabsContent value="current" className="space-y-6">
          <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-medium">Progresso do Orçamento</h3>
            {isLoadingBudgets ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                {calculatedBudgets.map((budget) => {
                  return (
                    <div key={budget.id || budget.category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <BarChart size={18} className="text-primary" />
                          </div>
                          <span className="font-medium">{budget.category}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            <span 
                              className={`font-medium ${
                                budget.percentage > 100 
                                  ? 'text-destructive' 
                                  : budget.percentage > 80 
                                    ? 'text-finance-expense' 
                                    : 'text-foreground'
                              }`}
                            >
                              {formatCurrency(budget.spent)}
                            </span>
                            <span className="text-muted-foreground"> / {formatCurrency(budget.amount)}</span>
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal size={16} className="text-muted-foreground" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleOpenEditDialog(budget)}>
                                <Edit size={16} className="mr-2" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleDeleteDialog(budget)} 
                                className="text-destructive"
                              >
                                <Trash2 size={16} className="mr-2" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                          <div 
                            className={`h-full transition-all duration-500 ease-out rounded-full ${
                              budget.percentage >= 100 
                                ? 'bg-destructive' 
                                : budget.percentage >= 80 
                                  ? 'bg-finance-expense' 
                                  : 'bg-primary'
                            }`}
                            style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{budget.percentage}% usado</span>
                          <span>
                            {formatCurrency(Math.max(budget.amount - budget.spent, 0))} restante
                          </span>
                        </div>
                        {budget.percentage >= 100 && (
                          <div className="flex items-center gap-1 text-xs text-destructive mt-1">
                            <AlertTriangle size={12} />
                            <span>Orçamento excedido em {formatCurrency(budget.spent - budget.amount)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                {calculatedBudgets.length === 0 && (
                  <div className="text-center py-12 border rounded-lg bg-muted/20">
                    <BarChart size={48} className="mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Nenhum orçamento definido</h3>
                    <p className="text-muted-foreground mb-4">
                      Defina orçamentos para acompanhar seus gastos por categoria
                    </p>
                    <Button onClick={handleOpenCreateDialog}>
                      <Plus size={16} className="mr-2" />
                      Adicionar orçamento
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="annual">
          <AnnualBudgetView 
            formatCurrency={formatCurrency}
            currentYear={currentYear}
            onChangeYear={setCurrentYear}
            onExportData={exportBudgetData}
          />
        </TabsContent>
      </Tabs>
      
      {/* Budget Creation Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Criar Novo Orçamento</DialogTitle>
            <DialogDescription>
              Defina o orçamento total e distribua entre as diferentes categorias
            </DialogDescription>
          </DialogHeader>
          
          <BudgetCreationForm 
            categories={categories}
            formatCurrency={formatCurrency}
            onSave={handleSaveBudgets}
            currentDate={currentDate}
            existingBudgets={budgetGoals}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Edit Budget Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Orçamento</DialogTitle>
            <DialogDescription>
              Ajuste o valor do orçamento para {editingBudget?.category}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="editAmount" className="text-right">
                Valor Limite
              </Label>
              <input
                id="editAmount"
                type="number"
                min="0"
                step="0.01"
                value={editingBudget?.amount}
                onChange={(e) => {
                  if (editingBudget) {
                    setEditingBudget({
                      ...editingBudget,
                      amount: parseFloat(e.target.value) || 0
                    });
                  }
                }}
                className="col-span-3 h-10 rounded-md border border-input bg-background px-3 py-2"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={async () => {
              if (editingBudget?.id) {
                try {
                  const { error } = await supabase
                    .from('budgets')
                    .update({ amount: editingBudget.amount })
                    .eq('id', editingBudget.id);
                  
                  if (error) throw error;
                  
                  queryClient.invalidateQueries({ queryKey: ['budgets'] });
                  setIsEditDialogOpen(false);
                  toast.success("Orçamento atualizado com sucesso");
                } catch (error) {
                  console.error('Error updating budget:', error);
                  toast.error("Erro ao atualizar orçamento");
                }
              }
            }}>
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Orçamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o orçamento para a categoria "{editingBudget?.category}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default Budgets;
