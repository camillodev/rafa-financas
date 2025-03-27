
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Transaction } from '@/types/finance';
import { useFinance } from '@/hooks/useFinance';
import { cn } from '@/lib/utils';

interface TransactionItemProps {
  transaction: Transaction;
  showDate?: boolean;
}

export function TransactionItem({ transaction, showDate = true }: TransactionItemProps) {
  const { formatCurrency, findCategoryByName } = useFinance();
  
  // Find the category to get its color and icon
  const category = findCategoryByName(transaction.category);
  
  // Format the amount based on transaction type
  const formattedAmount = transaction.type === 'expense' 
    ? `- ${formatCurrency(transaction.amount)}` 
    : formatCurrency(transaction.amount);
    
  // Determine text color based on transaction type
  const amountClassName = transaction.type === 'expense'
    ? 'text-red-500'
    : 'text-green-500';
    
  // Format the date
  const formattedDate = format(
    new Date(transaction.date), 
    'dd MMM', 
    { locale: ptBR }
  );
  
  return (
    <div className="flex items-center justify-between py-2">
      <div className="flex items-center">
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center mr-3"
          style={{ backgroundColor: category?.color || '#e5e7eb' }}
        >
          <span className="text-white text-xs">
            {category?.icon || transaction.category.charAt(0).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium leading-none">
            {transaction.description}
          </p>
          <p className="text-xs text-muted-foreground">
            {transaction.category}
            {showDate && ` • ${formattedDate}`}
          </p>
        </div>
      </div>
      <div className={cn("text-sm font-medium", amountClassName)}>
        {formattedAmount}
      </div>
    </div>
  );
}

export default TransactionItem;
