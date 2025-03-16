
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, ArrowUpDown } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useUser } from '@clerk/clerk-react';

import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SplitBillsProvider, useSplitBills } from '@/context/SplitBillsContext';
import { AddBillForm } from '@/components/split-bills/AddBillForm';
import { SplitBillsList } from '@/components/split-bills/SplitBillsList';

const SplitBillsHomeContent = () => {
  const { user } = useUser();
  const { 
    bills, 
    getActiveBills, 
    getCompletedBills, 
    getTotalToReceive, 
    getTotalToPay, 
    getBalanceTotal 
  } = useSplitBills();
  const [isAddBillOpen, setIsAddBillOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");

  const activeBills = getActiveBills();
  const completedBills = getCompletedBills();

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dividir Contas</h1>
          <p className="text-muted-foreground">
            Gerencie facilmente as despesas compartilhadas com amigos e familiares.
          </p>
        </div>
        <Dialog open={isAddBillOpen} onOpenChange={setIsAddBillOpen}>
          <DialogTrigger asChild>
            <Button className="mt-2 md:mt-0">
              <Plus className="mr-2 h-4 w-4" />
              Nova Divisão
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Nova Divisão</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da despesa que você deseja dividir.
              </DialogDescription>
            </DialogHeader>
            <AddBillForm onSuccess={() => setIsAddBillOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Você tem a receber
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              R$ {getTotalToReceive().toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Você tem a pagar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {getTotalToPay().toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Saldo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getBalanceTotal() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              R$ {getBalanceTotal().toFixed(2).replace('.', ',')}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="active" className="relative">
              Ativas
              <Badge 
                className="ml-2 bg-primary text-primary-foreground absolute -top-2 -right-2" 
                variant="secondary"
              >
                {activeBills.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="relative">
              Concluídas
              <Badge 
                className="ml-2 bg-muted text-muted-foreground absolute -top-2 -right-2" 
                variant="secondary"
              >
                {completedBills.length}
              </Badge>
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Ordenar
            </Button>
          </div>
        </div>
        
        <TabsContent value="active" className="mt-6">
          {activeBills.length > 0 ? (
            <SplitBillsList bills={activeBills} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">Você não tem divisões ativas no momento.</p>
                <Button onClick={() => setIsAddBillOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Nova Divisão
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {completedBills.length > 0 ? (
            <SplitBillsList bills={completedBills} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">Você não tem divisões concluídas.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

const SplitBillsHome = () => (
  <SplitBillsProvider>
    <AppLayout>
      <SplitBillsHomeContent />
    </AppLayout>
  </SplitBillsProvider>
);

export default SplitBillsHome;
