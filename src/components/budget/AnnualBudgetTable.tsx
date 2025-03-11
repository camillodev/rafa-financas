
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AnnualBudgetItem {
  category: string;
  type: 'income' | 'expense' | 'goal';
  values: number[];
  isParent?: boolean;
  parentCategory?: string;
}

interface AnnualBudgetTableProps {
  year: number;
  budgetData: AnnualBudgetItem[];
  formatCurrency: (value: number) => string;
  onCellClick?: (category: string, month: number, currentValue: number) => void;
}

export function AnnualBudgetTable({ 
  year, 
  budgetData, 
  formatCurrency,
  onCellClick
}: AnnualBudgetTableProps) {
  // Generate month names based on the current year
  const monthNames = useMemo(() => {
    return Array.from({ length: 12 }, (_, monthIndex) => 
      format(new Date(year, monthIndex), 'MMM', { locale: ptBR })
    );
  }, [year]);
  
  // Calculate totals for each month
  const monthlyTotals = useMemo(() => {
    return Array(12).fill(0).map((_, monthIndex) => {
      return budgetData.reduce((sum, item) => sum + (item.values[monthIndex] || 0), 0);
    });
  }, [budgetData]);
  
  // Calculate total for each category across all months
  const categoryTotals = useMemo(() => {
    return budgetData.map(item => 
      item.values.reduce((sum, value) => sum + (value || 0), 0)
    );
  }, [budgetData]);
  
  // Calculate grand total
  const grandTotal = useMemo(() => {
    return monthlyTotals.reduce((sum, total) => sum + total, 0);
  }, [monthlyTotals]);
  
  const getCellStyle = (type: string, isParent?: boolean) => {
    if (type === 'income') {
      return "text-finance-income" + (isParent ? " font-medium" : "");
    } else if (type === 'expense') {
      return "text-finance-expense" + (isParent ? " font-medium" : "");
    } else if (type === 'goal') {
      return "text-blue-500" + (isParent ? " font-medium" : "");
    }
    return isParent ? "font-medium" : "";
  };
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px] sticky left-0 bg-background z-10">Categoria</TableHead>
            {monthNames.map((month, index) => (
              <TableHead key={month} className="text-center">
                {month.toUpperCase()}
              </TableHead>
            ))}
            <TableHead className="text-center bg-muted/20">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {budgetData.map((item, rowIndex) => (
            <TableRow key={`${item.category}-${rowIndex}`} className={item.isParent ? "bg-muted/20" : ""}>
              <TableCell 
                className={`font-medium sticky left-0 bg-background z-10 ${item.isParent ? "font-semibold" : ""} ${
                  item.parentCategory ? "pl-6" : ""
                }`}
              >
                {item.category}
              </TableCell>
              {item.values.map((value, monthIndex) => (
                <TableCell 
                  key={monthIndex} 
                  className={`text-center ${getCellStyle(item.type, item.isParent)} ${
                    onCellClick ? "cursor-pointer hover:bg-muted" : ""
                  }`}
                  onClick={() => onCellClick && onCellClick(item.category, monthIndex, value)}
                >
                  {formatCurrency(value)}
                </TableCell>
              ))}
              <TableCell className={`text-center font-medium bg-muted/20 ${getCellStyle(item.type, item.isParent)}`}>
                {formatCurrency(categoryTotals[rowIndex])}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-muted/50 font-bold">
            <TableCell className="sticky left-0 bg-muted/50 z-10">Total Mensal</TableCell>
            {monthlyTotals.map((total, index) => (
              <TableCell key={index} className="text-center">
                {formatCurrency(total)}
              </TableCell>
            ))}
            <TableCell className="text-center bg-muted/30">
              {formatCurrency(grandTotal)}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
