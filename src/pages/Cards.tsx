import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { 
  CreditCard, 
  Plus, 
  Edit, 
  Trash2, 
  ExternalLink, 
  MoreHorizontal, 
  Calendar, 
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
    limit: 0,
    closingDay: 1,
    dueDay: 10,
    color: '#4F46E5',
    brand: 'Visa',
    dueDate: 10,
    institutionId: '',
  });
  
  const activeCards = creditCards.filter(card => !card.archived);
  const archivedCards = creditCards.filter(card => card.archived);
  
  const handleOpenAddDialog = () => {
    setEditingCard(null);
    setFormData({
      name: '',
      number: '',
      institution: financialInstitutions.length > 0 ? financialInstitutions[0].id : '',
      limit: 0,
      closingDay: 1,
      dueDay: 10,
      color: '#4F46E5',
      brand: 'Visa',
      dueDate: 10,
      institutionId: financialInstitutions.length > 0 ? financialInstitutions[0].id : '',
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenEditDialog = (card: (typeof creditCards)[0]) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      number: card.number,
      institution: card.institution,
      limit: card.limit,
      closingDay: card.closingDay,
      dueDay: card.dueDay,
      color: card.color,
      brand: card.brand,
      dueDate: card.dueDay,
      institutionId: card.institution,
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
  
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'institution') {
      setFormData({ 
        ...formData, 
        [name]: value,
        institutionId: value
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const cardData = {
      ...formData,
      brand: formData.brand || 'Visa',
      dueDate: formData.dueDay || 10,
      institutionId: formData.institution
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
  
  const handleNavigateToTransactions = (cardId: string) => {
    navigateToTransactions('all', undefined, cardId);
  };
  
  const formatCardNumber = (number: string) => {
    if (!number) return '';
    
    const last4 = number.slice(-4);
    return `•••• ${last4}`;
  };
  
  const getInstitutionById = (id: string) => {
    return financialInstitutions.find(institution => institution.id === id);
  };
  
  const renderCardItem = (card: (typeof creditCards)[0]) => {
    const institution = getInstitutionById(card.institution);
    
    return (
      <Card key={card.id} className="overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${card.color}20` }}
              >
                <CreditCard size={20} style={{ color: card.color }} />
              </div>
              <div>
                <CardTitle className="text-lg">{card.name}</CardTitle>
                <CardDescription>
                  {institution?.name} - {formatCardNumber(card.number)}
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
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <div>
                <span className="text-sm text-muted-foreground">Limite</span>
                <p className="text-xl font-semibold">{formatCurrency(card.limit)}</p>
              </div>
              
              <div className="text-right">
                <span className="text-sm text-muted-foreground">Utilizado</span>
                <p className="text-xl font-semibold">{formatCurrency(card.used)}</p>
              </div>
            </div>
            
            <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
              <div 
                className="h-full transition-all duration-500 ease-out rounded-full"
                style={{ 
                  width: `${Math.min((card.used / card.limit) * 100, 100)}%`,
                  backgroundColor: card.color,
                }}
              ></div>
            </div>
            
            <div className="flex justify-between text-sm">
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Fechamento: dia {card.closingDay}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <Calendar size={14} />
                <span>Vencimento: dia {card.dueDay}</span>
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
                <CreditCard size={48} className="mx-auto text-muted-foreground mb-4" />
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
                <Label htmlFor="number">Número do Cartão</Label>
                <Input 
                  id="number" 
                  name="number" 
                  value={formData.number} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="**** **** **** ****"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="institution">Instituição</Label>
                <Select 
                  value={formData.institution} 
                  onValueChange={(value) => handleSelectChange('institution', value)}
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
