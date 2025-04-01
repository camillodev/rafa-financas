import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { 
  CreditCard as CreditCardIcon, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  MoreHorizontal,
  Archive,
  ArrowUpFromLine
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

export function Cards() {
  const { 
    creditCards, 
    financialInstitutions,
    formatCurrency, 
    addCreditCard, 
    updateCreditCard, 
    deleteCreditCard,
    archiveCreditCard,
    navigateToTransactions 
  } = useFinance();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCard, setEditingCard] = useState<(typeof creditCards)[0] | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    number: '',
    institution: '',
    brand: 'Visa', // Default value for required field
    limit: 0,
    closingDay: 1,
    dueDay: 10,
    color: '#4F46E5',
    institutionId: '', // Required field
    dueDate: 10, // Required field
  });
  
  const activeCards = creditCards.filter(card => !card.archived);
  const archivedCards = creditCards.filter(card => card.archived);
  
  const handleOpenAddDialog = () => {
    setEditingCard(null);
    // Initialize with default values for required fields
    setFormData({
      name: '',
      number: '',
      institution: '',
      brand: 'Visa',
      limit: 0,
      closingDay: 1,
      dueDay: 10,
      color: '#4F46E5',
      institutionId: financialInstitutions.length > 0 ? financialInstitutions[0].id : '',
      dueDate: 10,
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenEditDialog = (card: (typeof creditCards)[0]) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      number: card.number || '',
      institution: card.institution || '',
      brand: card.brand,
      limit: card.limit,
      closingDay: card.closingDay || 1,
      dueDay: card.dueDay || card.dueDate,
      color: card.color || '#4F46E5',
      institutionId: card.institutionId,
      dueDate: card.dueDate,
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (card: (typeof creditCards)[0]) => {
    setEditingCard(card);
    setIsDeleteDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCard(null);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      setFormData({ ...formData, [name]: parseFloat(value) || 0 });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cardData = {
      name: formData.name,
      number: formData.number,
      institution: formData.institution,
      brand: formData.brand,
      limit: formData.limit,
      closingDay: formData.closingDay,
      dueDay: formData.dueDay,
      color: formData.color,
      institutionId: formData.institutionId,
      dueDate: formData.dueDay,
      isActive: true,
      type: 'credit'
    };
    
    if (editingCard) {
      updateCreditCard(editingCard.id, cardData);
    } else {
      addCreditCard(cardData);
    }
    
    handleCloseDialog();
  };
  
  const handleDelete = () => {
    if (editingCard) {
      deleteCreditCard(editingCard.id);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleArchive = (id: string, archived: boolean) => {
    archiveCreditCard(id, archived);
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };
  
  const handleNavigateToTransactions = (cardId: string) => {
    navigateToTransactions('all', undefined, cardId);
  };
  
  const calculateUsedPercentage = (limit: number, used?: number) => {
    if (!limit || !used) return 0;
    const percentage = (used / limit) * 100;
    return Math.min(percentage, 100); // Cap at 100%
  };
  
  const renderCardItem = (card: (typeof creditCards)[0]) => {
    // Find the associated institution
    const institution = financialInstitutions.find(i => i.id === card.institutionId);
    
    // Safely calculate used percentage
    const usedPercentage = calculateUsedPercentage(card.limit, card.used);
    
    return (
      <Card key={card.id} className="overflow-hidden">
        <CardHeader className="pb-2" style={{ backgroundColor: `${card.color}10` }}>
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${card.color}30` }}
              >
                <CreditCardIcon size={20} style={{ color: card.color }} />
              </div>
              <div>
                <CardTitle className="text-lg">{card.name}</CardTitle>
                <CardDescription>
                  {card.brand} {card.number ? `•••• ${card.number.slice(-4)}` : ''}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreHorizontal size={16} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleNavigateToTransactions(card.id)}>
                  <ExternalLink size={16} className="mr-2" />
                  Ver Transações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenEditDialog(card)}>
                  <Edit size={16} className="mr-2" />
                  Editar
                </DropdownMenuItem>
                {card.archived ? (
                  <DropdownMenuItem onClick={() => handleArchive(card.id, false)}>
                    <ArrowUpFromLine size={16} className="mr-2" />
                    Desarquivar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => handleArchive(card.id, true)}>
                    <Archive size={16} className="mr-2" />
                    Arquivar
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem 
                  onClick={() => handleOpenDeleteDialog(card)}
                  className="text-destructive"
                >
                  <Trash2 size={16} className="mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm text-muted-foreground">Limite</span>
                <span className="text-sm font-medium">
                  {card.used !== undefined ? (
                    <>
                      {formatCurrency(card.used || 0)} / {formatCurrency(card.limit)}
                    </>
                  ) : (
                    formatCurrency(card.limit)
                  )}
                </span>
              </div>
              {card.used !== undefined && (
                <Progress value={usedPercentage} />
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground block">Banco</span>
                <span>{institution?.name || card.institution || 'Não definido'}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Vencimento</span>
                <span>Dia {card.dueDay || card.dueDate}</span>
              </div>
              <div>
                <span className="text-muted-foreground block">Fechamento</span>
                <span>Dia {card.closingDay || 'Não definido'}</span>
              </div>
            </div>
          </div>
        </CardContent>
        
        <CardFooter className="bg-muted/50 pt-2">
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={() => handleNavigateToTransactions(card.id)}
          >
            Ver Transações
          </Button>
        </CardFooter>
      </Card>
    );
  };
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Cartões de Crédito</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus cartões de crédito e acompanhe seus gastos
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Ativos ({activeCards.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Arquivados ({archivedCards.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={handleOpenAddDialog}>
          <Plus size={16} className="mr-1" />
          Novo Cartão
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeCards.length > 0 ? (
              activeCards.map(renderCardItem)
            ) : (
              <div className="col-span-full text-center p-12 border rounded-lg bg-muted/10">
                <CreditCardIcon size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum cartão de crédito</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione seus cartões de crédito para acompanhar seus gastos
                </p>
                <Button onClick={handleOpenAddDialog}>
                  <Plus size={16} className="mr-2" />
                  Adicionar Cartão
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="archived">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedCards.length > 0 ? (
              archivedCards.map(renderCardItem)
            ) : (
              <div className="col-span-full text-center p-12 border rounded-lg bg-muted/10">
                <Archive size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum cartão arquivado</h3>
                <p className="text-muted-foreground mb-4">
                  Cartões arquivados aparecerão aqui
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Card Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCard ? 'Editar Cartão' : 'Novo Cartão'}
            </DialogTitle>
            <DialogDescription>
              {editingCard 
                ? 'Edite os detalhes do cartão de crédito' 
                : 'Adicione um novo cartão de crédito'}
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
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="number">Número (últimos 4 dígitos)</Label>
                <Input 
                  id="number" 
                  name="number" 
                  value={formData.number} 
                  onChange={handleInputChange} 
                  maxLength={4}
                  placeholder="1234"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="institutionId">Instituição</Label>
                <Select 
                  value={formData.institutionId} 
                  onValueChange={(value) => handleSelectChange('institutionId', value)}
                >
                  <SelectTrigger>
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
                <Label htmlFor="brand">Bandeira</Label>
                <Select 
                  value={formData.brand} 
                  onValueChange={(value) => handleSelectChange('brand', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma bandeira" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Visa">Visa</SelectItem>
                    <SelectItem value="Mastercard">Mastercard</SelectItem>
                    <SelectItem value="American Express">American Express</SelectItem>
                    <SelectItem value="Elo">Elo</SelectItem>
                    <SelectItem value="Hipercard">Hipercard</SelectItem>
                    <SelectItem value="Outra">Outra</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="limit">Limite</Label>
                <Input 
                  id="limit" 
                  name="limit" 
                  type="number" 
                  step="0.01" 
                  value={formData.limit} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="closingDay">Dia de Fechamento</Label>
                  <Input 
                    id="closingDay" 
                    name="closingDay" 
                    type="number" 
                    min="1" 
                    max="31" 
                    value={formData.closingDay} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="dueDay">Dia de Vencimento</Label>
                  <Input 
                    id="dueDay" 
                    name="dueDay" 
                    type="number" 
                    min="1" 
                    max="31" 
                    value={formData.dueDay} 
                    onChange={handleInputChange} 
                    required 
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2">
                  <Input 
                    id="color" 
                    name="color" 
                    type="color" 
                    value={formData.color} 
                    onChange={handleInputChange} 
                    className="w-12 h-10 p-1"
                  />
                  <Input 
                    type="text" 
                    value={formData.color} 
                    onChange={(e) => setFormData({...formData, color: e.target.value})} 
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancelar
              </Button>
              <Button type="submit">
                {editingCard ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Cartão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o cartão "{editingCard?.name}"? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default Cards;
