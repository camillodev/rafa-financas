
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useFinance } from '@/context/FinanceContext';
import { 
  Target, 
  Plus, 
  Calendar, 
  ArrowUpRight,
  Coins,
  BanknoteIcon,
  LineChart,
  Trash2,
  Edit,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { differenceInMonths, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export function Goals() {
  const { 
    goals, 
    categories, 
    formatCurrency, 
    addGoal,
    deleteGoal,
    navigateToGoalDetail
  } = useFinance();
  
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<typeof goals[0] | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    targetDate: format(new Date().setMonth(new Date().getMonth() + 6), 'yyyy-MM-dd'),
    category: '',
    icon: 'target',
    color: '#4F46E5',
  });
  
  const handleOpenAddDialog = () => {
    setSelectedGoal(null);
    setFormData({
      name: '',
      targetAmount: 0,
      currentAmount: 0,
      targetDate: format(new Date().setMonth(new Date().getMonth() + 6), 'yyyy-MM-dd'),
      category: categories[0]?.name || '',
      icon: 'target',
      color: '#4F46E5',
    });
    setIsDialogOpen(true);
  };
  
  const handleOpenDeleteDialog = (goal: typeof goals[0]) => {
    setSelectedGoal(goal);
    setIsDeleteDialogOpen(true);
  };
  
  const handleViewGoal = (id: string) => {
    navigateToGoalDetail(id);
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    addGoal(formData);
    setIsDialogOpen(false);
  };
  
  const handleDelete = () => {
    if (selectedGoal) {
      deleteGoal(selectedGoal.id);
      setIsDeleteDialogOpen(false);
    }
  };
  
  const calculatePercentage = (current: number, target: number) => {
    return Math.min(Math.round((current / target) * 100), 100);
  };
  
  const calculateMonthlyContribution = (goal: typeof goals[0]) => {
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const monthsRemaining = Math.max(1, differenceInMonths(targetDate, today) || 1);
    const remainingAmount = Math.max(0, goal.targetAmount - goal.currentAmount);
    
    return remainingAmount / monthsRemaining;
  };
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Metas Financeiras</h1>
        <p className="text-muted-foreground mt-1">
          Defina e acompanhe o progresso das suas metas de economia
        </p>
      </div>
      
      <div className="flex justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">Suas Metas</h2>
        </div>
        <Button onClick={handleOpenAddDialog}>
          <Plus size={16} className="mr-2" />
          Nova Meta
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {goals.length > 0 ? (
          goals.map(goal => {
            const percentage = calculatePercentage(goal.currentAmount, goal.targetAmount);
            const monthlyContribution = calculateMonthlyContribution(goal);
            
            return (
              <Card key={goal.id} className="flex flex-col">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-3 items-center">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: `${goal.color}20` }}
                      >
                        <Target size={20} style={{ color: goal.color }} />
                      </div>
                      <div>
                        <CardTitle className="text-lg mb-1">{goal.name}</CardTitle>
                        <CardDescription>
                          {goal.category} - {format(new Date(goal.targetDate), 'MMM yyyy', { locale: ptBR })}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex">
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleOpenDeleteDialog(goal)}>
                        <Trash2 size={14} className="text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pb-2">
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <div>
                        <span className="text-sm text-muted-foreground">Valor Atual</span>
                        <p className="text-xl font-semibold">{formatCurrency(goal.currentAmount)}</p>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-sm text-muted-foreground">Meta</span>
                        <p className="text-xl font-semibold">{formatCurrency(goal.targetAmount)}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full transition-all duration-500 ease-out"
                          style={{ 
                            width: `${percentage}%`,
                            backgroundColor: goal.color
                          }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{percentage}% concluído</span>
                        <span>
                          Faltando {formatCurrency(goal.targetAmount - goal.currentAmount)}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-1 pt-2">
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Coins size={14} />
                        <span>Contribuição mensal recomendada</span>
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(monthlyContribution)}</p>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="mt-auto">
                  <Button 
                    variant="secondary" 
                    className="w-full flex justify-between items-center" 
                    onClick={() => handleViewGoal(goal.id)}
                  >
                    <span>Ver Detalhes</span>
                    <ArrowUpRight size={14} />
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          <div className="col-span-full text-center p-12 border rounded-lg bg-muted/10">
            <Target size={48} className="mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma meta definida</h3>
            <p className="text-muted-foreground mb-4">
              Defina suas metas financeiras e acompanhe seu progresso
            </p>
            <Button onClick={handleOpenAddDialog}>
              <Plus size={16} className="mr-2" />
              Criar Nova Meta
            </Button>
          </div>
        )}
      </div>
      
      {/* Add Goal Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Meta</DialogTitle>
            <DialogDescription>
              Defina uma nova meta financeira para acompanhar seu progresso
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
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="category">Categoria</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat.id} value={cat.name}>
                        {cat.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="Viagem">Viagem</SelectItem>
                    <SelectItem value="Veículo">Veículo</SelectItem>
                    <SelectItem value="Casa">Casa</SelectItem>
                    <SelectItem value="Educação">Educação</SelectItem>
                    <SelectItem value="Economia">Economia</SelectItem>
                    <SelectItem value="Outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="targetAmount">Valor da Meta</Label>
                  <Input
                    id="targetAmount"
                    name="targetAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="currentAmount">Valor Inicial (opcional)</Label>
                  <Input
                    id="currentAmount"
                    name="currentAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.currentAmount}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="targetDate">Data Alvo</Label>
                <Input
                  id="targetDate"
                  name="targetDate"
                  type="date"
                  value={formData.targetDate}
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
                    onChange={(e) => handleSelectChange('color', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Criar Meta</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Meta</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir a meta "{selectedGoal?.name}"? Esta ação não pode ser desfeita.
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

export default Goals;
