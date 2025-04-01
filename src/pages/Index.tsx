
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import BalanceCard from '@/components/dashboard/BalanceCard';
import ExpenseChart from '@/components/dashboard/ExpenseChart';
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown';
import TransactionList from '@/components/dashboard/TransactionList';
import BudgetProgress from '@/components/dashboard/BudgetProgress';
import MonthFilter from '@/components/ui/MonthFilter';
import { useFinance } from '@/hooks/useFinance';
import { UpcomingBills } from '@/components/dashboard/UpcomingBills';
import SavingsGoals from '@/components/dashboard/SavingsGoals';
import TimeSeriesChart from '@/components/dashboard/TimeSeriesChart';
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
      <div className="space-y-6">
        <DashboardHeader />
        
        <MonthFilter 
          currentDate={currentDate}
          onPreviousMonth={navigateToPreviousMonth}
          onNextMonth={navigateToNextMonth}
        />
        
        {/* First Row - Balance & Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <div className="md:col-span-1 xl:col-span-1">
            <BalanceCard />
          </div>
          <div className="md:col-span-1 xl:col-span-1">
            <SavingsGoals />
          </div>
          <div className="md:col-span-2 xl:col-span-2">
            <BudgetProgress />
          </div>
        </div>
        
        {/* Second Row - Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
          <div className="lg:col-span-4">
            <Tabs defaultValue="comparison" className="w-full">
              <TabsList className="mb-4 overflow-x-auto flex w-auto">
                <TabsTrigger value="comparison">Receitas vs Despesas</TabsTrigger>
                <TabsTrigger value="timeline">Saldo ao Longo do Tempo</TabsTrigger>
              </TabsList>
              <TabsContent value="comparison" className="h-full">
                <ExpenseChart />
              </TabsContent>
              <TabsContent value="timeline" className="h-full">
                <TimeSeriesChart />
              </TabsContent>
            </Tabs>
          </div>
          <div className="lg:col-span-3">
            <CategoryBreakdown />
          </div>
        </div>
        
        {/* Third Row - Transactions & Upcoming Bills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="lg:col-span-1">
            <TransactionList />
          </div>
          <div className="lg:col-span-1">
            <UpcomingBills />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
