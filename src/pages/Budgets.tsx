
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { 
  BarChart, Plus, Edit, Trash2, AlertTriangle, MoreHorizontal, Calendar, 
  Coins, CopyIcon, ChevronLeft, ChevronRight, Download, Calculator
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BudgetGoal } from '@/types/finance';
import { toast } from "sonner";
import { format, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label'; // Add this import
import { BudgetCreationForm } from '@/components/budget/BudgetCreationForm';
import { AnnualBudgetView } from '@/components/budget/AnnualBudgetView';

export function Budgets() {
  const { 
    budgetGoals, 
    categories, 
    formatCurrency, 
    addBudgetGoal, 
    updateBudgetGoal, 
    deleteBudgetGoal, 
    filteredTransactions 
  } = useFinance();
  
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
  
  // Update current date when month changes
  useEffect(() => {
    setCurrentDate(new Date(currentYear, currentMonth));
  }, [currentYear, currentMonth]);
  
  // Calculate budget summary
  useEffect(() => {
    const totalExpenses = budgetGoals
      .filter(budget => categories.find(c => c.name === budget.category)?.type === 'expense')
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
  
  const handleConfirmDelete = () => {
    if (editingBudget) {
      deleteBudgetGoal(editingBudget.category);
      setIsDeleteDialogOpen(false);
      toast.success("Orçamento excluído com sucesso");
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
  
  const handleCopyPreviousMonth = () => {
    // Simulate copying from previous month
    toast.success("Orçamento do mês anterior copiado com sucesso");
  };
  
  const handleSaveBudgets = (budgets: BudgetGoal[]) => {
    // Clear existing budgets first
    budgetGoals.forEach(budget => {
      deleteBudgetGoal(budget.category);
    });
    
    // Add all new budgets
    budgets.forEach(budget => {
      addBudgetGoal(budget);
    });
    
    setIsCreateDialogOpen(false);
    toast.success("Orçamento criado com sucesso");
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
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Alocação de Orçamento</CardTitle>
              <CardDescription>
                Distribuição dos seus recursos para o mês de {format(new Date(currentYear, currentMonth), 'MMMM yyyy', { locale: ptBR })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  <Button variant="outline" onClick={() => handleNavigateMonth('prev')} size="sm">
                    <ChevronLeft size={16} />
                    <span className="ml-1">Mês anterior</span>
                  </Button>
                  <h3 className="text-lg font-medium text-center">
                    {format(new Date(currentYear, currentMonth), 'MMMM yyyy', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
                  </h3>
                  <Button variant="outline" onClick={() => handleNavigateMonth('next')} size="sm">
                    <span className="mr-1">Próximo mês</span>
                    <ChevronRight size={16} />
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Receita Total</p>
                        <Badge variant="success">Receitas</Badge>
                      </div>
                      <p className="text-2xl font-bold text-finance-income mt-2">
                        {formatCurrency(budgetSummary.totalIncome)}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Despesas</p>
                        <Badge variant="destructive">Despesas</Badge>
                      </div>
                      <p className="text-2xl font-bold text-finance-expense mt-2">
                        {formatCurrency(budgetSummary.totalExpenses)}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round((budgetSummary.totalExpenses / budgetSummary.totalIncome) * 100)}% da receita
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Metas</p>
                        <Badge className="bg-blue-500">Metas</Badge>
                      </div>
                      <p className="text-2xl font-bold text-blue-500 mt-2">
                        {formatCurrency(budgetSummary.totalGoals)}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.round((budgetSummary.totalGoals / budgetSummary.totalIncome) * 100)}% da receita
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Não Alocado</p>
                        <Button size="sm" variant="outline" className="h-6 px-2 py-0" onClick={handleOpenCreateDialog}>
                          <Calculator size={12} className="mr-1" />
                          <span className="text-xs">Realocar</span>
                        </Button>
                      </div>
                      <p className={`text-2xl font-bold mt-2 ${budgetSummary.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {formatCurrency(budgetSummary.remaining)}
                      </p>
                      <div className="text-xs text-muted-foreground mt-1">
                        {Math.abs(Math.round((budgetSummary.remaining / budgetSummary.totalIncome) * 100))}% 
                        {budgetSummary.remaining >= 0 ? ' disponível' : ' excedido'}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="mt-6 space-y-2">
                  <div className="h-4 w-full bg-accent rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-finance-expense"
                      style={{ width: `${(budgetSummary.totalExpenses / budgetSummary.totalIncome) * 100}%` }}
                    ></div>
                    <div 
                      className="h-full bg-blue-500"
                      style={{ width: `${(budgetSummary.totalGoals / budgetSummary.totalIncome) * 100}%` }}
                    ></div>
                    <div 
                      className={`h-full ${budgetSummary.remaining >= 0 ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ 
                        width: `${Math.min(Math.abs(budgetSummary.remaining) / budgetSummary.totalIncome * 100, 
                          100 - (budgetSummary.totalExpenses + budgetSummary.totalGoals) / budgetSummary.totalIncome * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Despesas: {Math.round((budgetSummary.totalExpenses / budgetSummary.totalIncome) * 100)}%</span>
                    <span>Metas: {Math.round((budgetSummary.totalGoals / budgetSummary.totalIncome) * 100)}%</span>
                    <span>Não Alocado: {Math.round((budgetSummary.remaining / budgetSummary.totalIncome) * 100)}%</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Visão Geral</CardTitle>
                  <CardDescription>Resumo dos seus orçamentos mensais</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Total Orçado:</span>
                      <span className="font-semibold">
                        {formatCurrency(budgetGoals.reduce((acc, budget) => acc + budget.amount, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Gasto:</span>
                      <span className="font-semibold text-finance-expense">
                        {formatCurrency(budgetGoals.reduce((acc, budget) => acc + budget.spent, 0))}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Restante:</span>
                      <span className="font-semibold text-finance-income">
                        {formatCurrency(
                          budgetGoals.reduce((acc, budget) => acc + Math.max(budget.amount - budget.spent, 0), 0)
                        )}
                      </span>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Categorias com alerta:</span>
                        <span className="font-semibold">
                          {calculatedBudgets.filter(b => b.percentage >= 80 && b.percentage < 100).length}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Categorias acima do orçamento:</span>
                        <span className="font-semibold text-destructive">
                          {calculatedBudgets.filter(b => b.percentage >= 100).length}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Limites Diários e Semanais</CardTitle>
                  <CardDescription>
                    Quanto você ainda pode gastar para seguir seu orçamento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {calculatedBudgets
                      .filter(budget => budget.percentage < 100 && budget.percentage >= 50)
                      .sort((a, b) => b.percentage - a.percentage)
                      .slice(0, 3)
                      .map((budget) => (
                        <div key={budget.category} className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{budget.category}</span>
                            <span className={`text-sm ${budget.percentage >= 80 ? 'text-finance-expense' : ''}`}>
                              {budget.percentage}% usado
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Diário:</span>
                            </div>
                            <span className="font-medium">{formatCurrency(budget.dailyRemaining)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>Semanal:</span>
                            </div>
                            <span className="font-medium">{formatCurrency(budget.weeklyRemaining)}</span>
                          </div>
                          <Separator className="my-1" />
                        </div>
                      ))}
                    
                    {calculatedBudgets.filter(budget => budget.percentage < 100 && budget.percentage >= 50).length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        <Coins size={24} className="mx-auto mb-2" />
                        <p>Seus orçamentos estão em bom estado!</p>
                      </div>
                    )}
                    
                    {calculatedBudgets.filter(budget => budget.percentage >= 100).length > 0 && (
                      <>
                        <Separator />
                        <div className="rounded-md border-destructive border bg-destructive/10 p-3">
                          <div className="flex gap-2 items-center">
                            <AlertTriangle className="text-destructive h-5 w-5" />
                            <p className="text-sm font-medium">Orçamentos ultrapassados</p>
                          </div>
                          <ul className="mt-2 space-y-1 text-sm pl-6 list-disc">
                            {calculatedBudgets
                              .filter(budget => budget.percentage >= 100)
                              .map(budget => (
                                <li key={budget.category}>
                                  <span className="font-medium">{budget.category}</span> - Excedido em{' '}
                                  <span className="text-destructive font-medium">
                                    {formatCurrency(budget.spent - budget.amount)}
                                  </span>
                                </li>
                              ))}
                          </ul>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <Separator />
            
            <div className="space-y-6">
              <h3 className="text-lg font-medium">Progresso do Orçamento</h3>
              {calculatedBudgets.map((budget) => {
                return (
                  <div key={budget.category} className="space-y-2">
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
                      {budget.percentage < 100 && (
                        <div className="flex justify-between text-xs text-muted-foreground mt-1">
                          <span>Limite diário: {formatCurrency(budget.dailyRemaining)}</span>
                          <span>Limite semanal: {formatCurrency(budget.weeklyRemaining)}</span>
                        </div>
                      )}
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
            </div>
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
            <Button onClick={() => {
              if (editingBudget) {
                updateBudgetGoal(editingBudget.category, { 
                  amount: editingBudget.amount,
                  period: editingBudget.period 
                });
                setIsEditDialogOpen(false);
                toast.success("Orçamento atualizado com sucesso");
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
