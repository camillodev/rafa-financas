
import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { ArrowRight } from 'lucide-react';
import { Transaction } from '@/types/finance';
import { useFinance } from '@/hooks/useFinance';
import { useFinanceNavigation } from '@/hooks/useFinanceNavigation';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface TransactionListProps {
  title: string;
  transactions: Transaction[];
  limit?: number;
  showHeader?: boolean;
  emptyMessage?: string;
}

export function TransactionList({ 
  title, 
  transactions, 
  limit = 5, 
  showHeader = true,
  emptyMessage = "Nenhuma transação encontrada"
}: TransactionListProps) {
  const { formatCurrency } = useFinance();
  const { navigateToTransactions } = useFinanceNavigation();
  
  const displayTransactions = transactions.slice(0, limit);
  
  const showViewMore = Boolean(transactions.length > limit);

  return (
    <div className="space-y-4">
      {showHeader && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">{title}</h3>
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
      )}
      
      {displayTransactions.length > 0 ? (
        <>
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
              {displayTransactions.map(transaction => (
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
          
          {showViewMore && (
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => navigateToTransactions()}
              >
                Ver mais transações
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 border rounded-lg bg-background">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </div>
  );
}
