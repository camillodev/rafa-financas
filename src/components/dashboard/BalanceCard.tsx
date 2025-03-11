
import React from 'react';
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react';
import { useFinance } from '@/context/FinanceContext';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function BalanceCard() {
  const { financialSummary, formatCurrency, navigateToTransactions } = useFinance();
  
  const cards = [
    {
      title: 'Saldo Total',
      value: financialSummary.netBalance,
      icon: <DollarSign className="h-5 w-5 text-primary" />,
      valueColor: 'text-primary',
      onClick: () => {}
    },
    {
      title: 'Receitas',
      value: financialSummary.totalIncome,
      icon: <ArrowUpRight className="h-5 w-5 text-finance-income" />,
      valueColor: 'text-finance-income',
      onClick: () => navigateToTransactions('income')
    },
    {
      title: 'Despesas',
      value: financialSummary.totalExpenses,
      icon: <ArrowDownRight className="h-5 w-5 text-finance-expense" />,
      valueColor: 'text-finance-expense',
      onClick: () => navigateToTransactions('expense')
    },
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-6">
      {cards.map((card, index) => (
        <div 
          key={card.title}
          className={cn(
            "relative overflow-hidden rounded-xl border p-4 shadow-sm transition-all hover:shadow-md animate-scale-in bg-card",
            index > 0 ? "cursor-pointer" : ""
          )}
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={card.onClick}
        >
          <div className="flex justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <div className={cn("text-2xl font-bold", card.valueColor)}>
                <AnimatedNumber 
                  value={card.value} 
                  formatValue={(value) => formatCurrency(value)}
                />
              </div>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-background/90">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default BalanceCard;
