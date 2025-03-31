
import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { ArrowRight } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import { useFinanceNavigation } from '@/hooks/useFinanceNavigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function TransactionList() {
  const { transactions, formatCurrency } = useFinance();
  const { navigateToTransactions } = useFinanceNavigation();
  
  const currentDate = new Date();
  const currentMonthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const currentMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  
  const recentTransactions = transactions
    .filter(transaction => {
      const txDate = new Date(transaction.date);
      return txDate >= currentMonthStart && txDate <= currentMonthEnd;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  
  const hasTransactions = recentTransactions.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Transações Recentes</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigateToTransactions()} 
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Ver todas
          <ArrowRight className="ml-1 h-4 w-4" />
        </Button>
      </div>
      
      {hasTransactions ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentTransactions.map(transaction => (
              <TableRow key={transaction.id}>
                <TableCell className="font-medium">{transaction.description}</TableCell>
                <TableCell>
                  {format(new Date(transaction.date), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell className={`text-right ${transaction.type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                  {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 border rounded-lg">
          <p className="text-muted-foreground">Não há transações recentes</p>
        </div>
      )}
    </div>
  );
}

export default TransactionList;
