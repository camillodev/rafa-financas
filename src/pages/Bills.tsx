
import React, { useState, useMemo } from 'react';
import { useFinance } from '@/context/FinanceContext';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import MonthFilter from '@/components/ui/MonthFilter';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  isBefore, 
  isAfter, 
  isSameDay, 
  addDays, 
  parseISO, 
  isValid 
} from 'date-fns';
import { 
  AlertCircle, 
  Check, 
  Clock, 
  Edit, 
  Plus, 
  ReceiptText, 
  Repeat, 
  Trash2,
  Calendar,
  Building,
  DollarSign,
  Tag 
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

// Interface for bills
interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: number;
  institutionId: string;
  billNumber?: string;
  isPaid: boolean;
  isRecurring: boolean;
  month: number;
  year: number;
}

const BillForm = ({
  bill,
  isOpen,
  onClose,
  onSave,
  financialInstitutions
}: {
  bill?: Bill;
  isOpen: boolean;
  onClose: () => void;
  onSave: (bill: Omit<Bill, 'id'>) => void;
  financialInstitutions: { id: string; name: string; }[];
}) => {
  const isEditing = !!bill;
  const currentDate = new Date();
  
  const [name, setName] = useState(bill?.name || '');
  const [amount, setAmount] = useState(bill?.amount.toString() || '');
  const [dueDate, setDueDate] = useState(bill?.dueDate.toString() || '');
  const [institutionId, setInstitutionId] = useState(bill?.institutionId || '');
  const [billNumber, setBillNumber] = useState(bill?.billNumber || '');
  const [isPaid, setIsPaid] = useState(bill?.isPaid || false);
  const [isRecurring, setIsRecurring] = useState(bill?.isRecurring || false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast.error('O nome da conta é obrigatório');
      return;
    }
    
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      toast.error('Informe um valor válido');
      return;
    }
    
    if (!dueDate || isNaN(Number(dueDate)) || Number(dueDate) < 1 || Number(dueDate) > 31) {
      toast.error('Informe um dia de vencimento válido entre 1 e 31');
      return;
    }
    
    if (!institutionId) {
      toast.error('Selecione uma instituição');
      return;
    }
    
    onSave({
      name,
      amount: Number(amount),
      dueDate: Number(dueDate),
      institutionId,
      billNumber: billNumber.trim() || undefined,
      isPaid,
      isRecurring,
      month: currentDate.getMonth(),
      year: currentDate.getFullYear()
    });
    
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Conta' : 'Nova Conta'}</DialogTitle>
          <DialogDescription>
            {isEditing 
              ? 'Atualize os dados da conta a pagar.' 
              : 'Preencha os dados da nova conta a pagar.'}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Conta</Label>
            <Input
              id="name"
              placeholder="Ex: Aluguel, Internet, etc."
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="dueDate">Dia de Vencimento</Label>
              <Input
                id="dueDate"
                type="number"
                min="1"
                max="31"
                placeholder="Dia"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="institution">Instituição</Label>
            <Select 
              value={institutionId}
              onValueChange={setInstitutionId}
            >
              <SelectTrigger id="institution">
                <SelectValue placeholder="Selecione uma instituição" />
              </SelectTrigger>
              <SelectContent>
                {financialInstitutions.map((institution) => (
                  <SelectItem key={institution.id} value={institution.id}>
                    {institution.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="billNumber">Número da Conta (opcional)</Label>
            <Input
              id="billNumber"
              placeholder="Número de referência"
              value={billNumber}
              onChange={(e) => setBillNumber(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isPaid"
              checked={isPaid}
              onCheckedChange={setIsPaid}
            />
            <Label htmlFor="isPaid">Conta Paga</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="isRecurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="isRecurring">Conta Recorrente</Label>
          </div>
          
          <DialogFooter>
            <Button type="submit">{isEditing ? 'Salvar Alterações' : 'Adicionar Conta'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const Bills = () => {
  const { financialInstitutions, formatCurrency, currentDate, setCurrentDate, navigateToPreviousMonth, navigateToNextMonth } = useFinance();
  
  // Bills state - in a real app this would come from context or API
  const [bills, setBills] = useState<Bill[]>([
    {
      id: '1',
      name: 'Aluguel',
      amount: 1200,
      dueDate: 10,
      institutionId: 'fi1',
      isPaid: true,
      isRecurring: true,
      month: new Date().getMonth(),
      year: new Date().getFullYear()
    },
    {
      id: '2',
      name: 'Internet',
      amount: 120,
      dueDate: 15,
      institutionId: 'fi2',
      billNumber: '98765432',
      isPaid: false,
      isRecurring: true,
      month: new Date().getMonth(),
      year: new Date().getFullYear()
    },
    {
      id: '3',
      name: 'Energia',
      amount: 250,
      dueDate: 20,
      institutionId: 'fi3',
      billNumber: '123456789',
      isPaid: false,
      isRecurring: true,
      month: new Date().getMonth(),
      year: new Date().getFullYear()
    }
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBill, setCurrentBill] = useState<Bill | undefined>(undefined);
  
  // Filter bills for current month/year
  const filteredBills = useMemo(() => {
    return bills.filter(bill => {
      return bill.month === currentDate.getMonth() && bill.year === currentDate.getFullYear();
    });
  }, [bills, currentDate]);
  
  // Group bills by status
  const { upcomingBills, overdueBills, paidBills } = useMemo(() => {
    const today = new Date();
    
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    return filteredBills.reduce(
      (acc, bill) => {
        // Create a date object for the bill's due date in the current month/year
        const dueDate = new Date(currentYear, currentMonth, bill.dueDate);
        
        if (bill.isPaid) {
          acc.paidBills.push(bill);
        } else if (isBefore(dueDate, today) && !isSameDay(dueDate, today)) {
          acc.overdueBills.push(bill);
        } else {
          acc.upcomingBills.push(bill);
        }
        
        return acc;
      },
      { upcomingBills: [] as Bill[], overdueBills: [] as Bill[], paidBills: [] as Bill[] }
    );
  }, [filteredBills, currentDate]);
  
  // Handle adding a new bill
  const handleAddBill = (billData: Omit<Bill, 'id'>) => {
    const newBill = {
      ...billData,
      id: `bill-${Date.now()}`,
    };
    
    setBills(prev => [...prev, newBill]);
    toast.success('Conta adicionada com sucesso');
  };
  
  // Handle editing a bill
  const handleEditBill = (billData: Omit<Bill, 'id'>) => {
    if (!currentBill) return;
    
    setBills(prev => 
      prev.map(bill => 
        bill.id === currentBill.id 
          ? { ...bill, ...billData } 
          : bill
      )
    );
    
    toast.success('Conta atualizada com sucesso');
  };
  
  // Handle deleting a bill
  const handleDeleteBill = (id: string) => {
    setBills(prev => prev.filter(bill => bill.id !== id));
    toast.success('Conta excluída com sucesso');
  };
  
  // Handle toggling payment status
  const handleTogglePaid = (id: string) => {
    setBills(prev => 
      prev.map(bill => 
        bill.id === id 
          ? { ...bill, isPaid: !bill.isPaid } 
          : bill
      )
    );
    
    toast.success('Status de pagamento atualizado');
  };
  
  // Open edit dialog
  const openEditDialog = (bill: Bill) => {
    setCurrentBill(bill);
    setIsDialogOpen(true);
  };
  
  // Open add dialog
  const openAddDialog = () => {
    setCurrentBill(undefined);
    setIsDialogOpen(true);
  };
  
  // Get institution name by ID
  const getInstitutionName = (id: string) => {
    const institution = financialInstitutions.find(inst => inst.id === id);
    return institution ? institution.name : 'Desconhecido';
  };
  
  // Render bills table
  const renderBillsTable = (bills: Bill[], type: 'upcoming' | 'overdue' | 'paid') => {
    if (bills.length === 0) {
      return (
        <div className="py-4 text-center text-muted-foreground">
          {type === 'upcoming' && 'Não há contas a vencer.'}
          {type === 'overdue' && 'Não há contas atrasadas.'}
          {type === 'paid' && 'Não há contas pagas neste mês.'}
        </div>
      );
    }
    
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead className="hidden md:table-cell">Vencimento</TableHead>
            <TableHead className="hidden md:table-cell">Instituição</TableHead>
            <TableHead className="hidden md:table-cell">Status</TableHead>
            <TableHead>Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {bills.map(bill => (
            <TableRow key={bill.id}>
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {bill.name}
                  {bill.isRecurring && (
                    <Repeat className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </div>
                {bill.billNumber && (
                  <span className="text-xs text-muted-foreground block md:hidden">
                    Ref: {bill.billNumber}
                  </span>
                )}
              </TableCell>
              <TableCell>{formatCurrency(bill.amount)}</TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>
                    Dia {bill.dueDate}
                  </span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex items-center gap-1.5">
                  <Building className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{getInstitutionName(bill.institutionId)}</span>
                </div>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {type === 'overdue' && (
                  <Badge variant="destructive">Atrasada</Badge>
                )}
                {type === 'upcoming' && (
                  <Badge variant="outline">A vencer</Badge>
                )}
                {type === 'paid' && (
                  <Badge variant="success">Paga</Badge>
                )}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleTogglePaid(bill.id)}
                  >
                    {bill.isPaid ? <Clock className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => openEditDialog(bill)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteBill(bill.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };
  
  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Contas a Pagar</h1>
          
          <Button onClick={openAddDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Conta
          </Button>
        </div>
        
        <div className="flex justify-center">
          <MonthFilter 
            currentDate={currentDate}
            onPreviousMonth={navigateToPreviousMonth}
            onNextMonth={navigateToNextMonth}
          />
        </div>
        
        <div className="grid gap-6">
          {overdueBills.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-destructive flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Contas Atrasadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderBillsTable(overdueBills, 'overdue')}
              </CardContent>
            </Card>
          )}
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2">
                <ReceiptText className="h-5 w-5" />
                Contas a Vencer
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderBillsTable(upcomingBills, 'upcoming')}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-green-600">
                <Check className="h-5 w-5" />
                Contas Pagas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {renderBillsTable(paidBills, 'paid')}
            </CardContent>
          </Card>
        </div>
      </div>
      
      <BillForm
        bill={currentBill}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSave={currentBill ? handleEditBill : handleAddBill}
        financialInstitutions={financialInstitutions.map(fi => ({ id: fi.id, name: fi.name }))}
      />
    </AppLayout>
  );
};

export default Bills;
