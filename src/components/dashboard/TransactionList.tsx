
import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, ChevronRight, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function TransactionList() {
  const { currentMonthTransactions, formatCurrency, navigateToTransactions } = useFinance();
  
  // Get the most recent 5 transactions from the current month
  const recentTransactions = [...currentMonthTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <div className="rounded-xl border bg-card shadow-sm h-full animate-fade-in">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium">Transações Recentes</h3>
          <button 
            className="text-sm text-primary hover:underline"
            onClick={() => navigateToTransactions()}
          >
            Ver Tudo
          </button>
        </div>
        
        <div className="space-y-4">
          {recentTransactions.length > 0 ? (
            recentTransactions.map((transaction) => (
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
                      {format(new Date(transaction.date), 'dd/MM/yyyy')} • {transaction.category}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span 
                    className={`font-medium ${
                      transaction.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                  <button className="p-1 rounded-full hover:bg-accent">
                    <MoreHorizontal size={16} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
              <h4 className="text-lg font-medium">Sem transações</h4>
              <p className="text-sm text-muted-foreground">Não há transações para o mês atual</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <button 
            className="w-full py-2 flex items-center justify-center gap-1 text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
            onClick={() => navigateToTransactions()}
          >
            Ver Todas as Transações
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionList;
