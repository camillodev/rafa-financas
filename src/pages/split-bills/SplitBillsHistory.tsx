
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Check, X, Clock, CalendarIcon } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SplitBillsProvider, useSplitBills } from '@/context/SplitBillsContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';

const SplitBillsHistoryContent = () => {
  const { bills, getParticipantById } = useSplitBills();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });

  // Filter bills by search query, status and date range
  const filteredBills = bills.filter(bill => {
    const matchesSearch = bill.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || bill.status === statusFilter;
    const inDateRange = bill.date >= dateRange.from && bill.date <= dateRange.to;
    
    return matchesSearch && matchesStatus && inDateRange;
  });

  // Sort bills by date (newest first)
  const sortedBills = [...filteredBills].sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Histórico</h1>
        <p className="text-muted-foreground">
          Visualize o histórico completo de todas as suas divisões de despesas.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as 'all' | 'active' | 'completed')}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="active">Ativas</SelectItem>
            <SelectItem value="completed">Concluídas</SelectItem>
          </SelectContent>
        </Select>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full md:w-auto justify-start">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.from ? (
                dateRange.to ? (
                  <>
                    {format(dateRange.from, "dd/MM/yyyy")} - {format(dateRange.to, "dd/MM/yyyy")}
                  </>
                ) : (
                  format(dateRange.from, "dd/MM/yyyy")
                )
              ) : (
                <span>Selecione um período</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={dateRange}
              onSelect={(range) => range && setDateRange(range)}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        
        <Button variant="outline" className="w-full md:w-auto" onClick={() => {
          setSearchQuery('');
          setStatusFilter('all');
          setDateRange({
            from: subMonths(new Date(), 3),
            to: new Date(),
          });
        }}>
          Limpar Filtros
        </Button>
      </div>

      {sortedBills.length > 0 ? (
        <div className="space-y-4">
          {sortedBills.map((bill) => (
            <Card key={bill.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <CardContent className="p-0">
                <Link to={`/split-bills/${bill.id}`} className="block p-4">
                  <div className="flex flex-col md:flex-row justify-between w-full">
                    <div className="space-y-2">
                      <div className="flex gap-2 items-center">
                        <h3 className="text-lg font-medium">{bill.name}</h3>
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
                          return participantInfo ? (
                            <Badge key={participant.participantId} variant="outline" className="px-2 py-1">
                              {participantInfo.name}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                    
                    <div className="mt-4 md:mt-0 flex flex-col items-end justify-center">
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
                  </div>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-8">
            {searchQuery || statusFilter !== 'all' || dateRange ? (
              <p className="text-muted-foreground">Nenhuma divisão encontrada com os filtros aplicados.</p>
            ) : (
              <p className="text-muted-foreground">Você ainda não tem divisões registradas.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

const SplitBillsHistory = () => (
  <SplitBillsProvider>
    <AppLayout>
      <SplitBillsHistoryContent />
    </AppLayout>
  </SplitBillsProvider>
);

export default SplitBillsHistory;
