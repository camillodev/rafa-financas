
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance, TransactionFilterType } from '@/context/FinanceContext';
import { ArrowUpRight, ArrowDownRight, MoreHorizontal, Filter, X, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export function Transactions() {
  const { transactions, formatCurrency } = useFinance();
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<TransactionFilterType>('all');
  
  useEffect(() => {
    const filterParam = searchParams.get('filter') as TransactionFilterType | null;
    if (filterParam && ['income', 'expense'].includes(filterParam)) {
      setFilter(filterParam);
    } else {
      setFilter('all');
    }
  }, [searchParams]);
  
  const filteredTransactions = transactions.filter(transaction => {
    if (filter === 'all') return true;
    return transaction.type === filter;
  });
  
  const handleClearFilter = () => {
    setSearchParams({});
    setFilter('all');
  };
  
  const handleSetFilter = (newFilter: TransactionFilterType) => {
    if (newFilter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter: newFilter });
    }
    setFilter(newFilter);
  };
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Transações</h1>
        <p className="text-muted-foreground mt-1">
          Visualize e gerencie todas as suas transações
        </p>
      </div>
      
      {/* Filter Bar */}
      <div className="mb-6 flex flex-wrap gap-2 items-center">
        <div className="bg-accent p-2 rounded-lg flex items-center">
          <Filter size={16} className="mr-2 text-muted-foreground" />
          <span className="text-sm font-medium mr-2">Filtrar por:</span>
          
          <div className="flex gap-1">
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-background'
              }`}
              onClick={() => handleSetFilter('all')}
            >
              Todos
            </button>
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                filter === 'income' ? 'bg-finance-income text-white' : 'bg-background'
              }`}
              onClick={() => handleSetFilter('income')}
            >
              Receitas
            </button>
            <button 
              className={`px-3 py-1 text-xs font-medium rounded-md ${
                filter === 'expense' ? 'bg-finance-expense text-white' : 'bg-background'
              }`}
              onClick={() => handleSetFilter('expense')}
            >
              Despesas
            </button>
          </div>
        </div>
        
        {filter !== 'all' && (
          <button 
            className="flex items-center gap-1 text-xs bg-background px-3 py-1 rounded-md border"
            onClick={handleClearFilter}
          >
            <span>Limpar filtro</span>
            <X size={12} />
          </button>
        )}
      </div>
      
      {/* Transactions List */}
      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-6">Lista de Transações</h3>
          
          {filteredTransactions.length > 0 ? (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div 
                  key={transaction.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
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
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h4 className="text-xl font-medium">Nenhuma transação encontrada</h4>
              <p className="text-sm text-muted-foreground mt-2">
                {filter !== 'all' 
                  ? `Não existem transações do tipo ${filter === 'income' ? 'receita' : 'despesa'}`
                  : 'Não existem transações registradas'}
              </p>
              {filter !== 'all' && (
                <button 
                  className="mt-4 px-4 py-2 bg-accent rounded-lg text-sm font-medium"
                  onClick={handleClearFilter}
                >
                  Limpar filtro
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default Transactions;
