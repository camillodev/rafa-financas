
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BalanceCard from '@/components/dashboard/BalanceCard';
import ExpenseChart from '@/components/dashboard/ExpenseChart';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import TransactionList from '@/components/dashboard/TransactionList';
import BudgetProgress from '@/components/dashboard/BudgetProgress';
import MonthFilter from '@/components/ui/MonthFilter';
import { useFinance } from '@/context/FinanceContext';
import UpcomingBills from '@/components/dashboard/UpcomingBills';
import SavingsGoals from '@/components/dashboard/SavingsGoals';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Index = () => {
  const { currentDate, navigateToPreviousMonth, navigateToNextMonth } = useFinance();

  return (
    <AppLayout>
      <DashboardHeader />
      
      <MonthFilter 
        currentDate={currentDate}
        onPreviousMonth={navigateToPreviousMonth}
        onNextMonth={navigateToNextMonth}
      />
      
      <BalanceCard />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-3 xl:col-span-2">
          <Tabs defaultValue="expenses" className="w-full">
            <TabsList className="mb-4 overflow-x-auto max-w-full flex-nowrap w-auto">
              <TabsTrigger value="expenses" className="flex-shrink-0">Receitas vs Despesas</TabsTrigger>
              <TabsTrigger value="categories" className="flex-shrink-0">Despesas por Categoria</TabsTrigger>
            </TabsList>
            <TabsContent value="expenses">
              <ExpenseChart />
            </TabsContent>
            <TabsContent value="categories">
              <CategoryBreakdown />
            </TabsContent>
          </Tabs>
        </div>
        <div className="lg:col-span-3 xl:col-span-1">
          <SavingsGoals />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        <TransactionList />
        <div className="grid grid-cols-1 gap-4 lg:gap-6">
          <BudgetProgress />
          <UpcomingBills />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
