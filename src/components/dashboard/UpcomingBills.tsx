
import React from 'react';
import { Calendar, AlertCircle, ArrowRight, Check, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useFinance } from '@/context/FinanceContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from "@/components/ui/badge";
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function UpcomingBills() {
  const { filteredTransactions, formatCurrency } = useFinance();
  const navigate = useNavigate();
  
  const today = new Date();
  const nextWeek = addDays(today, 7);
  
  // Filter for bills due in the next 7 days
  const upcomingBills = filteredTransactions
    .filter(tx => 
      tx.type === 'expense' && 
      tx.category === 'Contas a Pagar' &&
      tx.dueDate && // Make sure it has a due date
      !isAfter(new Date(tx.dueDate), nextWeek) &&
      (!tx.status || tx.status !== 'completed')
    )
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3);
  
  const getBillStatus = (bill: typeof filteredTransactions[0]) => {
    if (bill.status === 'completed') {
      return { label: 'Pago', color: 'bg-green-500 text-white', icon: <Check size={12} /> };
    }
    
    if (bill.dueDate && isBefore(new Date(bill.dueDate), today)) {
      return { label: 'Atrasado', color: 'bg-red-500 text-white', icon: <AlertCircle size={12} /> };
    }
    
    return { label: 'Pendente', color: 'bg-yellow-500 text-white', icon: <Clock size={12} /> };
  };
  
  const handleNavigateToBills = () => {
    navigate('/bills');
  };
  
  return (
    <Card className="animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contas Próximas</CardTitle>
        <button 
          className="text-sm text-primary hover:underline flex items-center gap-1"
          onClick={handleNavigateToBills}
        >
          Ver Todas <ArrowRight size={16} />
        </button>
      </CardHeader>
      <CardContent>
        {upcomingBills.length > 0 ? (
          <div className="space-y-3">
            {upcomingBills.map((bill) => {
              const status = getBillStatus(bill);
              
              return (
                <div 
                  key={bill.id}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer border"
                  onClick={handleNavigateToBills}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                      <Calendar size={18} />
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{bill.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className={`text-xs px-2 py-0.5 ${status.color} flex items-center gap-1`}>
                          {status.icon} {status.label}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {bill.dueDate && format(new Date(bill.dueDate), 'dd MMM', { locale: ptBR })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className="font-semibold text-destructive">{formatCurrency(bill.amount)}</span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Sem contas próximas</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default UpcomingBills;
