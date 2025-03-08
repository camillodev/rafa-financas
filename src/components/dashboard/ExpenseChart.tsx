
import React, { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { useFinance } from '@/context/FinanceContext';
import { ChevronDown } from 'lucide-react';

export function ExpenseChart() {
  const { monthlyData, formatCurrency } = useFinance();
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');
  const [timeRange, setTimeRange] = useState('Este Ano');
  
  const renderChart = () => {
    if (chartType === 'area') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={monthlyData}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false}
              tick={{ fontSize: 12, fill: '#64748b' }}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }}
              tickFormatter={(value) => `${value === 0 ? 'R$ 0' : 'R$ ' + value / 1000 + 'k'}`}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  // Ensure we're working with numbers for the calculation
                  const incomeValue = Number(payload[0].value) || 0;
                  const expenseValue = Number(payload[1].value) || 0;
                  const netValue = incomeValue - expenseValue;
                  
                  return (
                    <div className="bg-background p-3 border rounded-lg shadow-md">
                      <p className="font-medium text-foreground">{label}</p>
                      <p className="text-sm text-finance-income">
                        Receitas: {formatCurrency(incomeValue)}
                      </p>
                      <p className="text-sm text-finance-expense">
                        Despesas: {formatCurrency(expenseValue)}
                      </p>
                      <p className="text-sm font-medium text-primary mt-1">
                        Saldo: {formatCurrency(netValue)}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="monotone"
              dataKey="income"
              stroke="#38bdf8"
              strokeWidth={2}
              fill="url(#incomeGradient)"
              activeDot={{ r: 6 }}
              name="Receitas"
            />
            <Area
              type="monotone"
              dataKey="expenses"
              stroke="#f97316"
              strokeWidth={2}
              fill="url(#expenseGradient)"
              activeDot={{ r: 6 }}
              name="Despesas"
            />
          </AreaChart>
        </ResponsiveContainer>
      );
    }
    
    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={monthlyData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false}
            tick={{ fontSize: 12, fill: '#64748b' }}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#64748b' }}
            tickFormatter={(value) => `${value === 0 ? 'R$ 0' : 'R$ ' + value / 1000 + 'k'}`}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                // Ensure we're working with numbers for the calculation
                const incomeValue = Number(payload[0].value) || 0;
                const expenseValue = Number(payload[1].value) || 0;
                const netValue = incomeValue - expenseValue;
                
                return (
                  <div className="bg-background p-3 border rounded-lg shadow-md">
                    <p className="font-medium text-foreground">{label}</p>
                    <p className="text-sm text-finance-income">
                      Receitas: {formatCurrency(incomeValue)}
                    </p>
                    <p className="text-sm text-finance-expense">
                      Despesas: {formatCurrency(expenseValue)}
                    </p>
                    <p className="text-sm font-medium text-primary mt-1">
                      Saldo: {formatCurrency(netValue)}
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <Legend 
            wrapperStyle={{ paddingTop: 10 }}
            formatter={(value) => <span className="text-sm">{value === "income" ? "Receitas" : "Despesas"}</span>}
          />
          <Bar dataKey="income" name="Receitas" fill="#38bdf8" radius={[4, 4, 0, 0]} />
          <Bar dataKey="expenses" name="Despesas" fill="#f97316" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };
  
  return (
    <div className="rounded-xl border bg-card shadow-sm animate-fade-in">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Receitas vs Despesas</h3>
          <div className="flex gap-2">
            <div className="relative">
              <button className="inline-flex items-center gap-1 text-sm border rounded-md px-2 py-1">
                {timeRange}
                <ChevronDown size={14} />
              </button>
            </div>
            <div className="flex overflow-hidden rounded-md border">
              <button
                className={`px-3 py-1 text-xs font-medium ${
                  chartType === 'area'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground'
                }`}
                onClick={() => setChartType('area')}
              >
                Área
              </button>
              <button
                className={`px-3 py-1 text-xs font-medium ${
                  chartType === 'bar'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-background text-muted-foreground'
                }`}
                onClick={() => setChartType('bar')}
              >
                Barra
              </button>
            </div>
          </div>
        </div>
        {renderChart()}
      </div>
    </div>
  );
}

export default ExpenseChart;
