
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useFinance } from '@/context/FinanceContext';

export function CategoryBreakdown() {
  const { expenseBreakdown, formatCurrency } = useFinance();
  
  // Filter out categories with 0 value
  const filteredData = expenseBreakdown.filter(item => item.value > 0);
  
  return (
    <div className="rounded-xl border bg-card shadow-sm h-full animate-fade-in">
      <div className="p-6">
        <h3 className="text-lg font-medium mb-6">Despesas por Categoria</h3>
        
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={filteredData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                nameKey="category"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [formatCurrency(Number(value)), 'Valor']}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-background p-3 border rounded-lg shadow-md">
                        <p className="font-medium" style={{ color: data.color }}>{data.category}</p>
                        <p className="text-sm text-foreground">{formatCurrency(data.value)}</p>
                        <p className="text-xs text-muted-foreground">
                          {((data.value / expenseBreakdown.reduce((a, b) => a + b.value, 0)) * 100).toFixed(1)}% do total
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mt-4">
          {filteredData.slice(0, 4).map((item) => (
            <div key={item.category} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-xs font-medium truncate">{item.category}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryBreakdown;
