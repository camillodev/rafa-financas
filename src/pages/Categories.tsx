
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  Check, 
  X,
  FileSymlink,
  Briefcase,
  TrendingUp,
  Gift,
  Home,
  Utensils,
  Car,
  Film,
  ShoppingBag,
  Zap,
  Activity,
  Book,
  Repeat,
} from 'lucide-react';
import { toast } from "sonner";
import { Category } from '@/types/finance';

// Icons mapping for categories
const iconMapping: Record<string, React.ReactNode> = {
  'briefcase': <Briefcase />,
  'trending-up': <TrendingUp />,
  'gift': <Gift />,
  'home': <Home />,
  'utensils': <Utensils />,
  'car': <Car />,
  'film': <Film />,
  'shopping-bag': <ShoppingBag />,
  'zap': <Zap />,
  'activity': <Activity />,
  'book': <Book />,
  'repeat': <Repeat />,
};

const iconOptions = Object.keys(iconMapping);

const colorOptions = [
  '#38bdf8', '#4ade80', '#a78bfa', '#f97316', '#f43f5e', 
  '#10b981', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6', 
  '#6366f1', '#f59e0b'
];

export default function Categories() {
  const { categories } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'home',
    color: '#38bdf8',
    type: 'expense' as 'income' | 'expense',
  });

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleOpenAddDialog = () => {
    setEditingCategory(null);
    setFormData({
      name: '',
      icon: 'home',
      color: '#38bdf8',
      type: 'expense',
    });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
      type: category.type,
    });
    setIsDialogOpen(true);
  };

  const handleOpenDeleteDialog = (category: Category) => {
    setEditingCategory(category);
    setIsDeleteDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectIcon = (icon: string) => {
    setFormData(prev => ({
      ...prev,
      icon
    }));
  };

  const handleSelectColor = (color: string) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingCategory) {
      // Update category
      toast.success('Categoria atualizada com sucesso');
    } else {
      // Add new category
      toast.success('Nova categoria adicionada com sucesso');
    }
    
    setIsDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingCategory) {
      // Delete category
      toast.success('Categoria excluída com sucesso');
      setIsDeleteDialogOpen(false);
      setEditingCategory(null);
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type
    }));
  };

  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Categorias</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as categorias para organizar suas transações
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <Button onClick={handleOpenAddDialog} className="gap-1">
          <Plus size={16} />
          <span>Nova Categoria</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Income Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-finance-income flex items-center gap-2">
              <TrendingUp size={20} />
              Categorias de Receita
            </CardTitle>
            <CardDescription>
              Categorias para classificar suas receitas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {incomeCategories.length > 0 ? (
              <div className="space-y-4">
                {incomeCategories.map((category) => (
                  <div 
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}30`, color: category.color }}
                      >
                        {iconMapping[category.icon]}
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenEditDialog(category)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleOpenDeleteDialog(category)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <h4 className="text-lg font-medium">Sem categorias</h4>
                <p className="text-sm text-muted-foreground">
                  Não há categorias de receita cadastradas
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-finance-expense flex items-center gap-2">
              <ShoppingBag size={20} />
              Categorias de Despesa
            </CardTitle>
            <CardDescription>
              Categorias para classificar suas despesas
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenseCategories.length > 0 ? (
              <div className="space-y-4">
                {expenseCategories.map((category) => (
                  <div 
                    key={category.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}30`, color: category.color }}
                      >
                        {iconMapping[category.icon]}
                      </div>
                      <div>
                        <p className="font-medium">{category.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => handleOpenEditDialog(category)}
                      >
                        <Pencil size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleOpenDeleteDialog(category)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <h4 className="text-lg font-medium">Sem categorias</h4>
                <p className="text-sm text-muted-foreground">
                  Não há categorias de despesa cadastradas
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Category Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</DialogTitle>
            <DialogDescription>
              {editingCategory 
                ? 'Edite os detalhes da categoria abaixo.'
                : 'Preencha os detalhes da nova categoria abaixo.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="type" className="text-right">
                  Tipo
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Button
                    type="button"
                    variant={formData.type === 'income' ? 'default' : 'outline'}
                    className={formData.type === 'income' ? 'bg-finance-income text-white' : ''}
                    onClick={() => handleTypeChange('income')}
                  >
                    Receita
                  </Button>
                  <Button
                    type="button"
                    variant={formData.type === 'expense' ? 'default' : 'outline'}
                    className={formData.type === 'expense' ? 'bg-finance-expense text-white' : ''}
                    onClick={() => handleTypeChange('expense')}
                  >
                    Despesa
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="col-span-3"
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Ícone
                </Label>
                <div className="col-span-3 grid grid-cols-6 gap-2">
                  {iconOptions.map(icon => (
                    <Button
                      key={icon}
                      type="button"
                      variant="outline"
                      className={`h-10 w-10 p-0 ${formData.icon === icon ? 'ring-2 ring-primary' : ''}`}
                      onClick={() => handleSelectIcon(icon)}
                    >
                      {iconMapping[icon]}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label className="text-right pt-2">
                  Cor
                </Label>
                <div className="col-span-3 grid grid-cols-6 gap-2">
                  {colorOptions.map(color => (
                    <Button
                      key={color}
                      type="button"
                      variant="outline"
                      className={`h-8 w-8 p-0 ${formData.color === color ? 'ring-2 ring-primary' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => handleSelectColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingCategory ? 'Salvar Alterações' : 'Adicionar Categoria'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta categoria? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
