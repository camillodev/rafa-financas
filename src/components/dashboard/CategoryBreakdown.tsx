import React, { useState } from 'react';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from 'lucide-react';

// Define a type for the expense breakdown items
type ExpenseBreakdownItem = {
  name: string;
  category: string;
  value: number;
  color: string;
  percent?: number;
};

const CustomTooltip = ({ active, payload }: any) => {
  const { formatCurrency } = useFinance();
  
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip bg-background border rounded-lg shadow-md p-3">
        <p className="font-medium mb-1" style={{ color: data.color }}>{data.category}</p>
        <div className="flex items-center justify-between gap-4">
          <span>Valor:</span>
          <span className="font-medium">{formatCurrency(data.value)}</span>
        </div>
        <div className="flex items-center justify-between gap-4">
          <span>Porcentagem:</span>
          <span className="font-medium">{data.percent}%</span>
        </div>
      </div>
    );
  }

  return null;
};

export function CategoryBreakdown() {
  const { formatCurrency, filteredTransactions, categories } = useFinance();
  // Use optional chaining to safely access missing properties
  const finance = useFinance();
  const expenseBreakdown = finance.expenseBreakdown || [];
  const selectedCategories = finance.selectedCategories || [];
  const toggleCategorySelection = finance.toggleCategorySelection ||
    ((categoryId) => console.warn('toggleCategorySelection not implemented', categoryId));
  const resetCategorySelection = finance.resetCategorySelection ||
    (() => console.warn('resetCategorySelection not implemented'));

  const [showingSubcategories, setShowingSubcategories] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  
  // Get expenses data either from the function or directly from the array
  const getExpensesData = (): ExpenseBreakdownItem[] => {
    if (typeof expenseBreakdown === 'function') {
      return expenseBreakdown().map(item => ({
        ...item,
        category: item.name
      }));
    }
    if (Array.isArray(expenseBreakdown)) {
      return expenseBreakdown;
    }
    return [];
  };

  // If we have selected categories to filter by, filter the expense breakdown
  const filteredExpenseBreakdown: ExpenseBreakdownItem[] = selectedCategories.length > 0
    ? getExpensesData().filter(item => selectedCategories.includes(item.name))
    : getExpensesData();
  
  // Calculate total expenses for percentage calculation
  const totalExpenses = filteredExpenseBreakdown.reduce((sum, item) => sum + item.value, 0);
  
  // Add percentage data to each category
  const chartData = filteredExpenseBreakdown.map(item => ({
    ...item,
    percent: totalExpenses > 0 ? Math.round((item.value / totalExpenses) * 100) : 0
  }));
  
  // Get subcategories for the selected category
  const subcategoriesData = React.useMemo(() => {
    if (!selectedCategory) return [];
    
    // Get category id from name
    const category = categories.find(c => c.name === selectedCategory);
    if (!category) return [];
    
    // Group filtered transactions by subcategory for this category
    const subcategoryTransactions = filteredTransactions
      .filter(t => t.category === selectedCategory && t.type === 'expense' && t.subcategory);
    
    // Calculate amounts for each subcategory
    const subcategoryAmounts: Record<string, number> = {};
    subcategoryTransactions.forEach(t => {
      if (t.subcategory) {
        subcategoryAmounts[t.subcategory] = (subcategoryAmounts[t.subcategory] || 0) + t.amount;
      }
    });
    
    // Convert to chart data format
    const subTotal = Object.values(subcategoryAmounts).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(subcategoryAmounts).map(([name, value], index) => ({
      category: name,
      name,
      value,
      color: category.color,
      percent: subTotal > 0 ? Math.round((value / subTotal) * 100) : 0
    }));
  }, [selectedCategory, filteredTransactions, categories]);
  
  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    setShowingSubcategories(true);
  };
  
  const handleBackToCategories = () => {
    setShowingSubcategories(false);
    setSelectedCategory(null);
  };
  
  const expenseCategories = categories.filter(c => c.type === 'expense');
  
  return (
    <Card className="animate-fade-in h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>
          {showingSubcategories ? (
            <button 
              onClick={handleBackToCategories}
              className="flex items-center gap-1 text-primary"
            >
              <ArrowRight className="h-4 w-4 rotate-180" />
              <span>Subcategorias: {selectedCategory}</span>
            </button>
          ) : (
            "Despesas por Categoria"
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {!showingSubcategories && (
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge 
              variant={selectedCategories.length === 0 ? "default" : "outline"} 
              className="cursor-pointer"
              onClick={resetCategorySelection}
            >
              Todas
            </Badge>
            {expenseCategories.map(category => (
              <Badge 
                key={category.id}
                variant={selectedCategories.includes(category.name) ? "default" : "outline"}
                className="cursor-pointer"
                style={{ 
                  backgroundColor: selectedCategories.includes(category.name) ? category.color : 'transparent',
                  borderColor: category.color,
                  color: selectedCategories.includes(category.name) ? 'white' : category.color
                }}
                onClick={() => toggleCategorySelection(category.name)}
              >
                {category.name}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="mt-6">
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={showingSubcategories ? subcategoriesData : chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                nameKey="category"
                onClick={!showingSubcategories ? (data) => handleCategoryClick(data.category) : undefined}
                style={{ cursor: !showingSubcategories ? 'pointer' : 'default' }}
              >
                {(showingSubcategories ? subcategoriesData : chartData).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="space-y-2 mt-4">
          {(showingSubcategories ? subcategoriesData : chartData).map((entry, index) => (
            <div
              key={`item-${index}`}
              className="flex items-center justify-between py-1 cursor-pointer hover:bg-accent/50 rounded px-2"
              style={{ cursor: !showingSubcategories ? 'pointer' : 'default' }}
              onClick={() => !showingSubcategories && handleCategoryClick(entry.category)}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm">{entry.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">
                  {formatCurrency(entry.value)}
                </span>
                <span className="text-xs text-muted-foreground">
                  {entry.percent}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default CategoryBreakdown;
