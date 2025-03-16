
import React, { useState } from 'react';
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, Sector, Cell, Legend, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CalendarIcon, FileDown } from 'lucide-react';
import { format, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SplitBillsProvider, useSplitBills } from '@/context/SplitBillsContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { DateRange } from 'react-day-picker';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#9966FF', '#FF6B6B'];

const SplitBillsReportsContent = () => {
  const { bills, groups, participants, getParticipantById } = useSplitBills();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subMonths(new Date(), 3),
    to: new Date(),
  });
  const [selectedGroup, setSelectedGroup] = useState<string>('all');

  // Filter bills safely by date range and selected group
  const filteredBills = bills.filter(bill => {
    // Handle date filtering safely
    const inDateRange = dateRange.from && dateRange.to 
      ? bill.date >= dateRange.from && bill.date <= dateRange.to
      : dateRange.from
        ? bill.date >= dateRange.from
        : true;
    
    const inSelectedGroup = selectedGroup === 'all' || bill.groupId === selectedGroup;
    return inDateRange && inSelectedGroup;
  });

  // Data for expense by category pie chart
  const expenseByCategory = filteredBills.reduce((acc, bill) => {
    const category = bill.category || 'Sem categoria';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += bill.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const expenseByCategoryData = Object.entries(expenseByCategory).map(([name, value]) => ({
    name,
    value,
  }));

  // Data for expense by month bar chart
  const expenseByMonth = filteredBills.reduce((acc, bill) => {
    const month = format(bill.date, 'MMM', { locale: ptBR });
    if (!acc[month]) {
      acc[month] = 0;
    }
    acc[month] += bill.totalAmount;
    return acc;
  }, {} as Record<string, number>);

  const expenseByMonthData = Object.entries(expenseByMonth).map(([name, value]) => ({
    name,
    value,
  }));

  // Data for expense by participant
  const expenseByParticipant = filteredBills.reduce((acc, bill) => {
    bill.participants.forEach(participant => {
      if (participant.isIncluded) {
        const participantInfo = getParticipantById(participant.participantId);
        const name = participantInfo ? participantInfo.name : 'Desconhecido';
        if (!acc[name]) {
          acc[name] = 0;
        }
        
        // Calculate share based on division method
        let share = 0;
        const includedParticipants = bill.participants.filter(p => p.isIncluded);
        
        switch (bill.divisionMethod) {
          case 'equal':
            share = bill.totalAmount / includedParticipants.length;
            break;
          case 'fixed':
            share = participant.amount || 0;
            break;
          case 'percentage':
            share = bill.totalAmount * ((participant.percentage || 0) / 100);
            break;
          case 'weight':
            const totalWeight = includedParticipants.reduce((sum, p) => sum + (p.weight || 0), 0);
            share = totalWeight > 0 ? bill.totalAmount * ((participant.weight || 0) / totalWeight) : 0;
            break;
        }
        
        acc[name] += share;
      }
    });
    return acc;
  }, {} as Record<string, number>);

  const expenseByParticipantData = Object.entries(expenseByParticipant)
    .map(([name, value]) => ({
      name,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios</h1>
          <p className="text-muted-foreground">
            Visualize dados e estatísticas sobre suas divisões de despesas.
          </p>
        </div>
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Exportar Relatório
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <Card className="w-full md:w-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Período</CardTitle>
          </CardHeader>
          <CardContent>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
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
                  onSelect={(range) => {
                    if (range) {
                      // Make sure we have both from and to to avoid type issues
                      setDateRange({
                        from: range.from,
                        to: range.to || range.from
                      });
                    }
                  }}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </CardContent>
        </Card>

        <Card className="w-full md:w-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Grupo</CardTitle>
          </CardHeader>
          <CardContent>
            <Select value={selectedGroup} onValueChange={setSelectedGroup}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Selecione um grupo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os grupos</SelectItem>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="category">
        <TabsList>
          <TabsTrigger value="category">Por Categoria</TabsTrigger>
          <TabsTrigger value="time">Por Mês</TabsTrigger>
          <TabsTrigger value="participant">Por Participante</TabsTrigger>
        </TabsList>
        
        <TabsContent value="category" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Despesas por Categoria</CardTitle>
                <CardDescription>Distribuição das despesas por categoria no período selecionado</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseByCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expenseByCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo de Categorias</CardTitle>
                <CardDescription>Valores detalhados por categoria</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {expenseByCategoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="w-4 h-4 rounded-full mr-2"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span>{item.name}</span>
                      </div>
                      <span className="font-medium">
                        R$ {item.value.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="time" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Mês</CardTitle>
              <CardDescription>Evolução das despesas ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expenseByMonthData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
                    <Bar dataKey="value" fill="#8884d8">
                      {expenseByMonthData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="participant" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Despesas por Participante</CardTitle>
              <CardDescription>Quanto cada pessoa pagou no período selecionado</CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={expenseByParticipantData}
                    layout="vertical"
                    margin={{ top: 20, right: 30, left: 100, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip formatter={(value: number) => [`R$ ${value.toFixed(2)}`, 'Valor']} />
                    <Bar dataKey="value" fill="#8884d8">
                      {expenseByParticipantData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const SplitBillsReports = () => (
  <SplitBillsProvider>
    <AppLayout>
      <SplitBillsReportsContent />
    </AppLayout>
  </SplitBillsProvider>
);

export default SplitBillsReports;
