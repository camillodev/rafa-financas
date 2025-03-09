
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { Building, Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { FinancialInstitution } from '@/types/finance';

export function Institutions() {
  const { 
    financialInstitutions, 
    addFinancialInstitution, 
    updateFinancialInstitution, 
    deleteFinancialInstitution,
    formatCurrency,
    navigateToTransactions,
  } = useFinance();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editInstitution, setEditInstitution] = useState<FinancialInstitution | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    icon: '',
    currentBalance: 0,
    isActive: true,
  });
  
  const handleOpenDialog = (institution?: FinancialInstitution) => {
    if (institution) {
      setEditInstitution(institution);
      setFormData({
        name: institution.name,
        icon: institution.icon,
        currentBalance: institution.currentBalance,
        isActive: institution.isActive,
      });
    } else {
      setEditInstitution(null);
      setFormData({
        name: '',
        icon: 'building',
        currentBalance: 0,
        isActive: true,
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditInstitution(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editInstitution) {
      updateFinancialInstitution(editInstitution.id, formData);
    } else {
      addFinancialInstitution(formData);
    }
    
    handleCloseDialog();
  };
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleToggleActive = (id: string, isActive: boolean) => {
    updateFinancialInstitution(id, { isActive });
  };
  
  const handleDelete = (id: string) => {
    deleteFinancialInstitution(id);
  };
  
  const handleViewTransactions = (id: string) => {
    navigateToTransactions('all', id);
  };
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Instituições Financeiras</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie suas contas bancárias e visualize seus saldos
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <div></div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus size={16} className="mr-1" />
          Nova Instituição
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {financialInstitutions.map((institution) => (
          <div 
            key={institution.id} 
            className={`border rounded-lg p-4 transition-opacity ${!institution.isActive ? 'opacity-60' : ''}`}
            onClick={() => handleViewTransactions(institution.id)}
          >
            <div className="flex justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <Building size={20} className="text-primary" />
                </div>
                <h3 className="font-medium">{institution.name}</h3>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal size={16} />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDialog(institution);
                  }}>
                    <Edit size={16} className="mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(institution.id);
                    }}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-1">Saldo Atual</div>
              <div className="text-2xl font-medium">
                <AnimatedNumber 
                  value={institution.currentBalance} 
                  formatValue={(val) => formatCurrency(val)} 
                />
              </div>
            </div>
            
            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Status</span>
              <Switch 
                checked={institution.isActive} 
                onCheckedChange={(checked) => {
                  handleToggleActive(institution.id, checked);
                  // Prevent click event from propagating to parent
                  return false;
                }}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
        ))}
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editInstitution ? 'Editar Instituição' : 'Nova Instituição'}
            </DialogTitle>
            <DialogDescription>
              {editInstitution 
                ? 'Edite os detalhes da instituição financeira' 
                : 'Adicione uma nova instituição financeira ao seu perfil'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="currentBalance">Saldo Atual</Label>
                <Input 
                  id="currentBalance" 
                  name="currentBalance" 
                  type="number" 
                  step="0.01" 
                  value={formData.currentBalance} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="flex items-center gap-2">
                <Label htmlFor="isActive">Ativo</Label>
                <Switch 
                  id="isActive" 
                  checked={formData.isActive} 
                  onCheckedChange={(checked) => setFormData({...formData, isActive: checked})} 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editInstitution ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default Institutions;
