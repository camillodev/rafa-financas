
import React, { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { useTheme } from '@/hooks/use-theme';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Monitor, Database, Trash2 } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { generateMockData, clearMockData } from '@/services/mockDataService';

const Settings = () => {
  const { theme, setTheme } = useTheme();
  const { isSupabaseReady, user } = useAuth();
  const [mockDataEnabled, setMockDataEnabled] = useState(false);
  const [isGeneratingData, setIsGeneratingData] = useState(false);
  const [isClearingData, setIsClearingData] = useState(false);

  // Load the mock data preference from localStorage
  useEffect(() => {
    const savedPreference = localStorage.getItem('mockDataEnabled');
    if (savedPreference !== null) {
      setMockDataEnabled(savedPreference === 'true');
    }
  }, []);

  const handleThemeChange = (value: "light" | "dark" | "system") => {
    setTheme(value);
  };

  const handleMockDataToggle = (checked: boolean) => {
    setMockDataEnabled(checked);
    localStorage.setItem('mockDataEnabled', checked.toString());
  };

  const handleGenerateMockData = async () => {
    if (!isSupabaseReady || !user) {
      toast.error('Você precisa estar autenticado para gerar dados de exemplo');
      return;
    }

    setIsGeneratingData(true);
    try {
      await generateMockData(user.id);
      toast.success('Dados de exemplo gerados com sucesso');
    } catch (error) {
      console.error('Error generating mock data:', error);
      toast.error('Erro ao gerar dados de exemplo');
    } finally {
      setIsGeneratingData(false);
    }
  };

  const handleClearMockData = async () => {
    if (!isSupabaseReady || !user) {
      toast.error('Você precisa estar autenticado para limpar dados');
      return;
    }

    setIsClearingData(true);
    try {
      await clearMockData(user.id);
      toast.success('Dados removidos com sucesso');
    } catch (error) {
      console.error('Error clearing mock data:', error);
      toast.error('Erro ao limpar dados');
    } finally {
      setIsClearingData(false);
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
            <CardTitle>Dados de Exemplo</CardTitle>
            <CardDescription>
              Gere dados de exemplo para testar o aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="mock-data-toggle" className="font-medium">
                  Ativar dados de exemplo
                </Label>
                <p className="text-sm text-muted-foreground">
                  Habilite esta opção para usar dados de exemplo no aplicativo
                </p>
              </div>
              <Switch 
                id="mock-data-toggle" 
                checked={mockDataEnabled} 
                onCheckedChange={handleMockDataToggle} 
              />
            </div>

            {mockDataEnabled && (
              <>
                <Separator />
                <Alert className="bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-900">
                  <AlertDescription>
                    Os dados de exemplo são apenas para fins de demonstração e não representam dados reais.
                  </AlertDescription>
                </Alert>
                
                <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2 pt-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={handleGenerateMockData}
                    disabled={isGeneratingData || !isSupabaseReady}
                  >
                    <Database className="mr-2 h-4 w-4" />
                    {isGeneratingData ? 'Gerando...' : 'Gerar Dados de Exemplo'}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={handleClearMockData}
                    disabled={isClearingData || !isSupabaseReady}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isClearingData ? 'Limpando...' : 'Limpar Todos os Dados'}
                  </Button>
                </div>
              </>
            )}
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
