
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
import { Moon, Sun, Monitor, Database, Trash2, Layers, Receipt, PieChart, CreditCard, Target, Split } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/lib/auth';
import { FeatureKey, useFeatureFlags } from '@/context/FeatureFlagsContext';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { isSupabaseReady } = useAuth();

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value);
  };

  // Map of feature keys to their display names and icons
  const featureDetails = {
    bills: {
      label: "Contas a Pagar", 
      description: "Gerenciamento de contas e pagamentos",
      icon: <Receipt className="h-4 w-4 mr-2" /> 
    },
    budgets: {
      label: "Orçamentos", 
      description: "Planejamento de orçamentos mensais",
      icon: <Layers className="h-4 w-4 mr-2" /> 
    },
    reports: {
      label: "Relatórios", 
      description: "Relatórios e análises financeiras",
      icon: <PieChart className="h-4 w-4 mr-2" /> 
    },
    cards: {
      label: "Cartões", 
      description: "Gerenciamento de cartões de crédito",
      icon: <CreditCard className="h-4 w-4 mr-2" /> 
    },
    goals: {
      label: "Metas", 
      description: "Definição e acompanhamento de metas financeiras",
      icon: <Target className="h-4 w-4 mr-2" /> 
    },
    splitBills: {
      label: "Dividir Contas", 
      description: "Divisão de contas entre amigos e grupos",
      icon: <Split className="h-4 w-4 mr-2" /> 
    },
  };

  // Handler for toggling features (only works in development)
  const handleFeatureToggle = (key: FeatureKey) => {
    if (isDevelopment && 'toggleFeature' in featureFlagsContext) {
      // Type assertion to access the method safely
      const toggleFeature = featureFlagsContext.toggleFeature as (key: FeatureKey) => void;
      toggleFeature(key);
    }
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
        {/* Feature Flags section - only visible in development mode */}
        {isDevelopment && (
          <Card>
            <CardHeader>
              <CardTitle>Funcionalidades (Modo Desenvolvimento)</CardTitle>
              <CardDescription>
                Ative ou desative funcionalidades específicas do aplicativo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(featureDetails).map(([key, details]) => (
                <div key={key} className="flex items-center justify-between">
                  <div className="flex items-start flex-col space-y-1">
                    <div className="flex items-center">
                      {details.icon}
                      <Label htmlFor={`feature-${key}`} className="font-medium">
                        {details.label}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {details.description}
                    </p>
                  </div>
                  <Switch
                    id={`feature-${key}`}
                    checked={features[key]} 
                    onCheckedChange={() => handleFeatureToggle(key as FeatureKey)}
                  />
                </div>
              ))}

              <Alert className="bg-blue-50 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-900 mt-4">
                <AlertDescription>
                  Estas opções só são editáveis em ambiente de desenvolvimento. Em produção,
                  as funcionalidades são controladas por variáveis de ambiente.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

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
                  Metas atingidas
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações quando atingir suas metas financeiras
                </p>
              </div>
              <Switch id="notifications-goals" defaultChecked />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Settings;
