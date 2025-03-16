
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, ArrowUpDown, Receipt } from 'lucide-react';
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { SplitBillsProvider, useSplitBills } from '@/context/SplitBillsContext';
import { SplitBillsList } from '@/components/split-bills/SplitBillsList';
import { AddExpenseModal } from '@/components/split-bills/AddExpenseModal';

const SplitBillsHomeContent = () => {
  const { user } = useUser();
  const { 
    bills, 
    getActiveBills, 
    getCompletedBills, 
    getTotalToReceive, 
    getTotalToPay, 
    getBalanceTotal,
    participants 
  } = useSplitBills();
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const activeBills = getActiveBills();
  const completedBills = getCompletedBills();

  // Sorting function
  const sortedActiveBills = [...activeBills].sort((a, b) => {
    if (sortBy === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return sortDirection === 'asc' 
        ? a.totalAmount - b.totalAmount
        : b.totalAmount - a.totalAmount;
    }
  });

  const sortedCompletedBills = [...completedBills].sort((a, b) => {
    if (sortBy === 'date') {
      return sortDirection === 'asc' 
        ? new Date(a.date).getTime() - new Date(b.date).getTime()
        : new Date(b.date).getTime() - new Date(a.date).getTime();
    } else {
      return sortDirection === 'asc' 
        ? a.totalAmount - b.totalAmount
        : b.totalAmount - a.totalAmount;
    }
  });

  // Filtered bills
  const filteredActiveBills = filterCategory 
    ? sortedActiveBills.filter(bill => bill.category === filterCategory)
    : sortedActiveBills;

  const filteredCompletedBills = filterCategory 
    ? sortedCompletedBills.filter(bill => bill.category === filterCategory)
    : sortedCompletedBills;

  // Sorting handlers
  const handleSort = () => {
    if (sortBy === 'date') {
      setSortBy('amount');
      setSortDirection('desc');
    } else {
      setSortBy('date');
      setSortDirection('desc');
    }
  };

  // Get all categories for filtering
  const allCategories = [...new Set(bills.map(bill => bill.category).filter(Boolean))];

  // Filter toggle
  const toggleFilter = (category: string | null) => {
    setFilterCategory(category === filterCategory ? null : category);
  };

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dividir Contas</h1>
          <p className="text-muted-foreground">
            Gerencie facilmente as despesas compartilhadas com amigos e familiares.
          </p>
        </div>
        
        <Button 
          onClick={() => setIsAddExpenseOpen(true)} 
          size="lg" 
          className="mt-2 md:mt-0 shadow-md"
        >
          <Receipt className="mr-2 h-5 w-5" />
          Adicionar Despesa
        </Button>
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
            <TabsTrigger value="active">
              Ativas
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídas
            </TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
            <div className="relative">
              <Button variant="outline" size="sm" onClick={() => document.getElementById('filterMenu')?.classList.toggle('hidden')}>
                <Filter className="h-4 w-4 mr-2" />
                Filtrar
              </Button>
              <div id="filterMenu" className="hidden absolute right-0 mt-2 z-50 bg-background border rounded-md shadow-lg p-2 w-48">
                <div className="font-medium mb-2">Categorias</div>
                <div className="space-y-1">
                  {allCategories.map(category => (
                    <div 
                      key={category}
                      className={`px-2 py-1 rounded cursor-pointer text-sm ${filterCategory === category ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
                      onClick={() => toggleFilter(category)}
                    >
                      {category}
                    </div>
                  ))}
                  {allCategories.length === 0 && (
                    <div className="text-sm text-muted-foreground px-2">Sem categorias</div>
                  )}
                </div>
                {filterCategory && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => setFilterCategory(null)}
                  >
                    Limpar filtro
                  </Button>
                )}
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleSort}>
              <ArrowUpDown className="h-4 w-4 mr-2" />
              {sortBy === 'date' ? 'Por Data' : 'Por Valor'}
            </Button>
          </div>
        </div>
        
        <TabsContent value="active" className="mt-6">
          {filteredActiveBills.length > 0 ? (
            <SplitBillsList bills={filteredActiveBills} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground mb-4">
                  {filterCategory 
                    ? `Não há despesas ativas na categoria "${filterCategory}".` 
                    : "Você não tem divisões ativas no momento."}
                </p>
                <Button onClick={() => setIsAddExpenseOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Nova Despesa
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-6">
          {filteredCompletedBills.length > 0 ? (
            <SplitBillsList bills={filteredCompletedBills} />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <p className="text-muted-foreground">
                  {filterCategory 
                    ? `Não há despesas concluídas na categoria "${filterCategory}".` 
                    : "Você não tem divisões concluídas."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Modal de adição de despesa */}
      <AddExpenseModal 
        isOpen={isAddExpenseOpen} 
        onClose={() => setIsAddExpenseOpen(false)} 
      />
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
