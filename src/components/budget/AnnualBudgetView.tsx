
import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, Save } from 'lucide-react';
import { AnnualBudgetTable } from './AnnualBudgetTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface AnnualBudgetViewProps {
  formatCurrency: (value: number) => string;
  currentYear: number;
  onChangeYear: (year: number) => void;
  onExportData: () => void;
}

export function AnnualBudgetView({ 
  formatCurrency, 
  currentYear,
  onChangeYear,
  onExportData
}: AnnualBudgetViewProps) {
  const queryClient = useQueryClient();
  const [isEditingCell, setIsEditingCell] = useState(false);
  const [currentEditCell, setCurrentEditCell] = useState<{
    category: string;
    categoryId: string;
    month: number;
    value: number;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Fetch categories from Supabase
  const { data: categories = [] } = useQuery({
    queryKey: ['annualBudgetCategories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, type')
        .order('type')
        .order('name');
      
      if (error) throw error;
      return data;
    },
    enabled: !!supabase
  });
  
  // Fetch annual budget data from Supabase
  const { data: annualBudgetData = [], isLoading } = useQuery({
    queryKey: ['annualBudgets', currentYear],
    queryFn: async () => {
      // Get all budgets for the current year
      const { data, error } = await supabase
        .from('budgets')
        .select(`
          id,
          amount,
          month,
          year,
          category_id,
          categories (
            id,
            name,
            type
          )
        `)
        .eq('year', currentYear);
      
      if (error) throw error;
      
      // Group data by category type
      const groupedByType: Record<string, any[]> = {
        income: [],
        expense: [],
        goal: []
      };
      
      // First, create parent categories
      const incomeCategories = categories.filter(c => c.type === 'income');
      const expenseCategories = categories.filter(c => c.type === 'expense');
      const goalCategories = categories.filter(c => c.type === 'goal');
      
      if (incomeCategories.length > 0) {
        groupedByType.income.push({
          category: 'Receitas',
          categoryId: 'income-parent',
          type: 'income',
          values: new Array(12).fill(0),
          isParent: true
        });
      }
      
      if (expenseCategories.length > 0) {
        groupedByType.expense.push({
          category: 'Despesas',
          categoryId: 'expense-parent',
          type: 'expense',
          values: new Array(12).fill(0),
          isParent: true
        });
      }
      
      if (goalCategories.length > 0) {
        groupedByType.goal.push({
          category: 'Metas',
          categoryId: 'goal-parent',
          type: 'goal',
          values: new Array(12).fill(0),
          isParent: true
        });
      }
      
      // Process the budget data
      const catData: Record<string, number[]> = {};
      const catInfo: Record<string, { name: string, type: string, id: string }> = {};
      
      // Initialize category data
      categories.forEach(cat => {
        catData[cat.id] = new Array(12).fill(0);
        catInfo[cat.id] = { 
          name: cat.name, 
          type: cat.type,
          id: cat.id
        };
      });
      
      // Fill in the budget values
      data.forEach(budget => {
        if (budget.categories) {
          const monthIndex = budget.month - 1;
          if (catData[budget.category_id]) {
            catData[budget.category_id][monthIndex] = Number(budget.amount);
            
            // Also update parent totals
            const categoryType = budget.categories.type;
            if (categoryType) {
              const parentIndex = groupedByType[categoryType].findIndex(item => item.isParent);
              if (parentIndex !== -1) {
                groupedByType[categoryType][parentIndex].values[monthIndex] += Number(budget.amount);
              }
            }
          }
        }
      });
      
      // Convert to our data format
      Object.entries(catData).forEach(([catId, values]) => {
        const info = catInfo[catId];
        if (info) {
          const type = info.type;
          groupedByType[type].push({
            category: info.name,
            categoryId: catId,
            type: type as 'income' | 'expense' | 'goal',
            values,
            parentCategory: type === 'income' ? 'Receitas' : type === 'expense' ? 'Despesas' : 'Metas'
          });
        }
      });
      
      // Combine all data in the correct order
      const result = [
        ...groupedByType.income,
        ...groupedByType.expense,
        ...groupedByType.goal
      ];
      
      return result;
    },
    enabled: !!supabase && categories.length > 0
  });
  
  const handleNavigateYear = (direction: 'prev' | 'next') => {
    onChangeYear(direction === 'prev' ? currentYear - 1 : currentYear + 1);
  };
  
  const handleCellClick = (category: string, categoryId: string, month: number, currentValue: number) => {
    // Don't allow editing parent categories
    if (categoryId.endsWith('-parent')) return;
    
    setCurrentEditCell({
      category,
      categoryId,
      month,
      value: currentValue
    });
    setEditValue(currentValue.toString());
    setIsEditingCell(true);
  };
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };
  
  const handleSaveEdit = async () => {
    if (!currentEditCell) return;
    
    const newValue = parseFloat(editValue);
    if (isNaN(newValue)) {
      toast.error("Por favor, insira um valor numérico válido");
      return;
    }
    
    try {
      const monthNumber = currentEditCell.month + 1;
      
      // Check if budget already exists
      const { data: existingBudget, error: fetchError } = await supabase
        .from('budgets')
        .select('id')
        .eq('category_id', currentEditCell.categoryId)
        .eq('month', monthNumber)
        .eq('year', currentYear)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }
      
      if (existingBudget) {
        // Update existing budget
        const { error } = await supabase
          .from('budgets')
          .update({ amount: newValue })
          .eq('id', existingBudget.id);
        
        if (error) throw error;
      } else {
        // Create new budget
        const { error } = await supabase
          .from('budgets')
          .insert({
            category_id: currentEditCell.categoryId,
            amount: newValue,
            month: monthNumber,
            year: currentYear
          });
        
        if (error) throw error;
      }
      
      queryClient.invalidateQueries({ queryKey: ['annualBudgets'] });
      toast.success(`Valor atualizado para ${formatCurrency(newValue)}`);
      setIsEditingCell(false);
    } catch (error) {
      console.error('Error updating budget:', error);
      toast.error("Erro ao atualizar orçamento");
    }
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Visão Anual de Orçamentos</CardTitle>
              <CardDescription>
                Planeje e visualize seus orçamentos para o ano inteiro de {currentYear}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={() => handleNavigateYear('prev')}>
                <ChevronLeft size={16} />
              </Button>
              <span className="font-medium">{currentYear}</span>
              <Button variant="outline" size="icon" onClick={() => handleNavigateYear('next')}>
                <ChevronRight size={16} />
              </Button>
              <Button onClick={onExportData} variant="outline" className="gap-1 ml-4">
                <Download size={16} />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <AnnualBudgetTable 
              year={currentYear} 
              budgetData={annualBudgetData} 
              formatCurrency={formatCurrency}
              onCellClick={handleCellClick}
            />
          )}
          <div className="mt-4 text-sm text-muted-foreground">
            Clique em qualquer valor na tabela para editar o orçamento para aquele mês.
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={isEditingCell} onOpenChange={setIsEditingCell}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar orçamento</DialogTitle>
            <DialogDescription>
              {currentEditCell && `Categoria: ${currentEditCell.category} - Mês: ${new Date(currentYear, currentEditCell.month).toLocaleString('pt-BR', { month: 'long' })}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="budgetValue">Valor do Orçamento</Label>
              <Input
                id="budgetValue"
                type="number"
                min="0"
                step="100"
                value={editValue}
                onChange={handleValueChange}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditingCell(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save size={16} className="mr-2" />
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
