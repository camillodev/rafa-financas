
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { Edit, MoreHorizontal, Plus, Target, Trash2 } from 'lucide-react';
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

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  icon: string;
  color: string;
}

export function Goals() {
  // Mock data for goals
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: 'g1',
      name: 'Viagem para Europa',
      targetAmount: 15000,
      currentAmount: 6000,
      targetDate: '2023-12-31',
      category: 'Viagem',
      icon: 'target',
      color: '#4F46E5',
    },
    {
      id: 'g2',
      name: 'Comprar um carro',
      targetAmount: 60000,
      currentAmount: 35000,
      targetDate: '2024-06-30',
      category: 'Veículo',
      icon: 'target',
      color: '#10B981',
    },
    {
      id: 'g3',
      name: 'Reserva de emergência',
      targetAmount: 20000,
      currentAmount: 12000,
      targetDate: '2023-09-30',
      category: 'Economia',
      icon: 'target',
      color: '#F59E0B',
    },
  ]);
  
  const { formatCurrency, categories } = useFinance();
  
  const [openDialog, setOpenDialog] = useState(false);
  const [editGoal, setEditGoal] = useState<Goal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: '',
    category: '',
    color: '#4F46E5',
  });
  
  const handleOpenDialog = (goal?: Goal) => {
    if (goal) {
      setEditGoal(goal);
      setFormData({
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        targetDate: goal.targetDate,
        category: goal.category,
        color: goal.color,
      });
    } else {
      setEditGoal(null);
      setFormData({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        targetDate: new Date().toISOString().split('T')[0],
        category: categories.length > 0 ? categories[0].name : '',
        color: '#4F46E5',
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditGoal(null);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editGoal) {
      setGoals(goals.map(goal => 
        goal.id === editGoal.id ? { 
          ...goal, 
          ...formData, 
          icon: 'target',
        } : goal
      ));
    } else {
      const newGoal: Goal = {
        id: `g${goals.length + 1}`,
        ...formData,
        icon: 'target',
      };
      setGoals([...goals, newGoal]);
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
    setGoals(goals.filter(goal => goal.id !== id));
  };
  
  const calculateProgress = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
        <p className="text-muted-foreground mt-1">
          Acompanhe o progresso das suas metas financeiras
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <div></div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus size={16} className="mr-1" />
          Nova Meta
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.currentAmount, goal.targetAmount);
          const remainingAmount = goal.targetAmount - goal.currentAmount;
          
          return (
            <div key={goal.id} className="border rounded-lg p-4 hover:shadow-md">
              <div className="flex justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: `${goal.color}20` }}
                  >
                    <Target size={20} style={{ color: goal.color }} />
                  </div>
                  <div>
                    <h3 className="font-medium">{goal.name}</h3>
                    <div className="text-xs text-muted-foreground">{goal.category}</div>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleOpenDialog(goal)}>
                      <Edit size={16} className="mr-2" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive"
                      onClick={() => handleDelete(goal.id)}
                    >
                      <Trash2 size={16} className="mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progresso</span>
                  <span className="font-medium">{progress}%</span>
                </div>
                
                <div className="h-2 w-full bg-accent rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full"
                    style={{ 
                      width: `${progress}%`,
                      backgroundColor: goal.color,
                    }}
                  ></div>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="font-medium">
                    <AnimatedNumber 
                      value={goal.currentAmount} 
                      formatValue={(val) => formatCurrency(val)} 
                    />
                  </span>
                  <span className="text-muted-foreground">
                    {formatCurrency(goal.targetAmount)}
                  </span>
                </div>
              </div>
              
              <div className="mt-4 flex justify-between">
                <div>
                  <div className="text-xs text-muted-foreground">Faltam</div>
                  <div className="font-medium">
                    {formatCurrency(remainingAmount)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">Data Alvo</div>
                  <div className="font-medium">
                    {new Date(goal.targetDate).toLocaleDateString('pt-BR')}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editGoal ? 'Editar Meta' : 'Nova Meta'}
            </DialogTitle>
            <DialogDescription>
              {editGoal 
                ? 'Edite os detalhes da sua meta financeira' 
                : 'Adicione uma nova meta financeira para acompanhar seu progresso'}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Meta</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="targetAmount">Valor Alvo</Label>
                <Input 
                  id="targetAmount" 
                  name="targetAmount" 
                  type="number" 
                  step="0.01" 
                  value={formData.targetAmount} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="currentAmount">Valor Atual</Label>
                <Input 
                  id="currentAmount" 
                  name="currentAmount" 
                  type="number" 
                  step="0.01" 
                  value={formData.currentAmount} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="targetDate">Data Alvo</Label>
                <Input 
                  id="targetDate" 
                  name="targetDate" 
                  type="date" 
                  value={formData.targetDate} 
                  onChange={handleChange} 
                  required 
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData({...formData, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="color">Cor</Label>
                <div className="flex gap-2">
                  <Input 
                    id="color" 
                    name="color" 
                    type="color" 
                    value={formData.color} 
                    onChange={handleChange} 
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
                {editGoal ? 'Salvar Alterações' : 'Adicionar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

export default Goals;
