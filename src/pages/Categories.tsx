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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  AlertCircle, 
  TrendingUp,
  Briefcase,
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
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { toast } from "sonner";
import { Category, Subcategory } from '@/types/finance';

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
  const { categories, subcategories, addCategory, updateCategory, deleteCategory, addSubcategory, updateSubcategory, deleteSubcategory } = useFinance();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubcategoryDialogOpen, setIsSubcategoryDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteSubcategoryDialogOpen, setIsDeleteSubcategoryDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Subcategory | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: '',
    icon: 'home',
    color: '#38bdf8',
    type: 'expense' as 'income' | 'expense',
  });

  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    categoryId: '',
    color: '',
  });

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const toggleCategoryExpansion = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId) 
        : [...prev, categoryId]
    );
  };

  const getCategorySubcategories = (categoryId: string) => {
    return subcategories.filter(sc => sc.categoryId === categoryId);
  };

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

  const handleOpenAddSubcategoryDialog = (categoryId: string) => {
    setEditingSubcategory(null);
    const category = categories.find(c => c.id === categoryId);
    setSubcategoryFormData({
      name: '',
      categoryId,
      color: category?.color || '',
    });
    setIsSubcategoryDialogOpen(true);
  };

  const handleOpenEditSubcategoryDialog = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setSubcategoryFormData({
      name: subcategory.name,
      categoryId: subcategory.categoryId,
      color: subcategory.color || '',
    });
    setIsSubcategoryDialogOpen(true);
  };

  const handleOpenDeleteSubcategoryDialog = (subcategory: Subcategory) => {
    setEditingSubcategory(subcategory);
    setIsDeleteSubcategoryDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubcategoryInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSubcategoryFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setSubcategoryFormData(prev => ({
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
      updateCategory({
        id: editingCategory.id,
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
        type: formData.type,
        isActive: editingCategory.isActive
      });
    } else {
      addCategory({
        name: formData.name,
        icon: formData.icon,
        color: formData.color,
        type: formData.type,
        isActive: true
      });
    }
    
    setIsDialogOpen(false);
  };

  const handleSubmitSubcategory = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubcategory) {
      updateSubcategory({
        id: editingSubcategory.id,
        name: subcategoryFormData.name,
        categoryId: subcategoryFormData.categoryId,
        color: subcategoryFormData.color || undefined,
      });
    } else {
      addSubcategory({
        name: subcategoryFormData.name,
        categoryId: subcategoryFormData.categoryId,
        color: subcategoryFormData.color || undefined,
      });
    }
    
    setIsSubcategoryDialogOpen(false);
  };

  const handleConfirmDelete = () => {
    if (editingCategory) {
      deleteCategory(editingCategory.id);
      setIsDeleteDialogOpen(false);
      setEditingCategory(null);
    }
  };

  const handleConfirmDeleteSubcategory = () => {
    if (editingSubcategory) {
      deleteSubcategory(editingSubcategory.id);
      setIsDeleteSubcategoryDialogOpen(false);
      setEditingSubcategory(null);
    }
  };

  const handleTypeChange = (type: 'income' | 'expense') => {
    setFormData(prev => ({
      ...prev,
      type
    }));
  };

  const renderCategoryItem = (category: Category) => {
    const isExpanded = expandedCategories.includes(category.id);
    const categorySubcategories = getCategorySubcategories(category.id);
    
    return (
      <div key={category.id} className="border rounded-lg mb-2">
        <div 
          className="flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
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
              onClick={() => handleOpenAddSubcategoryDialog(category.id)}
              title="Adicionar Subcategoria"
            >
              <Plus size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => handleOpenEditDialog(category)}
              title="Editar Categoria"
            >
              <Pencil size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-destructive hover:text-destructive"
              onClick={() => handleOpenDeleteDialog(category)}
              title="Excluir Categoria"
            >
              <Trash2 size={16} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => toggleCategoryExpansion(category.id)}
              title={isExpanded ? "Recolher Subcategorias" : "Expandir Subcategorias"}
            >
              {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </Button>
          </div>
        </div>
        
        {isExpanded && (
          <div className="pl-12 pr-4 pb-3">
            {categorySubcategories.length > 0 ? (
              categorySubcategories.map(subcategory => (
                <div 
                  key={subcategory.id}
                  className="flex items-center justify-between py-2 border-b last:border-b-0"
                >
                  <span className="text-sm">{subcategory.name}</span>
                  <div className="flex items-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleOpenEditSubcategoryDialog(subcategory)}
                      className="h-8 w-8"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-destructive hover:text-destructive h-8 w-8"
                      onClick={() => handleOpenDeleteSubcategoryDialog(subcategory)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-muted-foreground py-2">
                Nenhuma subcategoria cadastrada
              </div>
            )}
          </div>
        )}
      </div>
    );
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
              <div className="space-y-2">
                {incomeCategories.map(renderCategoryItem)}
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
              <div className="space-y-2">
                {expenseCategories.map(renderCategoryItem)}
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

      {/* Add/Edit Subcategory Dialog */}
      <Dialog open={isSubcategoryDialogOpen} onOpenChange={setIsSubcategoryDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSubcategory ? 'Editar Subcategoria' : 'Nova Subcategoria'}</DialogTitle>
            <DialogDescription>
              {editingSubcategory 
                ? 'Edite os detalhes da subcategoria abaixo.'
                : 'Preencha os detalhes da nova subcategoria abaixo.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitSubcategory}>
            <div className="grid gap-4 py-4">
              {editingSubcategory && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="categoryId" className="text-right">
                    Categoria
                  </Label>
                  <Select
                    value={subcategoryFormData.categoryId}
                    onValueChange={(value) => handleSelectChange('categoryId', value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Nome
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={subcategoryFormData.name}
                  onChange={handleSubcategoryInputChange}
                  className="col-span-3"
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">
                {editingSubcategory ? 'Salvar Alterações' : 'Adicionar Subcategoria'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation Dialog */}
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

      {/* Delete Subcategory Confirmation Dialog */}
      <Dialog open={isDeleteSubcategoryDialogOpen} onOpenChange={setIsDeleteSubcategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir esta subcategoria? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteSubcategoryDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDeleteSubcategory}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
