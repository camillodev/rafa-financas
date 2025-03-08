
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
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <ExpenseChart />
        </div>
        <div>
          <CategoryBreakdown />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TransactionList />
        <BudgetProgress />
      </div>
    </AppLayout>
  );
};

export default Index;
