import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { Transaction } from '@/types/finance';

interface UseTransactionExportOptions {
  dateFormat?: string;
  filename?: string;
  currentDate?: Date;
}

export function useTransactionExport(options: UseTransactionExportOptions = {}) {
  const {
    dateFormat = 'MMM-yyyy',
    filename = 'rafa-financas-transacoes',
    currentDate = new Date()
  } = options;

  const exportTransactions = (transactions: Transaction[]) => {
    // Create CSV content
    let csvContent = 'Data,Data de Liquidação,Categoria,Subcategoria,Instituição,Tipo de Transação,Descrição,Valor,Status,Tipo\n';

    transactions.forEach(transaction => {
      const row = [
        transaction.date,
        transaction.settlementDate || '',
        transaction.category,
        transaction.subcategory || '',
        transaction.financialInstitution || '',
        transaction.transactionType || '',
        transaction.description,
        transaction.amount,
        transaction.status,
        transaction.type
      ].map(value => {
        // Ensure strings are properly escaped for CSV
        if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',');

      csvContent += row + '\n';
    });

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${format(currentDate, dateFormat, { locale: ptBR })}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Transações exportadas com sucesso");
  };

  return { exportTransactions };
} 