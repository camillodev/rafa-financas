
import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Clock, MoreHorizontal } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { SplitBill } from '@/types/finance';
import { useSplitBills } from '@/context/SplitBillsContext';

interface SplitBillsListProps {
  bills: SplitBill[];
}

export const SplitBillsList: React.FC<SplitBillsListProps> = ({ bills }) => {
  const { getParticipantById, completeBill, deleteBill } = useSplitBills();

  if (bills.length === 0) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-4">
      {bills.map((bill) => (
        <Card key={bill.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex flex-col md:flex-row justify-between w-full gap-4">
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Link to={`/split-bills/${bill.id}`} className="hover:underline">
                      <h3 className="text-lg font-medium">{bill.name}</h3>
                    </Link>
                    <Badge variant={bill.status === 'active' ? 'default' : 'secondary'}>
                      {bill.status === 'active' ? (
                        <><Clock className="h-3 w-3 mr-1" /> Ativa</>
                      ) : (
                        <><Check className="h-3 w-3 mr-1" /> Concluída</>
                      )}
                    </Badge>
                    {bill.category && (
                      <Badge variant="outline">{bill.category}</Badge>
                    )}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {format(bill.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {bill.participants.filter(p => p.isIncluded).map((participant) => {
                      const participantInfo = getParticipantById(participant.participantId);
                      if (!participantInfo) return null;
                      
                      return (
                        <div key={participant.participantId} className="flex items-center">
                          <Avatar className="h-6 w-6 mr-1">
                            <AvatarFallback className="text-xs">
                              {getInitials(participantInfo.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{participantInfo.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-semibold">
                      R$ {bill.totalAmount.toFixed(2).replace('.', ',')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {bill.divisionMethod === 'equal' && 'Divisão Igualitária'}
                      {bill.divisionMethod === 'fixed' && 'Valores Fixos'}
                      {bill.divisionMethod === 'percentage' && 'Porcentagens'}
                      {bill.divisionMethod === 'weight' && 'Por Pesos'}
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Opções</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link to={`/split-bills/${bill.id}`}>Ver detalhes</Link>
                      </DropdownMenuItem>
                      {bill.status === 'active' && (
                        <DropdownMenuItem onClick={() => completeBill(bill.id)}>
                          Marcar como concluída
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600" onClick={() => deleteBill(bill.id)}>
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
