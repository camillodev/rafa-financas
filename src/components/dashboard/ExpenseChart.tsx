
import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  ComposedChart, 
  Line, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronRight } from 'lucide-react';
import { format, getDate, startOfMonth, endOfMonth, eachDayOfInterval, isEqual, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const CustomTooltip = ({ active, payload, label }: any) => {
  const { formatCurrency } = useFinance();
  
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip bg-background border rounded-lg shadow-md p-3">
        <p className="font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={`tooltip-${index}`} className="flex items-center justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}:</span>
            <span className="font-medium" style={{ color: entry.color }}>
              {formatCurrency(Number(entry.value))}
            </span>
          </div>
        ))}
        {payload.length === 2 && (
          <div className="flex items-center justify-between gap-4 mt-2 pt-2 border-t">
            <span className="text-primary">Diferença:</span>
            <span className="font-medium text-primary">
              {formatCurrency(Math.abs(Number(payload[0].value) - Number(payload[1].value)))}
            </span>
          </div>
        )}
      </div>
    );
  }

  return null;
};

export function ExpenseChart() {
  const { filteredTransactions, formatCurrency, currentDate } = useFinance();
  
  // Generate daily data based on the filtered transactions for the current month
  const dailyData = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    
    // Create array of all days in month
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    return daysInMonth.map(day => {
      // Filter transactions for this day
      const dayTransactions = filteredTransactions.filter(tx => 
        isSameDay(new Date(tx.date), day)
      );
      
      // Calculate totals
      const income = dayTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
        
      const expenses = dayTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        income,
        expenses,
      };
    });
  }, [filteredTransactions, currentDate]);
  
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <ComposedChart 
            data={dailyData}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value).replace('R$', '')}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="income" 
              name="Receitas" 
              fill="#4ade80" 
              radius={[4, 4, 0, 0]} 
            />
            <Bar 
              dataKey="expenses" 
              name="Despesas" 
              fill="#f97316" 
              radius={[4, 4, 0, 0]} 
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default ExpenseChart;
