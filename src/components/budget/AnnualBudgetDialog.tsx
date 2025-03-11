
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFinance } from '@/context/FinanceContext';
import { ChevronDown, ChevronUp, Calendar, Copy, ArrowRight } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AnnualBudgetDialogProps {
  isOpen: boolean;
  onClose: () => void;
  currentYear: number;
}

type MonthlyBudget = {
  month: number;
  categories: {
    [category: string]: number;
  };
  income: number;
  expenses: number;
  goals: number;
};

export function AnnualBudgetDialog({ isOpen, onClose, currentYear }: AnnualBudgetDialogProps) {
  const { categories, budgetGoals, formatCurrency } = useFinance();
  const [annualBudget, setAnnualBudget] = useState<MonthlyBudget[]>([]);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [isApplyingChange, setIsApplyingChange] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [newValue, setNewValue] = useState(0);
  
  // Month names
  const monthNames = Array.from({ length: 12 }, (_, i) => 
    format(new Date(currentYear, i, 1), 'MMM', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())
  );
  
  // Initialize annual budget data
  useEffect(() => {
    if (isOpen) {
      // Generate mock data for annual budget
      const mockAnnualBudget: MonthlyBudget[] = Array.from({ length: 12 }, (_, monthIndex) => {
        // Base income increases slightly each month
        const baseIncome = 10000 + (monthIndex * 200);
        
        // Categories with amounts
        const categoryBudgets: { [category: string]: number } = {};
        
        categories
          .filter(cat => cat.type === 'expense')
          .forEach(category => {
            // Find existing budget for this category
            const existingBudget = budgetGoals.find(b => b.category === category.name);
            
            // Base value from existing budget or generate a random one
            const baseValue = existingBudget 
              ? existingBudget.amount 
              : Math.round(500 + Math.random() * 2000);
            
            // Add some variation for future months
            let monthlyValue = baseValue;
            
            // Seasonal adjustments
            if (category.name === 'Lazer' && [5, 6, 11].includes(monthIndex)) {
              // More leisure in summer and December
              monthlyValue *= 1.3;
            } else if (category.name === 'Educação' && [1, 7].includes(monthIndex)) {
              // More education expenses in February and August (school periods)
              monthlyValue *= 1.2;
            }
            
            categoryBudgets[category.name] = Math.round(monthlyValue);
          });
        
        // Calculate total expenses
        const totalExpenses = Object.values(categoryBudgets).reduce((sum, value) => sum + value, 0);
        
        // Goals are roughly 20% of income
        const goals = Math.round(baseIncome * 0.2);
        
        return {
          month: monthIndex,
          categories: categoryBudgets,
          income: baseIncome,
          expenses: totalExpenses,
          goals: goals
        };
      });
      
      setAnnualBudget(mockAnnualBudget);
    }
  }, [isOpen, budgetGoals, categories]);
  
  const toggleCategoryExpansion = (category: string) => {
    setExpandedCategory(expandedCategory === category ? null : category);
  };
  
  const getTotalForYear = () => {
    return {
      income: annualBudget.reduce((sum, month) => sum + month.income, 0),
      expenses: annualBudget.reduce((sum, month) => sum + month.expenses, 0),
      goals: annualBudget.reduce((sum, month) => sum + month.goals, 0)
    };
  };
  
  const getMonthClass = (monthIndex: number) => {
    return selectedMonths.includes(monthIndex) ? 'bg-primary/10' : '';
  };
  
  const handleMonthSelection = (monthIndex: number) => {
    setSelectedMonths(prev => {
      if (prev.includes(monthIndex)) {
        return prev.filter(m => m !== monthIndex);
      } else {
        return [...prev, monthIndex];
      }
    });
  };
  
  const handleCategorySelection = (category: string) => {
    setSelectedCategory(category);
    // Pre-populate with the first selected month's value or 0
    if (selectedMonths.length > 0 && category) {
      const firstMonth = selectedMonths[0];
      setNewValue(annualBudget[firstMonth].categories[category] || 0);
    } else {
      setNewValue(0);
    }
  };
  
  const handleApplyChange = () => {
    if (!selectedCategory || selectedMonths.length === 0) {
      toast.error("Selecione uma categoria e pelo menos um mês para aplicar as mudanças");
      return;
    }
    
    setIsApplyingChange(true);
    
    // Update budget for selected months and category
    const updatedBudget = annualBudget.map((month, index) => {
      if (selectedMonths.includes(index)) {
        // Update this month's data
        const updatedCategories = { ...month.categories };
        updatedCategories[selectedCategory] = newValue;
        
        // Recalculate total expenses
        const updatedExpenses = Object.values(updatedCategories).reduce((sum, value) => sum + value, 0);
        
        return {
          ...month,
          categories: updatedCategories,
          expenses: updatedExpenses
        };
      }
      return month;
    });
    
    setAnnualBudget(updatedBudget);
    toast.success(`Valor atualizado para ${selectedMonths.length} ${selectedMonths.length === 1 ? 'mês' : 'meses'}`);
    
    // Reset selection
    setSelectedMonths([]);
    setSelectedCategory('');
    setNewValue(0);
    setIsApplyingChange(false);
  };
  
  const handleCopyNextMonth = (monthIndex: number) => {
    if (monthIndex >= 11) {
      toast.error("Este é o último mês do ano");
      return;
    }
    
    const updatedBudget = [...annualBudget];
    const nextMonthIndex = monthIndex + 1;
    
    // Copy all category values to next month
    Object.keys(updatedBudget[monthIndex].categories).forEach(category => {
      updatedBudget[nextMonthIndex].categories[category] = updatedBudget[monthIndex].categories[category];
    });
    
    // Update totals for next month
    updatedBudget[nextMonthIndex].expenses = Object.values(updatedBudget[nextMonthIndex].categories)
      .reduce((sum, value) => sum + value, 0);
    
    setAnnualBudget(updatedBudget);
    toast.success(`Valores copiados para ${format(new Date(currentYear, nextMonthIndex, 1), 'MMMM', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}`);
  };
  
  const handleSaveAnnualBudget = () => {
    // In a real application, this would save to the database
    toast.success("Orçamento anual salvo com sucesso");
    onClose();
  };
  
  const yearTotals = getTotalForYear();
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Planejamento de Orçamento Anual</DialogTitle>
          <DialogDescription>
            Gerencie seu orçamento para o ano {currentYear}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col space-y-6 overflow-hidden">
          {/* Budget modification controls */}
          {selectedMonths.length > 0 && (
            <div className="flex flex-col space-y-4 p-4 border rounded-lg bg-muted/20">
              <div className="flex justify-between items-center">
                <h3 className="font-medium">
                  Modificar Orçamento para {selectedMonths.length} {selectedMonths.length === 1 ? 'mês' : 'meses'} selecionados
                </h3>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => setSelectedMonths([])}
                >
                  Limpar seleção
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {selectedMonths.sort((a, b) => a - b).map(monthIndex => (
                  <Badge key={monthIndex} variant="outline">
                    {format(new Date(currentYear, monthIndex, 1), 'MMM', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase())}
                  </Badge>
                ))}
              </div>
              
              <div className="flex gap-4 items-end">
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Categoria</label>
                  <select 
                    className="w-full h-10 px-3 rounded-md border bg-background"
                    value={selectedCategory}
                    onChange={(e) => handleCategorySelection(e.target.value)}
                  >
                    <option value="">Selecione uma categoria</option>
                    {categories
                      .filter(cat => cat.type === 'expense')
                      .map(category => (
                        <option key={category.id} value={category.name}>
                          {category.name}
                        </option>
                      ))}
                  </select>
                </div>
                
                <div className="flex-1 space-y-2">
                  <label className="text-sm font-medium">Novo Valor</label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newValue}
                    onChange={(e) => setNewValue(parseFloat(e.target.value) || 0)}
                  />
                </div>
                
                <Button 
                  onClick={handleApplyChange} 
                  disabled={!selectedCategory || selectedMonths.length === 0 || isApplyingChange}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          )}
          
          {/* Annual budget table */}
          <div className="overflow-x-auto">
            <Table className="w-full border-collapse">
              <TableHeader className="sticky top-0 bg-background z-10">
                <TableRow>
                  <TableHead className="w-[180px]">Categoria</TableHead>
                  {monthNames.map((month, index) => (
                    <TableHead 
                      key={month} 
                      className={`text-center cursor-pointer hover:bg-muted/50 ${getMonthClass(index)}`}
                      onClick={() => handleMonthSelection(index)}
                    >
                      {month}
                    </TableHead>
                  ))}
                  <TableHead className="text-center font-bold bg-muted/30">Total</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {/* Income row */}
                <TableRow className="bg-green-50 dark:bg-green-950/30">
                  <TableCell className="font-bold">Receitas</TableCell>
                  {annualBudget.map((month, index) => (
                    <TableCell 
                      key={index} 
                      className={`text-center font-semibold text-finance-income ${getMonthClass(index)}`}
                    >
                      {formatCurrency(month.income)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-finance-income bg-muted/30">
                    {formatCurrency(yearTotals.income)}
                  </TableCell>
                </TableRow>
                
                {/* Expenses section */}
                <TableRow className="bg-muted/10">
                  <TableCell colSpan={14} className="py-1 px-4">
                    <span className="font-bold">Despesas</span>
                  </TableCell>
                </TableRow>
                
                {/* Categories */}
                {categories
                  .filter(cat => cat.type === 'expense')
                  .map(category => (
                    <Collapsible key={category.id} asChild>
                      <>
                        <TableRow className="group">
                          <TableCell>
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between cursor-pointer">
                                <span className="font-medium">{category.name}</span>
                                {expandedCategory === category.name ? (
                                  <ChevronUp size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                ) : (
                                  <ChevronDown size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </div>
                            </CollapsibleTrigger>
                          </TableCell>
                          
                          {annualBudget.map((month, index) => (
                            <TableCell 
                              key={index}
                              className={`text-center ${getMonthClass(index)}`}
                            >
                              {formatCurrency(month.categories[category.name] || 0)}
                            </TableCell>
                          ))}
                          
                          <TableCell className="text-center font-semibold bg-muted/30">
                            {formatCurrency(
                              annualBudget.reduce(
                                (sum, month) => sum + (month.categories[category.name] || 0), 
                                0
                              )
                            )}
                          </TableCell>
                        </TableRow>
                        
                        {/* Subcategories (future implementation) */}
                        <CollapsibleContent asChild>
                          <TableRow>
                            <TableCell className="pl-8 text-sm text-muted-foreground">
                              Sem subcategorias
                            </TableCell>
                            <TableCell colSpan={13} className="text-sm text-muted-foreground">
                              As subcategorias serão implementadas em breve.
                            </TableCell>
                          </TableRow>
                        </CollapsibleContent>
                      </>
                    </Collapsible>
                  ))}
                
                {/* Total expenses row */}
                <TableRow className="bg-red-50 dark:bg-red-950/30">
                  <TableCell className="font-bold">Total Despesas</TableCell>
                  {annualBudget.map((month, index) => (
                    <TableCell 
                      key={index}
                      className={`text-center font-semibold text-finance-expense ${getMonthClass(index)}`}
                    >
                      {formatCurrency(month.expenses)}
                      <div className="flex justify-center mt-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={() => handleCopyNextMonth(index)}
                          disabled={index >= 11}
                        >
                          <ArrowRight size={12} />
                        </Button>
                      </div>
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-finance-expense bg-muted/30">
                    {formatCurrency(yearTotals.expenses)}
                  </TableCell>
                </TableRow>
                
                {/* Goals row */}
                <TableRow className="bg-blue-50 dark:bg-blue-950/30">
                  <TableCell className="font-bold">Metas e Economias</TableCell>
                  {annualBudget.map((month, index) => (
                    <TableCell 
                      key={index}
                      className={`text-center font-semibold text-blue-600 dark:text-blue-400 ${getMonthClass(index)}`}
                    >
                      {formatCurrency(month.goals)}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold text-blue-600 dark:text-blue-400 bg-muted/30">
                    {formatCurrency(yearTotals.goals)}
                  </TableCell>
                </TableRow>
                
                {/* Remaining row */}
                <TableRow className="bg-muted/20">
                  <TableCell className="font-bold">Restante</TableCell>
                  {annualBudget.map((month, index) => {
                    const remaining = month.income - month.expenses - month.goals;
                    return (
                      <TableCell 
                        key={index}
                        className={`text-center font-semibold ${
                          remaining >= 0 ? 'text-green-600' : 'text-red-600'
                        } ${getMonthClass(index)}`}
                      >
                        {formatCurrency(remaining)}
                      </TableCell>
                    );
                  })}
                  <TableCell className="text-center font-bold bg-muted/30">
                    <span className={
                      yearTotals.income - yearTotals.expenses - yearTotals.goals >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }>
                      {formatCurrency(yearTotals.income - yearTotals.expenses - yearTotals.goals)}
                    </span>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          
          {/* Instructions */}
          <div className="text-sm text-muted-foreground space-y-1">
            <p>• Clique em uma coluna de mês para selecioná-lo para edição em lote</p>
            <p>• Use o botão de seta → para copiar valores de um mês para o próximo</p>
            <p>• Clique em uma categoria para expandir suas subcategorias (em breve)</p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSaveAnnualBudget}>
            Salvar Planejamento Anual
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
