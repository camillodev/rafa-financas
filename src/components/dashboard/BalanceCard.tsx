
import React from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useFinance } from '@/hooks/useFinance';
import AnimatedNumber from "@/components/ui/AnimatedNumber";
import StatValue from "@/components/ui/atoms/StatValue";
import CardHeader from "@/components/ui/atoms/CardHeader";

const BalanceCard = () => {
  const finance = useFinance();
  const { getMonthDateRange } = finance;
  const { startDate, endDate } = getMonthDateRange();

  const totalIncome = finance.calculateTotalIncome(startDate, endDate);
  const totalExpenses = finance.calculateTotalExpenses(startDate, endDate);
  const balance = finance.calculateBalance(startDate, endDate);

  // Format currency for display
  const formatValue = (value: number) => finance.formatCurrency(value);

  return (
    <Card className="h-full">
      <CardHeader 
        title="Balanço" 
        description="Resumo do mês atual"
      />
      <CardContent>
        <div className="space-y-6">
          {/* Balance */}
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Saldo
            </p>
            <AnimatedNumber
              value={balance}
              formatter={formatValue}
              className="text-2xl font-bold"
            />
          </div>

          {/* Income & Expenses */}
          <div className="grid grid-cols-2 gap-4">
            {/* Income */}
            <StatValue
              title="Receitas"
              value={totalIncome}
              formatValue={formatValue}
              icon={<ArrowUpRight className="text-emerald-500" />}
              trend="up"
            />

            {/* Expenses */}
            <StatValue
              title="Despesas"
              value={totalExpenses}
              formatValue={formatValue}
              icon={<ArrowDownRight className="text-rose-500" />}
              trend="down"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default BalanceCard;
