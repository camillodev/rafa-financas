
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Download, Edit, Save } from 'lucide-react';
import { AnnualBudgetTable } from './AnnualBudgetTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

// Sample annual data structure
interface AnnualBudgetItem {
  category: string;
  type: 'income' | 'expense' | 'goal';
  values: number[];
  isParent?: boolean;
  parentCategory?: string;
}

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
  const [isEditingCell, setIsEditingCell] = useState(false);
  const [currentEditCell, setCurrentEditCell] = useState<{
    category: string;
    month: number;
    value: number;
  } | null>(null);
  const [editValue, setEditValue] = useState('');
  
  // Sample data generation - in a real app, this would come from props or a context
  const generateSampleData = (): AnnualBudgetItem[] => {
    // Parent categories
    const incomeCategory: AnnualBudgetItem = {
      category: 'Receitas',
      type: 'income',
      values: Array(12).fill(0).map(() => 8000 + Math.random() * 4000),
      isParent: true
    };
    
    // Income subcategories
    const salaryCategory: AnnualBudgetItem = {
      category: 'Salário',
      type: 'income',
      values: Array(12).fill(0).map(() => 6000 + Math.random() * 1000),
      parentCategory: 'Receitas'
    };
    
    const extraIncomeCategory: AnnualBudgetItem = {
      category: 'Renda extra',
      type: 'income',
      values: Array(12).fill(0).map(() => 2000 + Math.random() * 1000),
      parentCategory: 'Receitas'
    };
    
    // Parent expense category
    const expenseCategory: AnnualBudgetItem = {
      category: 'Despesas',
      type: 'expense',
      values: Array(12).fill(0).map(() => 5000 + Math.random() * 3000),
      isParent: true
    };
    
    // Expense subcategories
    const housingCategory: AnnualBudgetItem = {
      category: 'Moradia',
      type: 'expense',
      values: Array(12).fill(0).map(() => 2000 + Math.random() * 500),
      parentCategory: 'Despesas'
    };
    
    const foodCategory: AnnualBudgetItem = {
      category: 'Alimentação',
      type: 'expense',
      values: Array(12).fill(0).map(() => 1000 + Math.random() * 500),
      parentCategory: 'Despesas'
    };
    
    const transportCategory: AnnualBudgetItem = {
      category: 'Transporte',
      type: 'expense',
      values: Array(12).fill(0).map(() => 500 + Math.random() * 200),
      parentCategory: 'Despesas'
    };
    
    const entertainmentCategory: AnnualBudgetItem = {
      category: 'Lazer',
      type: 'expense',
      values: Array(12).fill(0).map(() => 300 + Math.random() * 200),
      parentCategory: 'Despesas'
    };
    
    // Goals category
    const goalsCategory: AnnualBudgetItem = {
      category: 'Metas',
      type: 'goal',
      values: Array(12).fill(0).map(() => 1000 + Math.random() * 1000),
      isParent: true
    };
    
    return [
      incomeCategory,
      salaryCategory,
      extraIncomeCategory,
      expenseCategory,
      housingCategory,
      foodCategory,
      transportCategory,
      entertainmentCategory,
      goalsCategory
    ];
  };
  
  const budgetData = generateSampleData();
  
  const handleNavigateYear = (direction: 'prev' | 'next') => {
    onChangeYear(direction === 'prev' ? currentYear - 1 : currentYear + 1);
  };
  
  const handleCellClick = (category: string, month: number, currentValue: number) => {
    // Fix: use direct object assignment instead of property that doesn't exist in type
    setCurrentEditCell({
      category,
      month,
      value: currentValue
    });
    setEditValue(currentValue.toString());
    setIsEditingCell(true);
  };
  
  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditValue(e.target.value);
  };
  
  const handleSaveEdit = () => {
    if (!currentEditCell) return;
    
    const newValue = parseFloat(editValue);
    if (isNaN(newValue)) {
      toast.error("Por favor, insira um valor numérico válido");
      return;
    }
    
    // Here you would update the actual data in your state/context
    toast.success(`Valor atualizado para ${formatCurrency(newValue)}`);
    setIsEditingCell(false);
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
          <AnnualBudgetTable 
            year={currentYear} 
            budgetData={budgetData} 
            formatCurrency={formatCurrency}
            onCellClick={handleCellClick}
          />
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
