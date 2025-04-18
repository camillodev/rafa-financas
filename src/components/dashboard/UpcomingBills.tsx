
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useFinance } from '@/hooks/useFinance';
import { Calendar, AlertCircle } from 'lucide-react';
import { format, addDays, isAfter, differenceInDays, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import CardHeader from '@/components/ui/atoms/CardHeader';

export function UpcomingBills() {
  const { transactions, formatCurrency } = useFinance();
  
  // Filter upcoming bills (transactions with future dueDate)
  const upcomingBills = useMemo(() => {
    const today = new Date();
    
    return transactions
      .filter(transaction => 
        transaction.type === 'expense' && 
        transaction.dueDate && 
        isFuture(new Date(transaction.dueDate))
      )
      .sort((a, b) => {
        const dateA = new Date(a.dueDate!);
        const dateB = new Date(b.dueDate!);
        return dateA.getTime() - dateB.getTime();
      });
  }, [transactions]);
  
  // Group bills by "today", "this week", "this month", "later"
  const groupedBills = useMemo(() => {
    const today = new Date();
    const thisWeek = addDays(today, 7);
    const thisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0); // Last day of current month
    
    return {
      today: upcomingBills.filter(bill => {
        const dueDate = new Date(bill.dueDate!);
        return format(dueDate, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
      }),
      thisWeek: upcomingBills.filter(bill => {
        const dueDate = new Date(bill.dueDate!);
        return isAfter(dueDate, today) && 
               !isAfter(dueDate, thisWeek) && 
               format(dueDate, 'yyyy-MM-dd') !== format(today, 'yyyy-MM-dd');
      }),
      thisMonth: upcomingBills.filter(bill => {
        const dueDate = new Date(bill.dueDate!);
        return isAfter(dueDate, thisWeek) && !isAfter(dueDate, thisMonth);
      }),
      later: upcomingBills.filter(bill => {
        const dueDate = new Date(bill.dueDate!);
        return isAfter(dueDate, thisMonth);
      })
    };
  }, [upcomingBills]);

  const getBillEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
      <p className="text-muted-foreground mb-1">Sem contas próximas</p>
      <p className="text-xs text-muted-foreground">As contas a vencer aparecerão aqui</p>
    </div>
  );
  
  return (
    <Card>
      <CardHeader 
        title="Contas a Vencer"
        className="pb-0"
      />
      <CardContent>
        <ScrollArea className="h-[300px] pr-3">
          {upcomingBills.length > 0 ? (
            <div className="space-y-6">
              {groupedBills.today.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Hoje</h4>
                  <div className="space-y-2">
                    {groupedBills.today.map(bill => (
                      <BillItem key={bill.id} bill={bill} formatCurrency={formatCurrency} />
                    ))}
                  </div>
                </div>
              )}
              
              {groupedBills.thisWeek.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Esta semana</h4>
                  <div className="space-y-2">
                    {groupedBills.thisWeek.map(bill => (
                      <BillItem key={bill.id} bill={bill} formatCurrency={formatCurrency} />
                    ))}
                  </div>
                </div>
              )}
              
              {groupedBills.thisMonth.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Este mês</h4>
                  <div className="space-y-2">
                    {groupedBills.thisMonth.map(bill => (
                      <BillItem key={bill.id} bill={bill} formatCurrency={formatCurrency} />
                    ))}
                  </div>
                </div>
              )}
              
              {groupedBills.later.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Mais tarde</h4>
                  <div className="space-y-2">
                    {groupedBills.later.map(bill => (
                      <BillItem key={bill.id} bill={bill} formatCurrency={formatCurrency} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            getBillEmptyState()
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface BillItemProps {
  bill: any; // Using 'any' temporarily to avoid TypeScript errors
  formatCurrency: (value: number) => string;
}

function BillItem({ bill, formatCurrency }: BillItemProps) {
  // Ensure dueDate is a Date object
  const dueDate = bill.dueDate instanceof Date ? bill.dueDate : new Date(bill.dueDate);
  const today = new Date();
  const days = differenceInDays(dueDate, today);
  
  // Define class based on urgency
  const urgencyClass = days <= 1 ? "bg-red-50 dark:bg-red-950/30" : days <= 3 ? "bg-orange-50 dark:bg-orange-950/30" : "bg-gray-50 dark:bg-gray-900/30";
  
  return (
    <div className={cn("rounded-md p-3 flex justify-between items-center", urgencyClass)}>
      <div className="flex-1">
        <div className="font-medium">{bill.description}</div>
        <div className="text-sm text-muted-foreground flex items-center">
          <Calendar className="h-3 w-3 mr-1" />
          {format(dueDate, 'dd/MM/yyyy', { locale: ptBR })}
        </div>
      </div>
      <div className="text-right">
        <div className="font-medium text-red-600 dark:text-red-400">
          {formatCurrency(bill.amount)}
        </div>
        <div className="mt-1">
          {days === 0 ? (
            <Badge variant="destructive">Hoje</Badge>
          ) : days === 1 ? (
            <Badge variant="outline">Amanhã</Badge>
          ) : (
            <Badge variant="outline">Em {days} dias</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpcomingBills;
