import React from 'react';
import { useFinance } from '@/context/FinanceContext';
import { ArrowUpRight, ArrowDownRight, ChevronRight, AlertCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TransactionList() {
  const { filteredTransactions, formatCurrency } = useFinance();
  // Use optional chaining to safely access missing properties
  const finance = useFinance();
  const navigateToTransactions = finance.navigateToTransactions ||
    (() => console.warn('navigateToTransactions not implemented'));
  const hasDataForCurrentMonth = finance.hasDataForCurrentMonth || false;
  
  // Get the most recent 5 transactions from the filtered transactions
  const recentTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  return (
    <div className="rounded-xl border bg-card shadow-sm h-full animate-fade-in">
      <div className="p-3 sm:p-6">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-medium">Transações Recentes</h3>
          <button 
            className="text-xs sm:text-sm text-primary hover:underline"
            onClick={() => navigateToTransactions()}
          >
            Ver Tudo
          </button>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          {hasDataForCurrentMonth ? (
            recentTransactions.map((transaction) => (
              <div 
                key={transaction.id}
                className="flex items-center justify-between p-2 sm:p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => navigateToTransactions()}
              >
                <div className="flex items-center gap-2 sm:gap-3">
                  <div 
                    className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'income' 
                        ? 'bg-finance-income/10 text-finance-income' 
                        : 'bg-finance-expense/10 text-finance-expense'
                    }`}
                  >
                    {transaction.type === 'income' ? (
                      <ArrowUpRight size={16} />
                    ) : (
                      <ArrowDownRight size={16} />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base line-clamp-1">{transaction.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })} • <span className="hidden sm:inline">{transaction.category}</span>
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1 sm:gap-2">
                  <span 
                    className={`font-medium text-xs sm:text-sm ${
                      transaction.type === 'income' ? 'text-finance-income' : 'text-finance-expense'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </span>
                  <button 
                    className="p-1 rounded-full hover:bg-accent"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigateToTransactions();
                    }}
                  >
                    <Eye size={14} className="text-muted-foreground" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center">
              <AlertCircle className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mb-2" />
              <h4 className="text-base sm:text-lg font-medium">Sem transações</h4>
              <p className="text-xs sm:text-sm text-muted-foreground">Não há transações para o mês selecionado</p>
            </div>
          )}
        </div>
        
        <div className="mt-4 pt-4 border-t">
          <button 
            className="w-full py-2 flex items-center justify-center gap-1 text-xs sm:text-sm text-primary hover:bg-primary/5 rounded-lg transition-colors"
            onClick={() => navigateToTransactions()}
          >
            Ver Todas as Transações
            <ChevronRight size={14} className="sm:w-4 sm:h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default TransactionList;
