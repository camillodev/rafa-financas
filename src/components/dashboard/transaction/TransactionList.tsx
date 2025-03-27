
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TransactionItem } from './TransactionItem';
import { useFinance } from '@/hooks/useFinance';

interface TransactionListProps {
  className?: string;
  limit?: number;
}

export function TransactionList({ className, limit = 5 }: TransactionListProps) {
  const finance = useFinance();
  const { filteredTransactions, navigateToTransactions, hasDataForCurrentMonth } = finance;
  
  // Sort transactions by date (most recent first)
  const sortedTransactions = [...filteredTransactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Transações Recentes</CardTitle>
        <CardDescription>
          {hasDataForCurrentMonth() 
            ? `Suas últimas ${Math.min(limit, sortedTransactions.length)} transações` 
            : 'Sem transações neste mês'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedTransactions.length > 0 ? (
            sortedTransactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Nenhuma transação encontrada para este mês
              </p>
              <Button variant="outline" size="sm" onClick={() => navigateToTransactions()}>
                Adicionar transação
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      {sortedTransactions.length > 0 && (
        <CardFooter>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full" 
            onClick={() => navigateToTransactions()}
          >
            Ver todas as transações
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

export default TransactionList;
