import React, { useState, useEffect } from 'react';
import { useFinance } from '@/context/FinanceContext';
import AppLayout from '@/components/layout/AppLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, 
  AreaChart, Area, ComposedChart 
} from 'recharts';
import { format, addMonths, subMonths, startOfMonth, startOfQuarter, startOfYear, endOfMonth, endOfQuarter, endOfYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  AlertCircle, Download, Filter, BarChart3, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, Activity, Eye, EyeOff
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Tabs as ChartTypeTabs, TabsContent as ChartTypeTabsContent, TabsList as ChartTypeTabsList, TabsTrigger as ChartTypeTabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

interface ChartDataItem {
  name: string;
  value: number;
  color: string;
}

interface ComparisonDataItem {
  name: string;
  income: number;
  expenses: number;
}

interface BudgetVsActualItem {
  name: string;
  planned: number;
  actual: number;
}

interface CreditCardExpensesItem {
  name: string;
  value: number;
  color: string;
}

type PeriodType = 'monthly' | 'quarterly' | 'semiannual' | 'annual';
type ChartType = 'bar' | 'pie' | 'line' | 'area' | 'composed';
type TransactionStatus = 'all' | 'pending' | 'completed';

const Reports = () => {
  const {
    transactions,
    categories,
    budgetGoals,
    financialInstitutions,
    currentDate,
    setCurrentDate,
    navigateToPreviousMonth,
    navigateToNextMonth,
    formatCurrency,
  } = useFinance();

  const [activeReport, setActiveReport] = useState<string>('expenses-by-category');
  const [periodType, setPeriodType] = useState<PeriodType>('monthly');
  const [chartType, setChartType] = useState<ChartType>('bar');
  const [showLegend, setShowLegend] = useState(true);
  
  const [filters, setFilters] = useState({
    minAmount: '',
    maxAmount: '',
    selectedCategories: [] as string[],
    selectedSubcategories: [] as string[],
    selectedInstitutions: [] as string[],
    transactionStatus: 'all' as TransactionStatus,
  });

  const getPeriodDates = () => {
    const now = currentDate;
    let startDate, endDate;

    switch (periodType) {
      case 'monthly':
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        break;
      case 'quarterly':
        startDate = startOfQuarter(now);
        endDate = endOfQuarter(now);
        break;
      case 'semiannual':
        startDate = startOfMonth(now);
        if (now.getMonth() < 6) {
          startDate = new Date(now.getFullYear(), 0, 1); // January 1st
          endDate = new Date(now.getFullYear(), 5, 30); // June 30th
        } else {
          startDate = new Date(now.getFullYear(), 6, 1); // July 1st
          endDate = new Date(now.getFullYear(), 11, 31); // December 31st
        }
        break;
      case 'annual':
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        break;
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
    }

    return { startDate, endDate };
  };

  const getFilteredTransactions = () => {
    const { startDate, endDate } = getPeriodDates();
    
    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      
      if (!(transactionDate >= startDate && transactionDate <= endDate)) {
        return false;
      }
      
      const minAmount = filters.minAmount ? parseFloat(filters.minAmount) : null;
      const maxAmount = filters.maxAmount ? parseFloat(filters.maxAmount) : null;
      
      if (minAmount !== null && transaction.amount < minAmount) {
        return false;
      }
      
      if (maxAmount !== null && transaction.amount > maxAmount) {
        return false;
      }
      
      if (filters.selectedCategories.length > 0 && !filters.selectedCategories.includes(transaction.category)) {
        return false;
      }
      
      if (filters.selectedSubcategories.length > 0 && 
          transaction.subcategory && 
          !filters.selectedSubcategories.includes(transaction.subcategory)) {
        return false;
      }
      
      if (filters.selectedInstitutions.length > 0 && 
          transaction.financialInstitution && 
          !filters.selectedInstitutions.includes(transaction.financialInstitution)) {
        return false;
      }
      
      if (filters.transactionStatus !== 'all') {
        const isPending = transaction.status === 'pending';
        if (filters.transactionStatus === 'pending' && !isPending) return false;
        if (filters.transactionStatus === 'completed' && isPending) return false;
      }
      
      return true;
    });
  };

  const formatPeriodText = () => {
    const now = currentDate;
    
    switch (periodType) {
      case 'monthly':
        return format(now, 'MMMM yyyy', { locale: ptBR })
          .replace(/^\w/, (c) => c.toUpperCase());
      case 'quarterly':
        const quarter = Math.floor(now.getMonth() / 3) + 1;
        return `${quarter}º Trimestre de ${now.getFullYear()}`;
      case 'semiannual':
        return now.getMonth() < 6 
          ? `1º Semestre de ${now.getFullYear()}`
          : `2º Semestre de ${now.getFullYear()}`;
      case 'annual':
        return `Ano de ${now.getFullYear()}`;
      default:
        return format(now, 'MMMM yyyy', { locale: ptBR })
          .replace(/^\w/, (c) => c.toUpperCase());
    }
  };

  const navigateToPreviousPeriod = () => {
    switch (periodType) {
      case 'monthly':
        navigateToPreviousMonth();
        break;
      case 'quarterly':
        setCurrentDate(prevDate => subMonths(prevDate, 3));
        break;
      case 'semiannual':
        setCurrentDate(prevDate => subMonths(prevDate, 6));
        break;
      case 'annual':
        setCurrentDate(prevDate => new Date(prevDate.getFullYear() - 1, prevDate.getMonth(), prevDate.getDate()));
        break;
      default:
        navigateToPreviousMonth();
    }
  };

  const navigateToNextPeriod = () => {
    switch (periodType) {
      case 'monthly':
        navigateToNextMonth();
        break;
      case 'quarterly':
        setCurrentDate(prevDate => addMonths(prevDate, 3));
        break;
      case 'semiannual':
        setCurrentDate(prevDate => addMonths(prevDate, 6));
        break;
      case 'annual':
        setCurrentDate(prevDate => new Date(prevDate.getFullYear() + 1, prevDate.getMonth(), prevDate.getDate()));
        break;
      default:
        navigateToNextMonth();
    }
  };

  const handleFilterChange = (name: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const toggleCategoryFilter = (category: string) => {
    setFilters(prev => {
      const currentSelected = [...prev.selectedCategories];
      if (currentSelected.includes(category)) {
        return { ...prev, selectedCategories: currentSelected.filter(c => c !== category) };
      } else {
        return { ...prev, selectedCategories: [...currentSelected, category] };
      }
    });
  };

  const toggleSubcategoryFilter = (subcategory: string) => {
    setFilters(prev => {
      const currentSelected = [...prev.selectedSubcategories];
      if (currentSelected.includes(subcategory)) {
        return { ...prev, selectedSubcategories: currentSelected.filter(s => s !== subcategory) };
      } else {
        return { ...prev, selectedSubcategories: [...currentSelected, subcategory] };
      }
    });
  };

  const toggleInstitutionFilter = (institution: string) => {
    setFilters(prev => {
      const currentSelected = [...prev.selectedInstitutions];
      if (currentSelected.includes(institution)) {
        return { ...prev, selectedInstitutions: currentSelected.filter(i => i !== institution) };
      } else {
        return { ...prev, selectedInstitutions: [...currentSelected, institution] };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      minAmount: '',
      maxAmount: '',
      selectedCategories: [],
      selectedSubcategories: [],
      selectedInstitutions: [],
      transactionStatus: 'all',
    });
    toast.success("Filtros limpos com sucesso");
  };

  const exportData = () => {
    const filteredData = getFilteredTransactions();
    let exportContent = '';
    
    if (activeReport === 'expenses-vs-income') {
      const data = prepareExpensesVsIncome();
      exportContent = 'Nome,Receitas,Despesas\n';
      data.forEach(item => {
        exportContent += `${item.name},${item.income},${item.expenses}\n`;
      });
    } else if (activeReport === 'budget-vs-actual') {
      const data = prepareBudgetVsActual();
      exportContent = 'Categoria,Planejado,Realizado\n';
      data.forEach(item => {
        exportContent += `${item.name},${item.planned},${item.actual}\n`;
      });
    } else if (activeReport === 'credit-card-expenses') {
      const data = prepareCreditCardExpenses();
      exportContent = 'Cartão,Valor\n';
      data.forEach(item => {
        exportContent += `${item.name},${item.value}\n`;
      });
    } else {
      let data: ChartDataItem[];
      
      switch (activeReport) {
        case 'expenses-by-category':
          data = prepareExpensesByCategory();
          break;
        case 'expenses-by-account':
          data = prepareExpensesByAccount();
          break;
        case 'income-by-category':
          data = prepareIncomeByCategory();
          break;
        case 'income-by-account':
          data = prepareIncomeByAccount();
          break;
        default:
          data = [];
      }
      
      exportContent = 'Nome,Valor\n';
      data.forEach(item => {
        exportContent += `${item.name},${item.value}\n`;
      });
    }
    
    const blob = new Blob([exportContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rafa-financas-${activeReport}-${formatPeriodText().replace(/ /g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success("Relatório exportado com sucesso");
  };

  const prepareExpensesByCategory = (): ChartDataItem[] => {
    const filteredTransactions = getFilteredTransactions().filter(t => t.type === 'expense');
    
    if (filteredTransactions.length === 0) return [];

    const categorySums: Record<string, number> = {};
    
    filteredTransactions.forEach(transaction => {
      const { category, amount } = transaction;
      categorySums[category] = (categorySums[category] || 0) + amount;
    });

    return Object.entries(categorySums).map(([category, amount]) => {
      const categoryObj = categories.find(c => c.name === category);
      return {
        name: category,
        value: amount,
        color: categoryObj?.color || '#ccc',
      };
    }).sort((a, b) => b.value - a.value);
  };

  const prepareExpensesByAccount = (): ChartDataItem[] => {
    const filteredTransactions = getFilteredTransactions().filter(t => t.type === 'expense' && t.financialInstitution);
    
    if (filteredTransactions.length === 0) return [];

    const accountSums: Record<string, number> = {};
    
    filteredTransactions.forEach(transaction => {
      const { financialInstitution, amount } = transaction;
      if (financialInstitution) {
        accountSums[financialInstitution] = (accountSums[financialInstitution] || 0) + amount;
      }
    });

    return Object.entries(accountSums).map(([account, amount]) => {
      const institution = financialInstitutions.find(fi => fi.name === account);
      return {
        name: account,
        value: amount,
        color: institution?.color || '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
      };
    }).sort((a, b) => b.value - a.value);
  };

  const prepareIncomeByCategory = (): ChartDataItem[] => {
    const filteredTransactions = getFilteredTransactions().filter(t => t.type === 'income');
    
    if (filteredTransactions.length === 0) return [];

    const categorySums: Record<string, number> = {};
    
    filteredTransactions.forEach(transaction => {
      const { category, amount } = transaction;
      categorySums[category] = (categorySums[category] || 0) + amount;
    });

    return Object.entries(categorySums).map(([category, amount]) => {
      const categoryObj = categories.find(c => c.name === category);
      return {
        name: category,
        value: amount,
        color: categoryObj?.color || '#ccc',
      };
    }).sort((a, b) => b.value - a.value);
  };

  const prepareIncomeByAccount = (): ChartDataItem[] => {
    const filteredTransactions = getFilteredTransactions().filter(t => t.type === 'income' && t.financialInstitution);
    
    if (filteredTransactions.length === 0) return [];

    const accountSums: Record<string, number> = {};
    
    filteredTransactions.forEach(transaction => {
      const { financialInstitution, amount } = transaction;
      if (financialInstitution) {
        accountSums[financialInstitution] = (accountSums[financialInstitution] || 0) + amount;
      }
    });

    return Object.entries(accountSums).map(([account, amount]) => {
      const institution = financialInstitutions.find(fi => fi.name === account);
      return {
        name: account,
        value: amount,
        color: institution?.color || '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0'),
      };
    }).sort((a, b) => b.value - a.value);
  };

  const prepareBudgetVsActual = (): BudgetVsActualItem[] => {
    const { startDate, endDate } = getPeriodDates();
    const filteredExpenses = getFilteredTransactions().filter(t => t.type === 'expense');
    
    if (filteredExpenses.length === 0) return [];

    // Get the current month's budget or default to empty
    const currentMonthBudgets = budgetGoals.filter(b => {
      const budgetDate = new Date(b.date);
      return budgetDate.getMonth() === currentDate.getMonth() && 
             budgetDate.getFullYear() === currentDate.getFullYear();
    });

    // Aggregate expenses by category
    const categoryExpenses: Record<string, number> = {};
    filteredExpenses.forEach(transaction => {
      const { category, amount } = transaction;
      categoryExpenses[category] = (categoryExpenses[category] || 0) + amount;
    });

    // Combine with budget data
    const result: BudgetVsActualItem[] = [];
    
    // First add categories that have both budget and expenses
    categories
      .filter(category => category.type === 'expense')
      .forEach(category => {
        const budgetItem = currentMonthBudgets.find(b => b.category === category.name);
        const planned = budgetItem ? budgetItem.amount : 0;
        const actual = categoryExpenses[category.name] || 0;
        
        result.push({
          name: category.name,
          planned,
          actual
        });
      });

    return result.sort((a, b) => b.actual - a.actual);
  };

  const prepareCreditCardExpenses = (): CreditCardExpensesItem[] => {
    const filteredTransactions = getFilteredTransactions().filter(
      t => t.type === 'expense' && t.paymentMethod === 'credit_card'
    );
    
    if (filteredTransactions.length === 0) return [];

    // Group by card
    const cardExpenses: Record<string, number> = {};
    
    filteredTransactions.forEach(transaction => {
      const card = transaction.card || 'Cartão não especificado';
      cardExpenses[card] = (cardExpenses[card] || 0) + transaction.amount;
    });

    // Convert to chart format
    return Object.entries(cardExpenses).map(([card, amount], index) => {
      // Generate a distinct color for each card
      const colors = ['#f44336', '#3f51b5', '#4caf50', '#ff9800', '#9c27b0', '#607d8b'];
      return {
        name: card,
        value: amount,
        color: colors[index % colors.length],
      };
    }).sort((a, b) => b.value - a.value);
  };

  const prepareExpensesVsIncome = (): ComparisonDataItem[] => {
    const filteredTransactions = getFilteredTransactions();
    
    if (filteredTransactions.length === 0) return [];

    if (periodType === 'monthly') {
      const { startDate, endDate } = getPeriodDates();
      const daysInMonth = endDate.getDate();
      const dailyData: Record<string, { income: number, expenses: number }> = {};

      for (let i = 1; i <= daysInMonth; i++) {
        const dayStr = i.toString();
        dailyData[dayStr] = { income: 0, expenses: 0 };
      }

      filteredTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        const day = transactionDate.getDate().toString();
        
        if (transaction.type === 'income') {
          dailyData[day].income += transaction.amount;
        } else {
          dailyData[day].expenses += transaction.amount;
        }
      });

      return Object.entries(dailyData).map(([day, data]) => ({
        name: `${day}/${startDate.getMonth() + 1}`,
        income: data.income,
        expenses: data.expenses
      })).sort((a, b) => parseInt(a.name) - parseInt(b.name));
    }
    
    const aggregationKey = periodType === 'quarterly' ? 'month' : 
                           periodType === 'semiannual' ? 'month' : 
                           periodType === 'annual' ? 'month' : 'week';
    
    const aggregatedData: Record<string, { income: number, expenses: number }> = {};

    filteredTransactions.forEach(transaction => {
      const transactionDate = new Date(transaction.date);
      let key;
      
      if (aggregationKey === 'week') {
        const weekOfMonth = Math.ceil(transactionDate.getDate() / 7);
        key = `Semana ${weekOfMonth}`;
      } else {
        key = format(transactionDate, 'MMM', { locale: ptBR }).replace(/^\w/, c => c.toUpperCase());
      }
      
      if (!aggregatedData[key]) {
        aggregatedData[key] = { income: 0, expenses: 0 };
      }
      
      if (transaction.type === 'income') {
        aggregatedData[key].income += transaction.amount;
      } else {
        aggregatedData[key].expenses += transaction.amount;
      }
    });

    return Object.entries(aggregatedData).map(([name, data]) => ({
      name,
      income: data.income,
      expenses: data.expenses
    }));
  };

  const formatTooltipValue = (value: number) => {
    return formatCurrency(value);
  };

  const renderChartByType = (data: any[], type: ChartType, title: string, dataKeys: string[], colors: string[]) => {
    if (!data.length) {
      return (
        <div className="flex flex-col items-center justify-center h-60 p-8">
          <AlertCircle className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-center">Não há dados para exibir neste período.</p>
        </div>
      );
    }

    switch (type) {
      case 'pie':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey={dataKeys[0]}
                  nameKey="name"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length] || entry.color || colors[0]} />
                  ))}
                </Pie>
                <Tooltip formatter={formatTooltipValue} />
                {showLegend && <Legend />}
              </PieChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'line':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={formatTooltipValue} />
                {showLegend && <Legend />}
                {dataKeys.map((key, index) => (
                  <Line 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    stroke={colors[index % colors.length]}
                    activeDot={{ r: 8 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'area':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={formatTooltipValue} />
                {showLegend && <Legend />}
                {dataKeys.map((key, index) => (
                  <Area 
                    key={key} 
                    type="monotone" 
                    dataKey={key} 
                    fill={colors[index % colors.length]}
                    stroke={colors[index % colors.length]}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );
      
      case 'composed':
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={formatTooltipValue} />
                {showLegend && <Legend />}
                {dataKeys.map((key, index) => (
                  index === 0 ? (
                    <Bar 
                      key={key} 
                      dataKey={key} 
                      fill={colors[index % colors.length]}
                      radius={[4, 4, 0, 0]}
                    />
                  ) : (
                    <Line 
                      key={key} 
                      type="monotone" 
                      dataKey={key} 
                      stroke={colors[index % colors.length]}
                      strokeWidth={2}
                    />
                  )
                ))}
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        );
      
      default: // 'bar'
        return (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={formatTooltipValue} />
                {showLegend && <Legend />}
                {dataKeys.map((key, index) => (
                  <Bar 
                    key={key} 
                    dataKey={key} 
                    fill={colors[index % colors.length]}
                    radius={[4, 4, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
    }
  };

  const renderReportContent = () => {
    switch (activeReport) {
      case 'expenses-by-category': {
        const data = prepareExpensesByCategory();
        const colors = data.map(item => item.color);
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Despesas por Categoria</h3>
            <div className="mb-4">
              <ChartTypeTabs value={chartType} onValueChange={value => setChartType(value as ChartType)}>
                <ChartTypeTabsList className="grid grid-cols-5 w-full max-w-md mx-auto">
                  <ChartTypeTabsTrigger value="bar"><BarChart3 className="h-4 w-4 mr-2" />Barras</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="pie"><PieChartIcon className="h-4 w-4 mr-2" />Pizza</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="line"><LineChartIcon className="h-4 w-4 mr-2" />Linha</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="area"><Activity className="h-4 w-4 mr-2" />Área</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="composed">Comp.</ChartTypeTabsTrigger>
                </ChartTypeTabsList>
              </ChartTypeTabs>
            </div>
            <div className="flex justify-end mb-4">
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={() => setShowLegend(!showLegend)}>
                  {showLegend ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showLegend ? "Ocultar Legenda" : "Mostrar Legenda"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderChartByType(data, chartType, "Despesas por Categoria", ['value'], colors)}
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Detalhamento</h4>
                <div className="space-y-3">
                  {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      case 'expenses-by-account': {
        const data = prepareExpensesByAccount();
        const colors = data.map(item => item.color);
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Despesas por Conta</h3>
            <div className="mb-4">
              <ChartTypeTabs value={chartType} onValueChange={value => setChartType(value as ChartType)}>
                <ChartTypeTabsList className="grid grid-cols-5 w-full max-w-md mx-auto">
                  <ChartTypeTabsTrigger value="bar"><BarChart3 className="h-4 w-4 mr-2" />Barras</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="pie"><PieChartIcon className="h-4 w-4 mr-2" />Pizza</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="line"><LineChartIcon className="h-4 w-4 mr-2" />Linha</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="area"><Activity className="h-4 w-4 mr-2" />Área</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="composed">Comp.</ChartTypeTabsTrigger>
                </ChartTypeTabsList>
              </ChartTypeTabs>
            </div>
            <div className="flex justify-end mb-4">
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={() => setShowLegend(!showLegend)}>
                  {showLegend ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showLegend ? "Ocultar Legenda" : "Mostrar Legenda"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderChartByType(data, chartType, "Despesas por Conta", ['value'], colors)}
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Detalhamento</h4>
                <div className="space-y-3">
                  {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      case 'income-by-category': {
        const data = prepareIncomeByCategory();
        const colors = data.map(item => item.color);
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Receitas por Categoria</h3>
            <div className="mb-4">
              <ChartTypeTabs value={chartType} onValueChange={value => setChartType(value as ChartType)}>
                <ChartTypeTabsList className="grid grid-cols-5 w-full max-w-md mx-auto">
                  <ChartTypeTabsTrigger value="bar"><BarChart3 className="h-4 w-4 mr-2" />Barras</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="pie"><PieChartIcon className="h-4 w-4 mr-2" />Pizza</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="line"><LineChartIcon className="h-4 w-4 mr-2" />Linha</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="area"><Activity className="h-4 w-4 mr-2" />Área</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="composed">Comp.</ChartTypeTabsTrigger>
                </ChartTypeTabsList>
              </ChartTypeTabs>
            </div>
            <div className="flex justify-end mb-4">
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={() => setShowLegend(!showLegend)}>
                  {showLegend ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showLegend ? "Ocultar Legenda" : "Mostrar Legenda"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderChartByType(data, chartType, "Receitas por Categoria", ['value'], colors)}
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Detalhamento</h4>
                <div className="space-y-3">
                  {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      case 'income-by-account': {
        const data = prepareIncomeByAccount();
        const colors = data.map(item => item.color);
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Receitas por Conta</h3>
            <div className="mb-4">
              <ChartTypeTabs value={chartType} onValueChange={value => setChartType(value as ChartType)}>
                <ChartTypeTabsList className="grid grid-cols-5 w-full max-w-md mx-auto">
                  <ChartTypeTabsTrigger value="bar"><BarChart3 className="h-4 w-4 mr-2" />Barras</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="pie"><PieChartIcon className="h-4 w-4 mr-2" />Pizza</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="line"><LineChartIcon className="h-4 w-4 mr-2" />Linha</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="area"><Activity className="h-4 w-4 mr-2" />Área</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="composed">Comp.</ChartTypeTabsTrigger>
                </ChartTypeTabsList>
              </ChartTypeTabs>
            </div>
            <div className="flex justify-end mb-4">
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={() => setShowLegend(!showLegend)}>
                  {showLegend ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showLegend ? "Ocultar Legenda" : "Mostrar Legenda"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderChartByType(data, chartType, "Receitas por Conta", ['value'], colors)}
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Detalhamento</h4>
                <div className="space-y-3">
                  {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      case 'expenses-vs-income': {
        const data = prepareExpensesVsIncome();
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Despesas vs. Receitas</h3>
            <div className="mb-4">
              <ChartTypeTabs value={chartType} onValueChange={value => setChartType(value as ChartType)}>
                <ChartTypeTabsList className="grid grid-cols-5 w-full max-w-md mx-auto">
                  <ChartTypeTabsTrigger value="bar"><BarChart3 className="h-4 w-4 mr-2" />Barras</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="line"><LineChartIcon className="h-4 w-4 mr-2" />Linha</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="area"><Activity className="h-4 w-4 mr-2" />Área</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="composed">Comp.</ChartTypeTabsTrigger>
                </ChartTypeTabsList>
              </ChartTypeTabs>
            </div>
            <div className="flex justify-end mb-4">
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={() => setShowLegend(!showLegend)}>
                  {showLegend ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showLegend ? "Ocultar Legenda" : "Mostrar Legenda"}
                </Button>
              </div>
            </div>
            
            {renderChartByType(
              data, 
              chartType, 
              "Despesas vs. Receitas", 
              ['income', 'expenses'],
              ['#4ade80', '#f43f5e']
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total de Receitas</p>
                  <p className="text-xl font-semibold text-green-500">
                    {formatCurrency(data.reduce((sum, item) => sum + item.income, 0))}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Total de Despesas</p>
                  <p className="text-xl font-semibold text-red-500">
                    {formatCurrency(data.reduce((sum, item) => sum + item.expenses, 0))}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground">Saldo</p>
                  <p className={`text-xl font-semibold ${
                    data.reduce((sum, item) => sum + item.income, 0) >= 
                    data.reduce((sum, item) => sum + item.expenses, 0) 
                      ? 'text-green-500' 
                      : 'text-red-500'
                  }`}>
                    {formatCurrency(
                      data.reduce((sum, item) => sum + item.income, 0) - 
                      data.reduce((sum, item) => sum + item.expenses, 0)
                    )}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        );
      }
      
      case 'budget-vs-actual': {
        const data = prepareBudgetVsActual();
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Despesas: Planejado vs. Realizado</h3>
            <div className="mb-4">
              <ChartTypeTabs value={chartType} onValueChange={value => setChartType(value as ChartType)}>
                <ChartTypeTabsList className="grid grid-cols-5 w-full max-w-md mx-auto">
                  <ChartTypeTabsTrigger value="bar"><BarChart3 className="h-4 w-4 mr-2" />Barras</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="line"><LineChartIcon className="h-4 w-4 mr-2" />Linha</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="area"><Activity className="h-4 w-4 mr-2" />Área</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="composed">Comp.</ChartTypeTabsTrigger>
                </ChartTypeTabsList>
              </ChartTypeTabs>
            </div>
            <div className="flex justify-end mb-4">
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={() => setShowLegend(!showLegend)}>
                  {showLegend ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showLegend ? "Ocultar Legenda" : "Mostrar Legenda"}
                </Button>
              </div>
            </div>
            
            {renderChartByType(
              data, 
              chartType, 
              "Planejado vs. Realizado", 
              ['planned', 'actual'],
              ['#a78bfa', '#f97316']
            )}
            
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-3">Detalhamento por Categoria</h4>
              <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                {data.map((item, index) => (
                  <Card key={index} className="p-3">
                    <div className="flex flex-col">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{item.name}</span>
                        <Badge variant={item.actual <= item.planned ? "success" : "destructive"}>
                          {item.actual <= item.planned ? "Dentro do orçamento" : "Acima do orçamento"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Planejado</p>
                          <p className="font-medium">{formatCurrency(item.planned)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Realizado</p>
                          <p className="font-medium">{formatCurrency(item.actual)}</p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm text-muted-foreground">Diferença</p>
                        <p className={`font-medium ${
                          item.planned - item.actual >= 0 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {formatCurrency(item.planned - item.actual)}
                          {item.planned > 0 && (
                            <span className="text-xs ml-1">
                              ({Math.round((item.actual / item.planned) * 100)}%)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        );
      }
      
      case 'credit-card-expenses': {
        const data = prepareCreditCardExpenses();
        const colors = data.map(item => item.color);
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Despesas com Cartão de Crédito</h3>
            <div className="mb-4">
              <ChartTypeTabs value={chartType} onValueChange={value => setChartType(value as ChartType)}>
                <ChartTypeTabsList className="grid grid-cols-5 w-full max-w-md mx-auto">
                  <ChartTypeTabsTrigger value="bar"><BarChart3 className="h-4 w-4 mr-2" />Barras</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="pie"><PieChartIcon className="h-4 w-4 mr-2" />Pizza</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="line"><LineChartIcon className="h-4 w-4 mr-2" />Linha</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="area"><Activity className="h-4 w-4 mr-2" />Área</ChartTypeTabsTrigger>
                  <ChartTypeTabsTrigger value="composed">Comp.</ChartTypeTabsTrigger>
                </ChartTypeTabsList>
              </ChartTypeTabs>
            </div>
            <div className="flex justify-end mb-4">
              <div className="flex items-center">
                <Button variant="outline" size="sm" onClick={() => setShowLegend(!showLegend)}>
                  {showLegend ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                  {showLegend ? "Ocultar Legenda" : "Mostrar Legenda"}
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {renderChartByType(data, chartType, "Despesas por Cartão", ['value'], colors)}
              
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Detalhamento</h4>
                <div className="space-y-3">
                  {data.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">{formatCurrency(item.value)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between font-medium">
                    <span>Total</span>
                    <span>{formatCurrency(data.reduce((sum, item) => sum + item.value, 0))}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
      
      default:
        return <div className="p-8 text-center text-muted-foreground">Selecione um relatório</div>;
    }
  };

  // Create lists of expense and income categories
  const expenseCategories = categories.filter(c => c.type === 'expense');
  const incomeCategories = categories.filter(c => c.type === 'income');
  
  // Get all subcategories from transactions
  const subcategories = React.useMemo(() => {
    const uniqueSubcategories = new Set<string>();
    transactions.forEach(tx => {
      if (tx.subcategory) {
        uniqueSubcategories.add(tx.subcategory);
      }
    });
    return Array.from(uniqueSubcategories);
  }, [transactions]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          
          <div className="flex items-center gap-2">
            <Select value={periodType} onValueChange={(value: PeriodType) => setPeriodType(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Selecione um período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="quarterly">Trimestral</SelectItem>
                <SelectItem value="semiannual">Semestral</SelectItem>
                <SelectItem value="annual">Anual</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <h4 className="font-medium">Filtros</h4>
                  
                  <div className="space-y-2">
                    <Label htmlFor="minAmount">Valor Mínimo</Label>
                    <Input
                      id="minAmount"
                      placeholder="0,00"
                      value={filters.minAmount}
                      onChange={(e) => handleFilterChange('minAmount', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="maxAmount">Valor Máximo</Label>
                    <Input
                      id="maxAmount"
                      placeholder="0,00"
                      value={filters.maxAmount}
                      onChange={(e) => handleFilterChange('maxAmount', e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Status da Transação</Label>
                    <Select 
                      value={filters.transactionStatus} 
                      onValueChange={(value) => handleFilterChange('transactionStatus', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="pending">Pendentes</SelectItem>
                        <SelectItem value="completed">Concluídos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Categorias de Despesas</Label>
                    <div className="h-32 overflow-y-auto border rounded-md p-2">
                      {expenseCategories.map(category => (
                        <div key={`expense-${category.id}`} className="flex items-center space-x-2 py-1">
                          <Checkbox 
                            id={`category-${category.id}`}
                            checked={filters.selectedCategories.includes(category.name)}
                            onCheckedChange={() => toggleCategoryFilter(category.name)}
                          />
                          <label 
                            htmlFor={`category-${category.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Categorias de Receitas</Label>
                    <div className="h-32 overflow-y-auto border rounded-md p-2">
                      {incomeCategories.map(category => (
                        <div key={`income-${category.id}`} className="flex items-center space-x-2 py-1">
                          <Checkbox 
                            id={`category-income-${category.id}`}
                            checked={filters.selectedCategories.includes(category.name)}
                            onCheckedChange={() => toggleCategoryFilter(category.name)}
                          />
                          <label 
                            htmlFor={`category-income-${category.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {category.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Subcategorias</Label>
                    <div className="h-32 overflow-y-auto border rounded-md p-2">
                      {subcategories.map((subcategory, index) => (
                        <div key={`subcategory-${index}`} className="flex items-center space-x-2 py-1">
                          <Checkbox 
                            id={`subcategory-${index}`}
                            checked={filters.selectedSubcategories.includes(subcategory)}
                            onCheckedChange={() => toggleSubcategoryFilter(subcategory)}
                          />
                          <label 
                            htmlFor={`subcategory-${index}`}
                            className="text-sm cursor-pointer"
                          >
                            {subcategory}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Instituições</Label>
                    <div className="h-32 overflow-y-auto border rounded-md p-2">
                      {financialInstitutions.map(institution => (
                        <div key={institution.id} className="flex items-center space-x-2 py-1">
                          <Checkbox 
                            id={`institution-${institution.id}`}
                            checked={filters.selectedInstitutions.includes(institution.name)}
                            onCheckedChange={() => toggleInstitutionFilter(institution.name)}
                          />
                          <label 
                            htmlFor={`institution-${institution.id}`}
                            className="text-sm cursor-pointer"
                          >
                            {institution.name}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Limpar
                    </Button>
                    <Button size="sm" onClick={() => document.body.click()}>
                      Aplicar
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            
            <Button variant="outline" size="icon" onClick={exportData}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="flex items-center gap-4">
            <button
              onClick={navigateToPreviousPeriod}
              className="p-2 rounded-full hover:bg-accent"
            >
              ←
            </button>
            <span className="text-lg font-medium">{formatPeriodText()}</span>
            <button
              onClick={navigateToNextPeriod}
              className="p-2 rounded-full hover:bg-accent"
            >
              →
            </button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <Tabs value={activeReport} onValueChange={setActiveReport}>
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-7 mb-6">
                <TabsTrigger value="expenses-by-category">
                  Despesas por Categoria
                </TabsTrigger>
                <TabsTrigger value="expenses-by-account">
                  Despesas por Conta
                </TabsTrigger>
                <TabsTrigger value="income-by-category">
                  Receitas por Categoria
                </TabsTrigger>
                <TabsTrigger value="income-by-account">
                  Receitas por Conta
                </TabsTrigger>
                <TabsTrigger value="expenses-vs-income">
                  Receitas vs Despesas
                </TabsTrigger>
                <TabsTrigger value="budget-vs-actual">
                  Planejado vs Realizado
                </TabsTrigger>
                <TabsTrigger value="credit-card-expenses">
                  Despesas com Cartão
                </TabsTrigger>
              </TabsList>

              <TabsContent value={activeReport} className="mt-6">
                {renderReportContent()}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Reports;
