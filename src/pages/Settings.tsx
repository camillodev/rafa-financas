
import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Moon, Save, Sun } from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { toast } from 'sonner';
import { useFinance } from '@/context/FinanceContext';

export function Settings() {
  const { setTheme, theme } = useTheme();
  const { formatCurrency } = useFinance();
  
  const [formState, setFormState] = useState({
    name: 'Usuário',
    email: 'usuario@exemplo.com',
    currency: 'BRL',
    notifications: true,
    budgetAlerts: true,
    exportFormat: 'csv',
    exportPeriod: 'current-month'
  });
  
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
    toast.success(`Tema alterado para ${
      newTheme === 'dark' ? 'escuro' : 
      newTheme === 'light' ? 'claro' : 
      'sistema'
    }`);
  };
  
  const handleInputChange = (field: string, value: any) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSaveProfile = () => {
    toast.success('Perfil atualizado com sucesso');
  };
  
  const handleSavePreferences = () => {
    toast.success('Preferências salvas com sucesso');
  };
  
  const handleExportData = () => {
    toast.success('Dados exportados com sucesso');
  };
  
  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as configurações da sua conta e preferências
        </p>
      </div>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>
              Gerencie suas informações de perfil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleSaveProfile(); }}>
              <div className="grid gap-2">
                <Label htmlFor="name">Nome</Label>
                <Input 
                  id="name" 
                  value={formState.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formState.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <Button type="submit">
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Preferências</CardTitle>
            <CardDescription>
              Personalize sua experiência no aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <p className="text-muted-foreground text-sm">
                    Escolha o tema da interface
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-5 w-5 text-yellow-500" />
                  <Select 
                    value={theme}
                    onValueChange={handleThemeChange}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Tema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Escuro</SelectItem>
                      <SelectItem value="system">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                  <Moon className="h-5 w-5 text-blue-500" />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="currency">Moeda</Label>
                  <p className="text-muted-foreground text-sm">
                    Formato de exibição para valores monetários
                  </p>
                </div>
                <Select 
                  value={formState.currency}
                  onValueChange={(value) => handleInputChange('currency', value)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Moeda" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (R$)</SelectItem>
                    <SelectItem value="USD">Dólar (US$)</SelectItem>
                    <SelectItem value="EUR">Euro (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="notifications">Notificações</Label>
                  <p className="text-muted-foreground text-sm">
                    Receba alertas sobre atividades importantes
                  </p>
                </div>
                <Switch 
                  id="notifications" 
                  checked={formState.notifications}
                  onCheckedChange={(checked) => handleInputChange('notifications', checked)}
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="budget-alerts">Alertas de Orçamento</Label>
                  <p className="text-muted-foreground text-sm">
                    Notificações quando você estiver perto do limite orçamentário
                  </p>
                </div>
                <Switch 
                  id="budget-alerts" 
                  checked={formState.budgetAlerts}
                  onCheckedChange={(checked) => handleInputChange('budgetAlerts', checked)}
                />
              </div>
              
              <Button onClick={handleSavePreferences}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Preferências
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Exportar Dados</CardTitle>
            <CardDescription>
              Faça o download dos seus dados financeiros
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="export-format">Formato</Label>
                <Select 
                  value={formState.exportFormat}
                  onValueChange={(value) => handleInputChange('exportFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Formato de exportação" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="export-period">Período</Label>
                <Select 
                  value={formState.exportPeriod}
                  onValueChange={(value) => handleInputChange('exportPeriod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current-month">Mês Atual</SelectItem>
                    <SelectItem value="last-month">Mês Anterior</SelectItem>
                    <SelectItem value="last-3-months">Últimos 3 Meses</SelectItem>
                    <SelectItem value="last-6-months">Últimos 6 Meses</SelectItem>
                    <SelectItem value="current-year">Ano Atual</SelectItem>
                    <SelectItem value="all">Todos os Dados</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleExportData}>Exportar Dados</Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Exemplo de Visualização de Tema</CardTitle>
            <CardDescription>
              Visualize como os elementos aparecem no tema atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cartão de Exemplo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Este é um exemplo de cartão no tema atual.</p>
                    <Button className="mt-4">Botão</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-primary text-primary-foreground">
                  <CardHeader>
                    <CardTitle>Tema Primário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Exemplo de cores primárias</p>
                    <Button variant="secondary" className="mt-4">Botão</Button>
                  </CardContent>
                </Card>
                
                <Card className="bg-secondary text-secondary-foreground">
                  <CardHeader>
                    <CardTitle>Tema Secundário</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Exemplo de cores secundárias</p>
                    <Button variant="default" className="mt-4">Botão</Button>
                  </CardContent>
                </Card>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Texto em diferentes cores</Label>
                  <div className="space-y-1">
                    <p>Texto Normal: {formatCurrency(1250.75)}</p>
                    <p className="text-muted-foreground">Texto Neutro: {formatCurrency(1250.75)}</p>
                    <p className="text-primary">Texto Primário: {formatCurrency(1250.75)}</p>
                    <p className="text-green-500">Texto Positivo: {formatCurrency(1250.75)}</p>
                    <p className="text-red-500">Texto Negativo: {formatCurrency(-1250.75)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Botões em diferentes estilos</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="default">Padrão</Button>
                    <Button variant="secondary">Secundário</Button>
                    <Button variant="outline">Contorno</Button>
                    <Button variant="ghost">Fantasma</Button>
                    <Button variant="link">Link</Button>
                    <Button variant="destructive">Destruir</Button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

export default Settings;
