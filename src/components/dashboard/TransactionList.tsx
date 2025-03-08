
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export function TransactionList() {
  const { transactions } = useFinance();
  
  // Get the most recent 5 transactions
  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <div className="rounded-xl border bg-card shadow-sm h-full animate-fade-in">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Recent Transactions</h3>
          <button className="text-sm text-primary hover:underline">
            View All
          </button>
        </div>
        
        <div className="space-y-4">
          {recentTransactions.map((transaction) => (
            <div 
              key={transaction.id}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-finance-income/10 text-finance-income' 
                      : 'bg-finance-expense/10 text-finance-expense'
                  }`}
                >
                  {transaction.type === 'income' ? (
                    <ArrowUpRight size={18} />
                  ) : (
                    <ArrowDownRight size={18} />
                  )}
                </div>
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(transaction.date), 'MMM d, yyyy')} • {transaction.category}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span 
                  className={`font-medium ${
                    transaction.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                  }`}
                >
                  {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                </span>
                <button className="p-1 rounded-full hover:bg-accent">
                  <MoreHorizontal size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <button className="w-full py-2 flex items-center justify-center gap-1 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors">
            View All Transactions
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionList;
