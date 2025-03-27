import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowDownIcon, ArrowUpIcon, PlusIcon } from 'lucide-react';
import { useFinance } from '@/hooks/useFinance';
import StatValue from '@/components/ui/atoms/StatValue';
import { useNavigate } from 'react-router-dom';

interface BalanceCardProps {
  className?: string;
}

export function BalanceCard({ className }: BalanceCardProps) {
  const finance = useFinance();
  const { formatCurrency } = finance;
  const navigate = useNavigate();

  // Navigation function
  const navigateToTransactions = () => {
    navigate('/transactions');
  };
  
  // Get financial summary
  const summary = finance.financialSummary || {
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0
  };
  
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Balanço Mensal</CardTitle>
        <CardDescription>Resumo financeiro do mês atual</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Saldo</span>
            <StatValue
              title="Saldo"
              value={summary.balance}
              formatValue={formatCurrency}
              className="text-xl font-bold"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Receitas</span>
              <StatValue
                title="Receitas"
                value={summary.totalIncome}
                formatValue={formatCurrency}
                icon={<ArrowUpIcon className="mr-1 h-4 w-4" />}
                trend="up"
              />
            </div>
            
            <div className="flex flex-col space-y-1">
              <span className="text-xs text-muted-foreground">Despesas</span>
              <StatValue
                title="Despesas"
                value={summary.totalExpenses}
                formatValue={formatCurrency}
                icon={<ArrowDownIcon className="mr-1 h-4 w-4" />}
                trend="down"
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full"
          onClick={() => navigateToTransactions()}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Nova transação
        </Button>
      </CardFooter>
    </Card>
  );
}

export default BalanceCard;
