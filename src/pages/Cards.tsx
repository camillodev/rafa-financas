
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { CreditCard, Edit, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AnimatedNumber from '@/components/ui/AnimatedNumber';
import { CreditCard as CreditCardType } from '@/types/finance';

const CARD_BRANDS = ['Visa', 'Mastercard', 'Elo', 'American Express', 'Hipercard', 'Outro'];

export function Cards() {
  const { 
    creditCards, 
    financialInstitutions,
    addCreditCard, 
    updateCreditCard, 
    deleteCreditCard,
    formatCurrency,
    navigateToTransactions,
  } = useFinance();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editCard, setEditCard] = useState<CreditCardType | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    limit: 0,
    brand: CARD_BRANDS[0],
    dueDate: 1,
    institutionId: '',
  });
  
  const handleOpenDialog = (card?: CreditCardType) => {
    if (card) {
      setEditCard(card);
      setFormData({
        name: card.name,
        limit: card.limit,
        brand: card.brand,
        dueDate: card.dueDate,
        institutionId: card.institutionId,
      });
    } else {
      setEditCard(null);
      setFormData({
        name: '',
        limit: 0,
        brand: CARD_BRANDS[0],
        dueDate: 1,
        institutionId: financialInstitutions.length > 0 ? financialInstitutions[0].id : '',
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditCard(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Make sure dueDate is between 1 and 31
    const validatedFormData = {
      ...formData,
      dueDate: Math.min(Math.max(formData.dueDate, 1), 31),
    };
    
    if (editCard) {
      updateCreditCard(editCard.id, validatedFormData);
    } else {
      addCreditCard(validatedFormData);
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
  
  const handleDelete = (id: string) => {
    deleteCreditCard(id);
  };
  
  const handleViewTransactions = (id: string) => {
    navigateToTransactions('all', undefined, id);
  };
  
  // Get institution name by id
  const getInstitutionName = (institutionId: string) => {
    const institution = financialInstitutions.find(inst => inst.id === institutionId);
    return institution ? institution.name : 'Desconhecido';
  };
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus cartões de crédito e visualize seus limites
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <div></div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus size={16} className="mr-1" />
          Novo Cartão
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creditCards.map((card) => (
          <div 
            key={card.id} 
            className="border rounded-lg p-4 transition hover:shadow-md cursor-pointer"
            onClick={() => handleViewTransactions(card.id)}
          >
            <div className="flex justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <CreditCard size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">{card.name}</h3>
                  <div className="text-xs text-muted-foreground">{card.brand}</div>
                </div>
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
                    handleOpenDialog(card);
                  }}>
                    <Edit size={16} className="mr-2" />
                    Editar
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(card.id);
                    }}
                  >
                    <Trash2 size={16} className="mr-2" />
                    Excluir
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            <div className="mt-4">
              <div className="text-sm text-muted-foreground mb-1">Limite</div>
              <div className="text-2xl font-medium">
                <AnimatedNumber 
                  value={card.limit} 
                  formatValue={(val) => formatCurrency(val)} 
                />
              </div>
            </div>
            
            <div className="mt-4 flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Instituição</span>
                <span className="text-sm font-medium">{getInstitutionName(card.institutionId)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vencimento</span>
                <span className="text-sm font-medium">Dia {card.dueDate}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editCard ? 'Editar Cartão' : 'Novo Cartão'}
            </DialogTitle>
            <DialogDescription>
              {editCard 
                ? 'Edite os detalhes do seu cartão de crédito' 
                : 'Adicione um novo cartão de crédito ao seu perfil'}
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
                <Label htmlFor="limit">Limite</Label>
                <Input 
                  id="limit" 
                  name="limit" 
                  type="number" 
                  step="0.01" 
                  value={formData.limit} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="brand">Bandeira</Label>
                <Select 
                  value={formData.brand} 
                  onValueChange={(value) => setFormData({...formData, brand: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma bandeira" />
                  </SelectTrigger>
                  <SelectContent>
                    {CARD_BRANDS.map(brand => (
                      <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="dueDate">Dia de Vencimento</Label>
                <Input 
                  id="dueDate" 
                  name="dueDate" 
                  type="number" 
                  min="1" 
                  max="31" 
                  value={formData.dueDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="institutionId">Instituição Financeira</Label>
                <Select 
                  value={formData.institutionId} 
                  onValueChange={(value) => setFormData({...formData, institutionId: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma instituição" />
                  </SelectTrigger>
                  <SelectContent>
                    {financialInstitutions.map(institution => (
                      <SelectItem key={institution.id} value={institution.id}>
                        {institution.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editCard ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default Cards;
