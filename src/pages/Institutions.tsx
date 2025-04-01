import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { 
  Building, 
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export function Institutions() {
  const { 
    financialInstitutions, 
    formatCurrency, 
    addFinancialInstitution, 
    updateFinancialInstitution, 
    deleteFinancialInstitution,
    archiveFinancialInstitution,
    navigateToTransactions 
  } = useFinance();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingInstitution, setEditingInstitution] = useState<(typeof financialInstitutions)[0] | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'Bank',
    logoUrl: '',
    balance: 0,
    color: '#4F46E5',
    icon: 'building',
    currentBalance: 0,
    isActive: true
  });
  
  const activeInstitutions = financialInstitutions.filter(institution => !institution.archived);
  const archivedInstitutions = financialInstitutions.filter(institution => institution.archived);
  
  const handleOpenAddDialog = () => {
    setEditingInstitution(null);
    setFormData({
      name: '',
      type: 'Bank',
      logoUrl: '',
      balance: 0,
      color: '#4F46E5',
      icon: 'building',
      currentBalance: 0,
      isActive: true
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenEditDialog = (institution: (typeof financialInstitutions)[0]) => {
    setEditingInstitution(institution);
    setFormData({
      name: institution.name,
      type: institution.type || 'Bank',
      logoUrl: institution.logoUrl || '',
      balance: institution.balance || 0,
      color: institution.color || '#4F46E5',
      icon: 'building',
      isActive: institution.isActive,
      currentBalance: institution.balance || 0  
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (institution: (typeof financialInstitutions)[0]) => {
    setEditingInstitution(institution);
    setIsDeleteDialogOpen(true);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingInstitution(null);
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
    
    const institutionData = {
      name: formData.name,
      type: formData.type,
      logoUrl: formData.logoUrl,
      balance: formData.balance,
      color: formData.color,
      icon: formData.icon || 'building',
      currentBalance: formData.balance || 0,
      isActive: true
    };
    
    if (editingInstitution) {
      updateFinancialInstitution({
        id: editingInstitution.id,
        ...institutionData
      });
    } else {
      addFinancialInstitution(institutionData);
    }
    
    handleCloseDialog();
  };
  
  const handleDelete = () => {
    if (editingInstitution) {
      deleteFinancialInstitution(editingInstitution.id);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const handleArchive = (id: string, archived: boolean) => {
    archiveFinancialInstitution(id);
  };
  
  const handleNavigateToTransactions = (institutionId: string) => {
    navigateToTransactions('all', institutionId);
  };
  
  const renderInstitutionCard = (institution: (typeof financialInstitutions)[0]) => (
    <Card key={institution.id} className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between">
          <div className="flex items-center gap-3">
            {institution.logoUrl ? (
              <img 
                src={institution.logoUrl} 
                alt={institution.name} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: `${institution.color || '#4F46E5'}20` }}
              >
                <Building size={20} style={{ color: institution.color || '#4F46E5' }} />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{institution.name}</CardTitle>
              <CardDescription>{institution.type || 'Banco'}</CardDescription>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleNavigateToTransactions(institution.id)}>
                <ExternalLink size={16} className="mr-2" />
                Ver Transações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenEditDialog(institution)}>
                <Edit size={16} className="mr-2" />
                Editar
              </DropdownMenuItem>
              {institution.archived ? (
                <DropdownMenuItem onClick={() => handleArchive(institution.id, false)}>
                  <ArrowUpFromLine size={16} className="mr-2" />
                  Desarquivar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => handleArchive(institution.id, true)}>
                  <Archive size={16} className="mr-2" />
                  Arquivar
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => handleOpenDeleteDialog(institution)}
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
        <div className="flex flex-col space-y-1.5">
          <span className="text-sm text-muted-foreground">Saldo Atual</span>
          <span className="text-2xl font-semibold">
            {formatCurrency(institution.balance || 0)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="bg-muted/50 pt-2">
        <Button 
          variant="ghost" 
          className="w-full"
          onClick={() => handleNavigateToTransactions(institution.id)}
        >
          Ver Transações
        </Button>
      </CardFooter>
    </Card>
  );
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Instituições Financeiras</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie seus bancos e outras instituições financeiras
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <Tabs defaultValue="active" className="w-full">
          <TabsList>
            <TabsTrigger value="active">
              Ativos ({activeInstitutions.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              Arquivados ({archivedInstitutions.length})
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <Button onClick={handleOpenAddDialog}>
          <Plus size={16} className="mr-1" />
          Nova Instituição
        </Button>
      </div>
      
      <Tabs defaultValue="active">
        <TabsContent value="active">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeInstitutions.length > 0 ? (
              activeInstitutions.map(renderInstitutionCard)
            ) : (
              <div className="col-span-full text-center p-12 border rounded-lg bg-muted/10">
                <Building size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma instituição financeira</h3>
                <p className="text-muted-foreground mb-4">
                  Adicione seus bancos e outras instituições financeiras para acompanhar suas finanças
                </p>
                <Button onClick={handleOpenAddDialog}>
                  <Plus size={16} className="mr-2" />
                  Adicionar Instituição
                </Button>
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="archived">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {archivedInstitutions.length > 0 ? (
              archivedInstitutions.map(renderInstitutionCard)
            ) : (
              <div className="col-span-full text-center p-12 border rounded-lg bg-muted/10">
                <Archive size={48} className="mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhuma instituição arquivada</h3>
                <p className="text-muted-foreground mb-4">
                  Instituições arquivadas aparecerão aqui
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add/Edit Institution Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingInstitution ? 'Editar Instituição' : 'Nova Instituição'}
            </DialogTitle>
            <DialogDescription>
              {editingInstitution 
                ? 'Edite os detalhes da instituição financeira' 
                : 'Adicione uma nova instituição financeira'}
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
                <Label htmlFor="type">Tipo</Label>
                <Input 
                  id="type" 
                  name="type" 
                  value={formData.type} 
                  onChange={handleInputChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="logoUrl">URL do Logo (opcional)</Label>
                <Input 
                  id="logoUrl" 
                  name="logoUrl" 
                  value={formData.logoUrl} 
                  onChange={handleInputChange} 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="balance">Saldo Atual</Label>
                <Input 
                  id="balance" 
                  name="balance" 
                  type="number" 
                  step="0.01" 
                  value={formData.balance} 
                  onChange={handleInputChange} 
                  required 
                />
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
                {editingInstitution ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Instituição</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a instituição "{editingInstitution?.name}"? Esta ação não pode ser desfeita.
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

export default Institutions;
