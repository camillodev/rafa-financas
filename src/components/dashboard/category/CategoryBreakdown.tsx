
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useFinance } from '@/hooks/useFinance';

interface CategoryBreakdownProps {
  className?: string;
}

export function CategoryBreakdown({ className }: CategoryBreakdownProps) {
  const finance = useFinance();
  const { 
    formatCurrency, 
    expenseBreakdown,
    selectedCategories,
    toggleCategorySelection,
    resetCategorySelection
  } = finance;
  
  // Get expense breakdown data
  const breakdownData = expenseBreakdown();
  
  // Sort categories by expense amount (descending)
  const sortedData = [...breakdownData].sort((a, b) => b.value - a.value);
  
  // Calculate total expenses
  const totalExpenses = sortedData.reduce((sum, item) => sum + item.value, 0);
  
  // No expenses, show empty state
  if (sortedData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Maiores Despesas</CardTitle>
          <CardDescription>
            Categorias que mais impactaram seu orçamento
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center min-h-[200px]">
          <p className="text-muted-foreground">Sem despesas neste mês</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Maiores Despesas</CardTitle>
        <CardDescription>
          Categorias que mais impactaram seu orçamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedData.slice(0, 5).map((category, index) => {
            const percentage = Math.round((category.value / totalExpenses) * 100);
            const isSelected = selectedCategories.includes(category.name);
            
            return (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <Button
                    variant="ghost"
                    className="h-auto p-0 text-sm font-medium"
                    onClick={() => toggleCategorySelection(category.name)}
                  >
                    <span
                      className="inline-block w-2 h-2 rounded-full mr-2"
                      style={{ backgroundColor: category.color }}
                    />
                    {category.name}
                    {isSelected && <span className="ml-1">✓</span>}
                  </Button>
                  <span className="text-sm">{formatCurrency(category.value)}</span>
                </div>
                <Progress
                  value={percentage}
                  indicatorClassName={`bg-[${category.color}]`}
                  className="h-2"
                />
                <p className="text-xs text-muted-foreground text-right">
                  {percentage}% do total
                </p>
              </div>
            );
          })}
          
          {selectedCategories.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={resetCategorySelection}
            >
              Limpar seleção
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CategoryBreakdown;
