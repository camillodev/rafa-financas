
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from 'recharts';
import { useFinance } from '@/hooks/useFinance';
import { 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  format, 
  isSameDay,
  isAfter,
  isBefore,
  addDays
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import CardHeader from '@/components/ui/atoms/CardHeader';

const CustomTooltip = ({ active, payload, label }: any) => {
  const { formatCurrency } = useFinance();
  
  if (active && payload && payload.length) {
    return (
      <div className="bg-card p-3 border rounded-lg shadow-sm">
        <p className="font-medium">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-primary text-sm">Saldo:</span>
          <span className="font-medium">
            {formatCurrency(payload[0].value)}
          </span>
        </div>
      </div>
    );
  }
  
  return null;
};

const TimeSeriesChart = () => {
  const { transactions, formatCurrency, currentDate } = useFinance();
  
  // Calculate cumulative balance for each day of the month
  const balanceData = React.useMemo(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const today = new Date();
    
    // Create array with all days in month
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Filter days that are not in the future
    const filteredDays = days.filter(day => isBefore(day, addDays(today, 1)));
    
    let cumulativeBalance = 0;
    
    return filteredDays.map(day => {
      // Get transactions for this day
      const dayTransactions = transactions.filter(tx => 
        isSameDay(new Date(tx.date), day)
      );
      
      // Calculate day's balance
      const dayIncome = dayTransactions
        .filter(tx => tx.type === 'income')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const dayExpenses = dayTransactions
        .filter(tx => tx.type === 'expense')
        .reduce((sum, tx) => sum + tx.amount, 0);
      
      const dayBalance = dayIncome - dayExpenses;
      cumulativeBalance += dayBalance;
      
      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        balance: cumulativeBalance
      };
    });
  }, [transactions, currentDate]);

  return (
    <Card className="h-full">
      <CardHeader 
        title="Saldo ao Longo do Tempo" 
        description="Evolução do saldo no mês atual"
      />
      <CardContent>
        {balanceData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={balanceData}
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
              <Line
                type="monotone"
                dataKey="balance"
                name="Saldo"
                stroke="#8884d8"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-center text-muted-foreground">
            <p>Sem dados disponíveis para o período.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TimeSeriesChart;
