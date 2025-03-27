
import React, { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { useFinance } from '@/hooks/useFinance';
import { Badge } from '@/components/ui/badge';

interface ExpenseChartProps {
  className?: string;
}

export function ExpenseChart({ className }: ExpenseChartProps) {
  const finance = useFinance();
  const { formatCurrency } = finance;
  const expenseData = finance.expenseBreakdown();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Filter out categories with value 0
  const filteredData = expenseData.filter(item => item.value > 0);
  
  // Calculate total expenses
  const totalExpenses = filteredData.reduce((sum, item) => sum + item.value, 0);
  
  // No expenses, show empty state
  if (filteredData.length === 0) {
    return (
      <Card className={className}>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Despesas por Categoria</CardTitle>
          <CardDescription>
            Distribuição de gastos por categoria no mês
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[200px]">
          <p className="text-muted-foreground">Sem despesas neste mês</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Despesas por Categoria</CardTitle>
        <CardDescription>
          Distribuição de gastos por categoria no mês
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                onMouseEnter={(_, index) => setActiveIndex(index)}
                onMouseLeave={() => setActiveIndex(null)}
              >
                {filteredData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    stroke={activeIndex === index ? 'white' : 'transparent'}
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const percentage = ((data.value / totalExpenses) * 100).toFixed(1);
                    return (
                      <div className="bg-background p-2 rounded-md shadow border">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(data.value)} ({percentage}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 mt-2 justify-center">
            {filteredData.map((category, index) => (
              <Badge 
                key={index} 
                style={{ backgroundColor: category.color }}
                className="text-white text-xs"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ExpenseChart;
