
import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTheme } from '@/hooks/use-theme';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Monitor } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/lib/auth';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { isSupabaseReady } = useAuth();

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value);
  };

  return (
    <AppLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Ajuste as preferências do aplicativo
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Tema</CardTitle>
            <CardDescription>
              Personalize a aparência da interface
            </CardDescription>
          </CardHeader>
          <CardContent>
            <RadioGroup 
              defaultValue={theme} 
              className="grid grid-cols-3 gap-4"
              onValueChange={handleThemeChange}
            >
              <div>
                <RadioGroupItem 
                  value="light" 
                  id="theme-light" 
                  className="peer sr-only" 
                  checked={theme === "light"}
                />
                <Label 
                  htmlFor="theme-light"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Sun className="mb-3 h-6 w-6" />
                  <span>Claro</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem 
                  value="dark" 
                  id="theme-dark" 
                  className="peer sr-only"
                  checked={theme === "dark"}
                />
                <Label 
                  htmlFor="theme-dark"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Moon className="mb-3 h-6 w-6" />
                  <span>Escuro</span>
                </Label>
              </div>
              
              <div>
                <RadioGroupItem 
                  value="system" 
                  id="theme-system" 
                  className="peer sr-only"
                  checked={theme === "system"}
                />
                <Label 
                  htmlFor="theme-system"
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                >
                  <Monitor className="mb-3 h-6 w-6" />
                  <span>Sistema</span>
                </Label>
              </div>
            </RadioGroup>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notificações</CardTitle>
            <CardDescription>
              Configure como deseja receber alertas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications-budget" className="font-medium">
                  Alertas de orçamento
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba alertas quando ultrapassar 80% do orçamento em uma categoria
                </p>
              </div>
              <Switch id="notifications-budget" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications-bills" className="font-medium">
                  Lembretes de contas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba lembretes de contas próximas do vencimento
                </p>
              </div>
              <Switch id="notifications-bills" defaultChecked />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications-goals" className="font-medium">
                  Progresso de metas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba atualizações sobre o progresso de suas metas financeiras
                </p>
              </div>
              <Switch id="notifications-goals" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
