
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { BarChart, Plus, Edit, Trash2, AlertTriangle, MoreHorizontal, Calendar, Coins } from 'lucide-react';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BudgetGoal } from '@/types/finance';
import { toast } from "sonner";

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
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetGoal | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    category: '',
    amount: 0,
    period: 'monthly' as 'daily' | 'weekly' | 'monthly' | 'yearly'
  });
  
  // Calculate daily and weekly remaining for each budget
  const calculateRemainingBudgets = () => {
    const currentDate = new Date();
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const remainingDays = daysInMonth - currentDate.getDate() + 1;
    const remainingWeeks = Math.ceil(remainingDays / 7);
    
    return budgetGoals.map((budget) => {
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
  
  const handleOpenAddDialog = () => {
    setEditingBudget(null);
    setFormData({
      category: categories.filter(cat => cat.type === 'expense')[0]?.name || '',
      amount: 0,
      period: 'monthly'
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenEditDialog = (budget: BudgetGoal) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount,
      period: budget.period
    });
    setIsDialogOpen(true);
  };
  
  const handleDeleteDialog = (budget: BudgetGoal) => {
    setEditingBudget(budget);
    setIsDeleteDialogOpen(true);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const budgetData = {
      category: formData.category,
      amount: formData.amount,
      period: formData.period,
    };
    
    if (editingBudget) {
      updateBudgetGoal(editingBudget.category, budgetData);
      toast.success("Orçamento atualizado com sucesso");
    } else {
      addBudgetGoal(budgetData);
      toast.success("Orçamento adicionado com sucesso");
    }
    
    setIsDialogOpen(false);
  };
  
  const handleConfirmDelete = () => {
    if (editingBudget) {
      deleteBudgetGoal(editingBudget.category);
      setIsDeleteDialogOpen(false);
      toast.success("Orçamento excluído com sucesso");
    }
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Orçamentos</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie e acompanhe seus limites de gastos por categoria
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <div></div>
        <Button onClick={handleOpenAddDialog} className="gap-1">
          <Plus size={16} />
          <span>Novo Orçamento</span>
        </Button>
      </div>
      
      <div className="rounded-xl border bg-card shadow-sm p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Budget Summary Card */}
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
          
          {/* Daily/Weekly Spending Card */}
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
        
        {/* Budget Progress List */}
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
        </div>
      </div>
      
      {/* Add/Edit Budget Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Editar Orçamento' : 'Novo Orçamento'}</DialogTitle>
            <DialogDescription>
              {editingBudget 
                ? 'Edite os detalhes do orçamento para esta categoria.'
                : 'Defina um novo limite de orçamento para uma categoria.'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Categoria
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                  disabled={!!editingBudget}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories
                      .filter(cat => cat.type === 'expense')
                      .map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Valor Limite
                </Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="period" className="text-right">
                  Período
                </Label>
                <Select 
                  value={formData.period} 
                  onValueChange={(value) => handleSelectChange('period', value as 'daily' | 'weekly' | 'monthly' | 'yearly')}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="submit">
                {editingBudget ? 'Salvar Alterações' : 'Criar Orçamento'}
              </Button>
            </DialogFooter>
          </form>
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
